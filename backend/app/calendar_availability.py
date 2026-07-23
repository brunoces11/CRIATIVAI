from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, time, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import HTTPException
from google.auth.exceptions import GoogleAuthError
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_503_SERVICE_UNAVAILABLE

from backend.app.config import Settings, get_settings
from backend.app.google_oauth import ensure_google_oauth_config, save_credentials

WEEKLY_AVAILABILITY: dict[int, tuple[time, time]] = {
    0: (time(8, 0), time(15, 0)),
    1: (time(8, 0), time(19, 0)),
    2: (time(8, 0), time(15, 0)),
    3: (time(8, 0), time(19, 0)),
    4: (time(8, 0), time(15, 0)),
    5: (time(8, 0), time(19, 0)),
}


@dataclass(frozen=True)
class AvailabilitySlot:
    start: datetime
    end: datetime
    timezone: str


@dataclass(frozen=True)
class BusyWindow:
    start: datetime
    end: datetime


def calendar_check_availability(
    visitor_timezone: str,
    *,
    now: datetime | None = None,
    settings: Settings | None = None,
) -> list[AvailabilitySlot]:
    resolved_settings = settings or get_settings()
    visitor_tz = load_timezone(visitor_timezone)
    business_tz = load_timezone(resolved_settings.base_timezone)
    now_utc = ensure_aware_utc(now or datetime.now(UTC))
    search_start = now_utc + timedelta(hours=resolved_settings.calendar_min_notice_hours)
    search_end = now_utc + timedelta(days=resolved_settings.calendar_max_window_days)

    busy_windows = fetch_busy_windows(
        search_start,
        search_end,
        settings=resolved_settings,
    )
    return build_available_slots(
        search_start=search_start,
        search_end=search_end,
        business_tz=business_tz,
        visitor_tz=visitor_tz,
        busy_windows=busy_windows,
        slot_minutes=resolved_settings.calendar_slot_minutes,
        buffer_minutes=resolved_settings.calendar_buffer_minutes,
        limit=resolved_settings.calendar_suggestion_count,
    )


def build_available_slots(
    *,
    search_start: datetime,
    search_end: datetime,
    business_tz: ZoneInfo,
    visitor_tz: ZoneInfo,
    busy_windows: list[BusyWindow],
    slot_minutes: int,
    buffer_minutes: int,
    limit: int,
) -> list[AvailabilitySlot]:
    slots: list[AvailabilitySlot] = []
    duration = timedelta(minutes=slot_minutes)
    cursor_day = search_start.astimezone(business_tz).date()
    final_day = search_end.astimezone(business_tz).date()

    while cursor_day <= final_day and len(slots) < limit:
        window = WEEKLY_AVAILABILITY.get(cursor_day.weekday())
        if window is not None:
            window_start = datetime.combine(cursor_day, window[0], tzinfo=business_tz)
            window_end = datetime.combine(cursor_day, window[1], tzinfo=business_tz)
            cursor = round_up_to_next_quarter_hour(max(window_start.astimezone(UTC), search_start)).astimezone(business_tz)

            while cursor + duration <= window_end and len(slots) < limit:
                slot_start_utc = cursor.astimezone(UTC)
                slot_end_utc = (cursor + duration).astimezone(UTC)
                if slot_end_utc <= search_end and not overlaps_busy(slot_start_utc, slot_end_utc, busy_windows, buffer_minutes):
                    slots.append(
                        AvailabilitySlot(
                            start=slot_start_utc.astimezone(visitor_tz),
                            end=slot_end_utc.astimezone(visitor_tz),
                            timezone=visitor_tz.key,
                        )
                    )
                cursor += duration

        cursor_day = cursor_day + timedelta(days=1)

    return slots


def fetch_busy_windows(search_start: datetime, search_end: datetime, *, settings: Settings) -> list[BusyWindow]:
    service = build_calendar_service(settings)
    body = {
        "timeMin": to_rfc3339(search_start),
        "timeMax": to_rfc3339(search_end),
        "timeZone": settings.base_timezone,
        "items": [{"id": settings.google_calendar_id}],
    }

    try:
        response = service.freebusy().query(body=body).execute()
    except HttpError as exc:
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Calendar availability is unavailable") from exc

    calendar = response.get("calendars", {}).get(settings.google_calendar_id, {})
    if calendar.get("errors"):
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Calendar availability is unavailable")

    busy: list[BusyWindow] = []
    for item in calendar.get("busy", []):
        start = parse_google_datetime(item.get("start"))
        end = parse_google_datetime(item.get("end"))
        if start is not None and end is not None and start < end:
            busy.append(BusyWindow(start=start, end=end))
    return busy


def build_calendar_service(settings: Settings):
    ensure_google_oauth_config(settings)
    if not settings.google_token_path.is_file():
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Google Calendar is not connected")

    try:
        credentials = Credentials.from_authorized_user_file(str(settings.google_token_path), scopes=settings.google_oauth_scopes)
        if credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
            save_credentials(credentials, settings.google_token_path)
        if not credentials.valid:
            raise GoogleAuthError("Invalid Google Calendar credentials")
    except (ValueError, OSError, GoogleAuthError) as exc:
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Google Calendar is not connected") from exc

    return build("calendar", "v3", credentials=credentials, cache_discovery=False)


def overlaps_busy(slot_start: datetime, slot_end: datetime, busy_windows: list[BusyWindow], buffer_minutes: int) -> bool:
    buffer = timedelta(minutes=buffer_minutes)
    for busy in busy_windows:
        blocked_start = ensure_aware_utc(busy.start) - buffer
        blocked_end = ensure_aware_utc(busy.end) + buffer
        if slot_start < blocked_end and slot_end > blocked_start:
            return True
    return False


def round_up_to_next_quarter_hour(value: datetime) -> datetime:
    rounded = value.replace(second=0, microsecond=0)
    remainder = rounded.minute % 15
    if remainder:
        rounded += timedelta(minutes=15 - remainder)
    return rounded


def load_timezone(timezone_name: str) -> ZoneInfo:
    try:
        return ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError as exc:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Invalid timezone") from exc


def parse_google_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return ensure_aware_utc(datetime.fromisoformat(value.replace("Z", "+00:00")))


def ensure_aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def to_rfc3339(value: datetime) -> str:
    return ensure_aware_utc(value).isoformat().replace("+00:00", "Z")
