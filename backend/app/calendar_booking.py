from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import base64
import hashlib
from html import escape
import logging
import re
from textwrap import shorten

from fastapi import HTTPException
from googleapiclient.errors import HttpError
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_409_CONFLICT, HTTP_503_SERVICE_UNAVAILABLE

from backend.app.calendar_availability import calendar_check_availability, ensure_aware_utc, load_timezone, to_rfc3339
from backend.app.calendar_availability import build_calendar_service
from backend.app.admin_records import sync_admin_record
from backend.app.config import Settings, get_settings
from backend.app.emailer import send_email
from backend.app.models import Booking, Conversation

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
IDEMPOTENCY_PATTERN = re.compile(r"^[A-Za-z0-9_-]{16,128}$")
logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class CalendarBookingResult:
    booking_id: int | None
    google_event_id: str
    starts_at_utc: datetime
    ends_at_utc: datetime
    timezone: str
    status: str
    participant_name: str | None = None
    participant_email: str | None = None
    conversation_summary: str | None = None
    meet_link: str | None = None


def calendar_create_event(
    session: Session,
    *,
    conversation_id: int,
    participant_name: str,
    participant_email: str,
    visitor_timezone: str,
    starts_at: datetime,
    idempotency_key: str,
    meeting_summary: str,
    confirmed: bool,
    settings: Settings | None = None,
) -> CalendarBookingResult:
    resolved_settings = settings or get_settings()
    validate_booking_request(participant_email, idempotency_key, confirmed)
    visitor_tz = load_timezone(visitor_timezone)
    requested_start = normalize_start(starts_at, visitor_tz)
    requested_end = requested_start + timedelta(minutes=resolved_settings.calendar_slot_minutes)

    existing = session.scalar(select(Booking).where(Booking.idempotency_key == idempotency_key))
    if existing is not None and existing.google_event_id is not None:
        return booking_result(existing)

    conversation = session.get(Conversation, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Conversation not found")

    ensure_slot_was_offered(requested_start, visitor_timezone, resolved_settings)
    conversation.visitor_name = participant_name.strip() or conversation.visitor_name
    conversation.visitor_email = participant_email
    conversation.visitor_timezone = visitor_timezone
    booking_summary = build_booking_summary(
        participant_name=participant_name,
        participant_email=participant_email,
        requested_start=requested_start,
        requested_end=requested_end,
        timezone=visitor_timezone,
        meeting_summary=meeting_summary,
    )
    google_event_id = deterministic_google_event_id(idempotency_key)
    event = insert_google_event(
        google_event_id=google_event_id,
        participant_name=participant_name,
        participant_email=participant_email,
        starts_at=requested_start,
        ends_at=requested_end,
        timezone=visitor_timezone,
        description=build_event_description(resolved_settings.calendar_event_description, booking_summary),
        settings=resolved_settings,
    )

    booking = Booking(
        conversation_id=conversation.id,
        google_event_id=google_event_id,
        participant_name=participant_name.strip() or None,
        participant_email=participant_email,
        starts_at_utc=requested_start.astimezone(UTC),
        ends_at_utc=requested_end.astimezone(UTC),
        timezone=visitor_timezone,
        status="confirmed",
        idempotency_key=idempotency_key,
        conversation_summary=booking_summary,
        confirmed_at=datetime.now(UTC),
    )
    conversation.booking_state = "confirmed"
    session.add(booking)
    session.commit()
    session.refresh(booking)
    sync_admin_record(
        session,
        user_from="booking",
        source_record_id=booking.id,
        name=booking.participant_name or conversation.visitor_name,
        email=booking.participant_email,
        company=conversation.visitor_company,
        timezone=booking.timezone,
        conversation_id=conversation.id,
    )
    result = booking_result(booking, event=event)
    send_calendar_owner_notification(settings=resolved_settings, action="created", booking=result)
    return result


def calendar_update_event(
    session: Session,
    *,
    participant_email: str,
    booking_id: int | None,
    visitor_timezone: str,
    new_starts_at: datetime,
    confirmed: bool,
    settings: Settings | None = None,
) -> CalendarBookingResult:
    resolved_settings = settings or get_settings()
    if not confirmed:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Reschedule confirmation is required")

    booking = try_load_booking_for_management(session, participant_email=participant_email, booking_id=booking_id, settings=resolved_settings)
    visitor_tz = load_timezone(visitor_timezone)
    requested_start = normalize_start(new_starts_at, visitor_tz)
    requested_end = requested_start + timedelta(minutes=resolved_settings.calendar_slot_minutes)
    ensure_slot_was_offered(requested_start, visitor_timezone, resolved_settings)

    if booking is None:
        google_booking = load_single_google_booking_for_management(session, participant_email=participant_email, settings=resolved_settings)
        event = patch_google_event(
            google_event_id=google_booking.google_event_id,
            starts_at=requested_start,
            ends_at=requested_end,
            timezone=visitor_timezone,
            settings=resolved_settings,
        )
        result = CalendarBookingResult(
            booking_id=google_booking.booking_id,
            google_event_id=google_booking.google_event_id,
            starts_at_utc=requested_start.astimezone(UTC),
            ends_at_utc=requested_end.astimezone(UTC),
            timezone=visitor_timezone,
            status="confirmed",
            participant_name=google_booking.participant_name,
            participant_email=google_booking.participant_email,
            conversation_summary=google_booking.conversation_summary,
            meet_link=event.get("hangoutLink") or google_booking.meet_link,
        )
        send_calendar_owner_notification(settings=resolved_settings, action="updated", booking=result)
        return result

    event = patch_google_event(
        google_event_id=booking.google_event_id or "",
        starts_at=requested_start,
        ends_at=requested_end,
        timezone=visitor_timezone,
        settings=resolved_settings,
    )

    booking.starts_at_utc = requested_start.astimezone(UTC)
    booking.ends_at_utc = requested_end.astimezone(UTC)
    booking.timezone = visitor_timezone
    session.commit()
    session.refresh(booking)
    result = booking_result(booking, event=event)
    send_calendar_owner_notification(settings=resolved_settings, action="updated", booking=result)
    return result


def calendar_cancel_event(
    session: Session,
    *,
    participant_email: str,
    booking_id: int | None,
    confirmed: bool,
    settings: Settings | None = None,
) -> CalendarBookingResult:
    resolved_settings = settings or get_settings()
    if not confirmed:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Cancellation confirmation is required")

    booking = try_load_booking_for_management(session, participant_email=participant_email, booking_id=booking_id, settings=resolved_settings)
    if booking is None:
        google_booking = load_single_google_booking_for_management(session, participant_email=participant_email, settings=resolved_settings)
        delete_google_event(google_event_id=google_booking.google_event_id, settings=resolved_settings)
        result = CalendarBookingResult(
            booking_id=google_booking.booking_id,
            google_event_id=google_booking.google_event_id,
            starts_at_utc=google_booking.starts_at_utc,
            ends_at_utc=google_booking.ends_at_utc,
            timezone=google_booking.timezone,
            status="cancelled",
            participant_name=google_booking.participant_name,
            participant_email=google_booking.participant_email,
            conversation_summary=google_booking.conversation_summary,
            meet_link=google_booking.meet_link,
        )
        send_calendar_owner_notification(settings=resolved_settings, action="cancelled", booking=result)
        return result

    delete_google_event(google_event_id=booking.google_event_id or "", settings=resolved_settings)
    booking.status = "cancelled"
    booking.cancelled_at = datetime.now(UTC)
    session.commit()
    session.refresh(booking)
    result = booking_result(booking)
    send_calendar_owner_notification(settings=resolved_settings, action="cancelled", booking=result)
    return result


def calendar_lookup_bookings(
    session: Session,
    *,
    participant_email: str,
    settings: Settings | None = None,
    now: datetime | None = None,
) -> list[CalendarBookingResult]:
    resolved_settings = settings or get_settings()
    normalized_email = participant_email.strip().lower()
    if not EMAIL_PATTERN.fullmatch(normalized_email):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Valid participant email is required")

    events = fetch_google_events_for_participant(
        participant_email=normalized_email,
        settings=resolved_settings,
        now=now,
    )
    local_bookings_by_event_id = {
        booking.google_event_id: booking
        for booking in session.scalars(
            select(Booking).where(
                func.lower(Booking.participant_email) == normalized_email,
                Booking.google_event_id.is_not(None),
            )
        )
        if booking.google_event_id
    }

    results = [
        booking_result_from_google_event(
            event,
            participant_email=normalized_email,
            local_booking=local_bookings_by_event_id.get(event.get("id")),
        )
        for event in events
    ]
    return sorted(results, key=lambda booking: booking.starts_at_utc)


def validate_booking_request(participant_email: str, idempotency_key: str, confirmed: bool) -> None:
    if not confirmed:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Booking confirmation is required")
    if not EMAIL_PATTERN.fullmatch(participant_email):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Valid participant email is required")
    if not IDEMPOTENCY_PATTERN.fullmatch(idempotency_key):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Invalid idempotency key")


def ensure_slot_was_offered(requested_start: datetime, visitor_timezone: str, settings: Settings) -> None:
    requested_start_utc = ensure_aware_utc(requested_start)
    slots = calendar_check_availability(visitor_timezone, requested_start=requested_start, settings=settings)
    if not any(ensure_aware_utc(slot.start) == requested_start_utc for slot in slots):
        raise HTTPException(status_code=HTTP_409_CONFLICT, detail="Requested slot is no longer available")


def insert_google_event(
    *,
    google_event_id: str,
    participant_name: str,
    participant_email: str,
    starts_at: datetime,
    ends_at: datetime,
    timezone: str,
    description: str,
    settings: Settings,
) -> dict:
    service = build_calendar_service(settings)
    body = {
        "id": google_event_id,
        "summary": settings.calendar_event_title,
        "description": description,
        "start": {"dateTime": to_rfc3339(starts_at), "timeZone": timezone},
        "end": {"dateTime": to_rfc3339(ends_at), "timeZone": timezone},
        "attendees": [{"email": participant_email, "displayName": participant_name.strip() or participant_email}],
        "transparency": "opaque",
        "guestsCanModify": False,
        "extendedProperties": {"private": {"criativaiEventId": idempotency_key_fingerprint(google_event_id)}},
    }
    if settings.calendar_add_google_meet:
        body["conferenceData"] = {"createRequest": {"requestId": google_event_id}}

    request = service.events().insert(
        calendarId=settings.google_calendar_id,
        body=body,
        sendUpdates="all",
        conferenceDataVersion=1 if settings.calendar_add_google_meet else 0,
    )

    try:
        return request.execute()
    except HttpError as exc:
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Calendar event could not be created") from exc


def patch_google_event(
    *,
    google_event_id: str,
    starts_at: datetime,
    ends_at: datetime,
    timezone: str,
    settings: Settings,
) -> dict:
    if not google_event_id:
        raise HTTPException(status_code=HTTP_409_CONFLICT, detail="Booking has no Calendar event")

    service = build_calendar_service(settings)
    body = {
        "start": {"dateTime": to_rfc3339(starts_at), "timeZone": timezone},
        "end": {"dateTime": to_rfc3339(ends_at), "timeZone": timezone},
    }
    try:
        return service.events().patch(
            calendarId=settings.google_calendar_id,
            eventId=google_event_id,
            body=body,
            sendUpdates="all",
            conferenceDataVersion=1 if settings.calendar_add_google_meet else 0,
        ).execute()
    except HttpError as exc:
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Calendar event could not be updated") from exc


def delete_google_event(*, google_event_id: str, settings: Settings) -> None:
    if not google_event_id:
        raise HTTPException(status_code=HTTP_409_CONFLICT, detail="Booking has no Calendar event")

    service = build_calendar_service(settings)
    try:
        service.events().delete(
            calendarId=settings.google_calendar_id,
            eventId=google_event_id,
            sendUpdates="all",
        ).execute()
    except HttpError as exc:
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Calendar event could not be cancelled") from exc


def deterministic_google_event_id(idempotency_key: str) -> str:
    digest = hashlib.sha256(idempotency_key.encode("utf-8")).digest()
    encoded = base64.b32hexencode(digest).decode("ascii").lower().rstrip("=")
    return f"cai{encoded[:40]}"


def load_owned_confirmed_booking(session: Session, conversation_id: int, booking_id: int) -> Booking:
    booking = session.scalar(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.conversation_id == conversation_id,
        )
    )
    if booking is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.status != "confirmed":
        raise HTTPException(status_code=HTTP_409_CONFLICT, detail="Booking is not confirmed")
    if not booking.google_event_id:
        raise HTTPException(status_code=HTTP_409_CONFLICT, detail="Booking has no Calendar event")
    return booking


def load_booking_for_management(
    session: Session,
    *,
    participant_email: str,
    booking_id: int | None,
    settings: Settings,
) -> Booking:
    normalized_email = participant_email.strip().lower()
    if not normalized_email:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Participant email is required")

    if booking_id is not None:
        booking = session.get(Booking, booking_id)
        if booking is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Booking not found")
        if booking.participant_email.strip().lower() != normalized_email:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Booking not found for this email")
        if booking.status != "confirmed":
            raise HTTPException(status_code=HTTP_409_CONFLICT, detail="Booking is not confirmed")
        if not booking.google_event_id:
            raise HTTPException(status_code=HTTP_409_CONFLICT, detail="Booking has no Calendar event")
        if not google_event_is_confirmed(booking.google_event_id, settings=settings or get_settings()):
            mark_booking_cancelled(session, booking)
            raise HTTPException(status_code=HTTP_409_CONFLICT, detail="Booking is no longer active in Google Calendar")
        return booking

    resolved_settings = settings or get_settings()
    matches = session.scalars(
        select(Booking)
        .where(
            func.lower(Booking.participant_email) == normalized_email,
            Booking.status == "confirmed",
            Booking.google_event_id.is_not(None),
        )
        .order_by(Booking.starts_at_utc.asc(), Booking.id.asc())
    ).all()
    matches = filter_live_google_bookings(session, matches, settings=resolved_settings)

    if not matches:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="No confirmed booking found for this email")
    if len(matches) == 1:
        return matches[0]

    raise HTTPException(
        status_code=HTTP_409_CONFLICT,
        detail={
            "message": "Multiple confirmed bookings found for this email.",
            "candidates": [booking_candidate(booking) for booking in matches],
        },
    )


def try_load_booking_for_management(
    session: Session,
    *,
    participant_email: str,
    booking_id: int | None,
    settings: Settings,
) -> Booking | None:
    try:
        return load_booking_for_management(session, participant_email=participant_email, booking_id=booking_id, settings=settings)
    except HTTPException as exc:
        if booking_id is None and exc.status_code == HTTP_404_NOT_FOUND:
            return None
        raise


def load_single_google_booking_for_management(
    session: Session,
    *,
    participant_email: str,
    settings: Settings,
) -> CalendarBookingResult:
    matches = calendar_lookup_bookings(session, participant_email=participant_email, settings=settings)
    if not matches:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="No confirmed booking found for this email")
    if len(matches) == 1:
        return matches[0]

    raise HTTPException(
        status_code=HTTP_409_CONFLICT,
        detail={
            "message": "Multiple confirmed bookings found for this email.",
            "candidates": [booking_result_candidate(booking) for booking in matches],
        },
    )


def idempotency_key_fingerprint(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


def booking_candidate(booking: Booking) -> dict[str, str | int | None]:
    starts_at = ensure_aware_utc(booking.starts_at_utc).astimezone(load_timezone(booking.timezone))
    ends_at = ensure_aware_utc(booking.ends_at_utc).astimezone(load_timezone(booking.timezone))
    return {
        "booking_id": booking.id,
        "participant_name": booking.participant_name,
        "participant_email": booking.participant_email,
        "starts_at": starts_at.isoformat(),
        "ends_at": ends_at.isoformat(),
        "timezone": booking.timezone,
        "status": booking.status,
    }


def booking_result_candidate(booking: CalendarBookingResult) -> dict[str, str | int | None]:
    starts_at = ensure_aware_utc(booking.starts_at_utc).astimezone(load_timezone(booking.timezone))
    ends_at = ensure_aware_utc(booking.ends_at_utc).astimezone(load_timezone(booking.timezone))
    return {
        "booking_id": booking.booking_id,
        "participant_name": booking.participant_name,
        "participant_email": booking.participant_email,
        "starts_at": starts_at.isoformat(),
        "ends_at": ends_at.isoformat(),
        "timezone": booking.timezone,
        "status": booking.status,
    }


def fetch_google_events_for_participant(
    *,
    participant_email: str,
    settings: Settings,
    now: datetime | None = None,
) -> list[dict]:
    service = build_calendar_service(settings)
    search_start = (now or datetime.now(UTC)).astimezone(UTC)
    search_end = search_start + timedelta(days=settings.calendar_lookup_window_days)
    events: list[dict] = []
    page_token: str | None = None

    try:
        while True:
            response = service.events().list(
                calendarId=settings.google_calendar_id,
                timeMin=to_rfc3339(search_start),
                timeMax=to_rfc3339(search_end),
                singleEvents=True,
                showDeleted=False,
                orderBy="startTime",
                maxResults=2500,
                pageToken=page_token,
            ).execute()
            for event in response.get("items", []):
                if event.get("status") == "cancelled":
                    continue
                if event_has_attendee_email(event, participant_email):
                    events.append(event)
            page_token = response.get("nextPageToken")
            if not page_token:
                return events
    except HttpError as exc:
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Calendar events could not be searched") from exc


def event_has_attendee_email(event: dict, participant_email: str) -> bool:
    return any(
        str(attendee.get("email", "")).strip().lower() == participant_email
        for attendee in event.get("attendees", []) or []
    )


def booking_result_from_google_event(
    event: dict,
    *,
    participant_email: str,
    local_booking: Booking | None = None,
) -> CalendarBookingResult:
    starts_at, timezone = parse_google_event_datetime(event.get("start", {}))
    ends_at, _end_timezone = parse_google_event_datetime(event.get("end", {}), fallback_timezone=timezone)
    attendee = matching_attendee(event, participant_email)
    return CalendarBookingResult(
        booking_id=local_booking.id if local_booking else None,
        google_event_id=event.get("id", ""),
        starts_at_utc=starts_at.astimezone(UTC),
        ends_at_utc=ends_at.astimezone(UTC),
        timezone=timezone,
        status=event.get("status") or "confirmed",
        participant_name=attendee.get("displayName") or (local_booking.participant_name if local_booking else None),
        participant_email=participant_email,
        conversation_summary=local_booking.conversation_summary if local_booking else event.get("description"),
        meet_link=event.get("hangoutLink"),
    )


def matching_attendee(event: dict, participant_email: str) -> dict:
    for attendee in event.get("attendees", []) or []:
        if str(attendee.get("email", "")).strip().lower() == participant_email:
            return attendee
    return {}


def parse_google_event_datetime(value: dict, *, fallback_timezone: str | None = None) -> tuple[datetime, str]:
    date_time = value.get("dateTime")
    timezone = value.get("timeZone") or fallback_timezone or "UTC"
    if not date_time:
        raise HTTPException(status_code=HTTP_409_CONFLICT, detail="Calendar event has no timed start/end")
    parsed = datetime.fromisoformat(str(date_time).replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=load_timezone(timezone))
    return parsed, timezone


def filter_live_google_bookings(session: Session, bookings: list[Booking], *, settings: Settings) -> list[Booking]:
    live_bookings: list[Booking] = []
    for booking in bookings:
        if not booking.google_event_id:
            continue
        if google_event_is_confirmed(booking.google_event_id, settings=settings):
            live_bookings.append(booking)
        else:
            mark_booking_cancelled(session, booking)
    return live_bookings


def google_event_is_confirmed(google_event_id: str, *, settings: Settings) -> bool:
    service = build_calendar_service(settings)
    try:
        event = service.events().get(calendarId=settings.google_calendar_id, eventId=google_event_id).execute()
    except HttpError as exc:
        if getattr(exc.resp, "status", None) == 404:
            return False
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Calendar event could not be verified") from exc
    return event.get("status") != "cancelled"


def mark_booking_cancelled(session: Session, booking: Booking) -> None:
    booking.status = "cancelled"
    booking.cancelled_at = booking.cancelled_at or datetime.now(UTC)
    session.add(booking)
    session.commit()


def build_booking_summary(
    *,
    participant_name: str,
    participant_email: str,
    requested_start: datetime,
    requested_end: datetime,
    timezone: str,
    meeting_summary: str,
) -> str:
    visitor_tz = load_timezone(timezone)
    start_local = ensure_aware_utc(requested_start).astimezone(visitor_tz)
    end_local = ensure_aware_utc(requested_end).astimezone(visitor_tz)
    summary_excerpt = compact_summary_excerpt(meeting_summary)
    name = participant_name.strip() or participant_email

    return "\n".join(
        [
            f"Participante: {name} ({participant_email})",
            f"Horário: {start_local:%d/%m/%Y %H:%M} - {end_local:%H:%M} ({timezone})",
            f"Resumo da conversa: {summary_excerpt}",
        ]
    )


def build_event_description(prefix: str, booking_summary: str) -> str:
    prefix_text = prefix.strip()
    if prefix_text:
        return f"{prefix_text}\n\n{booking_summary}"
    return booking_summary


def compact_summary_excerpt(summary: str | None) -> str:
    if not summary:
        return "Conversa curta focada em agendamento e confirmação de horário."

    flattened = " ".join(part.strip() for part in summary.splitlines() if part.strip())
    return shorten(flattened, width=220, placeholder="…")


def normalize_start(starts_at: datetime, visitor_tz) -> datetime:
    if starts_at.tzinfo is None:
        return starts_at.replace(tzinfo=visitor_tz)
    return starts_at.astimezone(visitor_tz)


def booking_result(booking: Booking, *, event: dict | None = None) -> CalendarBookingResult:
    return CalendarBookingResult(
        booking_id=booking.id,
        google_event_id=booking.google_event_id or "",
        starts_at_utc=ensure_aware_utc(booking.starts_at_utc),
        ends_at_utc=ensure_aware_utc(booking.ends_at_utc),
        timezone=booking.timezone,
        status=booking.status,
        participant_name=booking.participant_name,
        participant_email=booking.participant_email,
        conversation_summary=booking.conversation_summary,
        meet_link=(event or {}).get("hangoutLink"),
    )


def send_calendar_owner_notification(
    *,
    settings: Settings,
    action: str,
    booking: CalendarBookingResult,
) -> None:
    recipient = settings.calendar_notification_email.strip()
    if not recipient:
        return

    delivery = send_email(
        settings=settings,
        to_email=recipient,
        subject=calendar_owner_notification_subject(action, booking),
        text_body=calendar_owner_notification_text(action, booking),
        html_body=calendar_owner_notification_html(action, booking),
        reply_to=booking.participant_email,
    )
    if delivery.status == "sent":
        logger.info("Calendar owner notification sent: action=%s recipient=%s event_id=%s", action, recipient, booking.google_event_id)
    elif delivery.status == "pending_config":
        logger.warning(
            "Calendar owner notification skipped because SMTP is not fully configured: action=%s recipient=%s event_id=%s",
            action,
            recipient,
            booking.google_event_id,
        )
    else:
        logger.warning(
            "Calendar owner notification failed: action=%s recipient=%s event_id=%s error=%s",
            action,
            recipient,
            booking.google_event_id,
            delivery.error or "unknown",
        )


def calendar_owner_notification_subject(action: str, booking: CalendarBookingResult) -> str:
    action_label = {
        "created": "created",
        "updated": "updated",
        "cancelled": "cancelled",
    }.get(action, "changed")
    participant = booking.participant_name or booking.participant_email or "client"
    return f"[CriativAI Calendar] Event {action_label}: {participant}"


def calendar_owner_notification_text(action: str, booking: CalendarBookingResult) -> str:
    local_start, local_end = calendar_notification_local_times(booking)
    action_label = calendar_notification_action_label(action)
    return "\n".join(
        [
            f"Calendar event {action_label}",
            "",
            f"Created by: CriativAI scheduling assistant",
            f"Client name: {booking.participant_name or 'n/a'}",
            f"Client email: {booking.participant_email or 'n/a'}",
            f"Description: {booking.conversation_summary or 'n/a'}",
            f"Date: {local_start:%d/%m/%Y}",
            f"Time: {local_start:%H:%M} - {local_end:%H:%M} ({booking.timezone})",
            f"Link: {booking.meet_link or 'n/a'}",
            f"Google event ID: {booking.google_event_id}",
        ]
    )


def calendar_owner_notification_html(action: str, booking: CalendarBookingResult) -> str:
    local_start, local_end = calendar_notification_local_times(booking)
    action_label = escape(calendar_notification_action_label(action))
    meet_link = booking.meet_link
    link_html = f'<a href="{escape(meet_link, quote=True)}">{escape(meet_link)}</a>' if meet_link else "n/a"
    rows = [
        ("Created by", "CriativAI scheduling assistant"),
        ("Client name", booking.participant_name or "n/a"),
        ("Client email", booking.participant_email or "n/a"),
        ("Description", booking.conversation_summary or "n/a"),
        ("Date", f"{local_start:%d/%m/%Y}"),
        ("Time", f"{local_start:%H:%M} - {local_end:%H:%M} ({booking.timezone})"),
        ("Link", link_html),
        ("Google event ID", booking.google_event_id),
    ]
    rendered_rows = "\n".join(
        f"<tr><th>{escape(label)}</th><td>{value if label == 'Link' else escape(value)}</td></tr>"
        for label, value in rows
    )
    return f"""
    <h1>Calendar event {action_label}</h1>
    <table>
      <tbody>
        {rendered_rows}
      </tbody>
    </table>
    """


def calendar_notification_action_label(action: str) -> str:
    return {
        "created": "created",
        "updated": "updated",
        "cancelled": "cancelled",
    }.get(action, "changed")


def calendar_notification_local_times(booking: CalendarBookingResult) -> tuple[datetime, datetime]:
    visitor_tz = load_timezone(booking.timezone)
    return (
        ensure_aware_utc(booking.starts_at_utc).astimezone(visitor_tz),
        ensure_aware_utc(booking.ends_at_utc).astimezone(visitor_tz),
    )
