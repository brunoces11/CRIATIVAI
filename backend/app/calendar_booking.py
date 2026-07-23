from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import base64
import hashlib
import re

from fastapi import HTTPException
from googleapiclient.errors import HttpError
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND, HTTP_409_CONFLICT, HTTP_503_SERVICE_UNAVAILABLE

from backend.app.calendar_availability import calendar_check_availability, ensure_aware_utc, load_timezone, to_rfc3339
from backend.app.calendar_availability import build_calendar_service
from backend.app.config import Settings, get_settings
from backend.app.models import Booking, Conversation

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
IDEMPOTENCY_PATTERN = re.compile(r"^[A-Za-z0-9_-]{16,128}$")


@dataclass(frozen=True)
class CalendarBookingResult:
    booking_id: int
    google_event_id: str
    starts_at_utc: datetime
    ends_at_utc: datetime
    timezone: str
    status: str
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
    google_event_id = deterministic_google_event_id(idempotency_key)
    event = insert_google_event(
        google_event_id=google_event_id,
        participant_name=participant_name,
        participant_email=participant_email,
        starts_at=requested_start,
        ends_at=requested_end,
        timezone=visitor_timezone,
        settings=resolved_settings,
    )

    booking = Booking(
        conversation_id=conversation.id,
        google_event_id=google_event_id,
        participant_email=participant_email,
        starts_at_utc=requested_start.astimezone(UTC),
        ends_at_utc=requested_end.astimezone(UTC),
        timezone=visitor_timezone,
        status="confirmed",
        idempotency_key=idempotency_key,
        confirmed_at=datetime.now(UTC),
    )
    conversation.booking_state = "confirmed"
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking_result(booking, event=event)


def calendar_update_event(
    session: Session,
    *,
    conversation_id: int,
    booking_id: int,
    visitor_timezone: str,
    new_starts_at: datetime,
    confirmed: bool,
    settings: Settings | None = None,
) -> CalendarBookingResult:
    resolved_settings = settings or get_settings()
    if not confirmed:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Reschedule confirmation is required")

    booking = load_owned_confirmed_booking(session, conversation_id, booking_id)
    visitor_tz = load_timezone(visitor_timezone)
    requested_start = normalize_start(new_starts_at, visitor_tz)
    requested_end = requested_start + timedelta(minutes=resolved_settings.calendar_slot_minutes)
    ensure_slot_was_offered(requested_start, visitor_timezone, resolved_settings)
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
    return booking_result(booking, event=event)


def calendar_cancel_event(
    session: Session,
    *,
    conversation_id: int,
    booking_id: int,
    confirmed: bool,
    settings: Settings | None = None,
) -> CalendarBookingResult:
    resolved_settings = settings or get_settings()
    if not confirmed:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Cancellation confirmation is required")

    booking = load_owned_confirmed_booking(session, conversation_id, booking_id)
    delete_google_event(google_event_id=booking.google_event_id or "", settings=resolved_settings)
    booking.status = "cancelled"
    booking.cancelled_at = datetime.now(UTC)
    session.commit()
    session.refresh(booking)
    return booking_result(booking)


def validate_booking_request(participant_email: str, idempotency_key: str, confirmed: bool) -> None:
    if not confirmed:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Booking confirmation is required")
    if not EMAIL_PATTERN.fullmatch(participant_email):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Valid participant email is required")
    if not IDEMPOTENCY_PATTERN.fullmatch(idempotency_key):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Invalid idempotency key")


def ensure_slot_was_offered(requested_start: datetime, visitor_timezone: str, settings: Settings) -> None:
    requested_start_utc = ensure_aware_utc(requested_start)
    slots = calendar_check_availability(visitor_timezone, settings=settings)
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
    settings: Settings,
) -> dict:
    service = build_calendar_service(settings)
    body = {
        "id": google_event_id,
        "summary": settings.calendar_event_title,
        "description": settings.calendar_event_description,
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


def idempotency_key_fingerprint(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:16]


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
        meet_link=(event or {}).get("hangoutLink"),
    )
