from datetime import UTC, datetime
from zoneinfo import ZoneInfo

from fastapi import HTTPException
import pytest

from backend.app.calendar_availability import BusyWindow, build_available_slots, calendar_check_availability
from backend.app.config import Settings


def test_generates_slots_inside_approved_weekly_windows(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    settings = Settings(
        google_client_id="client-id",
        google_client_secret="client-secret",
        google_redirect_uri="http://localhost/callback",
        google_token_path=tmp_path / "token.json",
        calendar_suggestion_count=3,
        _env_file=None,
    )
    monkeypatch.setattr("backend.app.calendar_availability.fetch_busy_windows", lambda *_args, **_kwargs: [])

    slots = calendar_check_availability("America/Sao_Paulo", now=datetime(2026, 7, 24, 10, 0, tzinfo=UTC), settings=settings)

    assert [slot.start.isoformat() for slot in slots] == [
        "2026-07-25T08:00:00-03:00",
        "2026-07-25T08:30:00-03:00",
        "2026-07-25T09:00:00-03:00",
    ]
    assert all(slot.timezone == "America/Sao_Paulo" for slot in slots)


def test_dynamic_buffer_blocks_slots_around_existing_busy_windows() -> None:
    business_tz = ZoneInfo("America/Sao_Paulo")
    busy = [
        BusyWindow(
            start=datetime(2026, 7, 27, 12, 30, tzinfo=business_tz),
            end=datetime(2026, 7, 27, 13, 0, tzinfo=business_tz),
        )
    ]

    slots = build_available_slots(
        search_start=datetime(2026, 7, 27, 11, 30, tzinfo=business_tz).astimezone(UTC),
        search_end=datetime(2026, 7, 27, 15, 0, tzinfo=business_tz).astimezone(UTC),
        business_tz=business_tz,
        visitor_tz=business_tz,
        busy_windows=busy,
        slot_minutes=30,
        buffer_minutes=15,
        limit=10,
    )

    offered = [slot.start.strftime("%H:%M") for slot in slots]
    assert "12:00" not in offered
    assert "12:30" not in offered
    assert "13:00" not in offered
    assert "13:30" in offered


def test_rejects_invalid_visitor_timezone(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    settings = Settings(
        google_client_id="client-id",
        google_client_secret="client-secret",
        google_redirect_uri="http://localhost/callback",
        google_token_path=tmp_path / "token.json",
        _env_file=None,
    )
    monkeypatch.setattr("backend.app.calendar_availability.fetch_busy_windows", lambda *_args, **_kwargs: [])

    with pytest.raises(HTTPException) as exc_info:
        calendar_check_availability("Brazil/Imaginary", now=datetime(2026, 7, 24, 10, 0, tzinfo=UTC), settings=settings)

    assert exc_info.value.status_code == 400


def test_slots_are_returned_in_visitor_timezone_without_busy_details() -> None:
    slots = build_available_slots(
        search_start=datetime(2026, 7, 27, 11, 0, tzinfo=UTC),
        search_end=datetime(2026, 7, 27, 13, 0, tzinfo=UTC),
        business_tz=ZoneInfo("America/Sao_Paulo"),
        visitor_tz=ZoneInfo("America/New_York"),
        busy_windows=[],
        slot_minutes=30,
        buffer_minutes=15,
        limit=1,
    )

    assert slots[0].start.isoformat() == "2026-07-27T07:00:00-04:00"
    assert slots[0].end.isoformat() == "2026-07-27T07:30:00-04:00"
    assert not hasattr(slots[0], "summary")
    assert not hasattr(slots[0], "event_id")
