import json
from datetime import UTC, datetime

from fastapi import HTTPException
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.calendar_availability import AvailabilitySlot
from backend.app.calendar_tools import CALENDAR_TOOLS, execute_calendar_tool
from backend.app.config import Settings
from backend.app.models import Base, Conversation


def make_session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()


def test_calendar_tools_are_strict_and_closed() -> None:
    assert {tool["name"] for tool in CALENDAR_TOOLS} == {
        "calendar_check_availability",
        "calendar_create_event",
        "calendar_update_event",
        "calendar_cancel_event",
    }
    for tool in CALENDAR_TOOLS:
        assert tool["type"] == "function"
        assert tool["strict"] is True
        assert tool["parameters"]["additionalProperties"] is False
        assert set(tool["parameters"]["required"]) == set(tool["parameters"]["properties"])


def test_unknown_calendar_tool_fails_closed(tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()

    with pytest.raises(HTTPException) as exc_info:
        execute_calendar_tool(
            "calendar_read_token",
            "{}",
            session=session,
            conversation=conversation,
            settings=Settings(_env_file=None, google_token_path=tmp_path / "token.json"),
        )

    assert exc_info.value.status_code == 400


def test_extra_tool_argument_is_rejected(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()

    with pytest.raises(HTTPException) as exc_info:
        execute_calendar_tool(
            "calendar_check_availability",
            json.dumps({"visitor_timezone": "America/Sao_Paulo", "google_event_id": "secret"}),
            session=session,
            conversation=conversation,
            settings=Settings(_env_file=None, google_token_path=tmp_path / "token.json"),
        )

    assert exc_info.value.status_code == 400


def test_calendar_check_availability_output_exposes_only_slots(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()
    monkeypatch.setattr(
        "backend.app.calendar_tools.calendar_check_availability",
        lambda *_args, **_kwargs: [
            AvailabilitySlot(
                start=datetime(2026, 7, 27, 8, 0, tzinfo=UTC),
                end=datetime(2026, 7, 27, 8, 30, tzinfo=UTC),
                timezone="America/Sao_Paulo",
            )
        ],
    )

    result = execute_calendar_tool(
        "calendar_check_availability",
        json.dumps({"visitor_timezone": "America/Sao_Paulo"}),
        session=session,
        conversation=conversation,
        settings=Settings(_env_file=None, google_token_path=tmp_path / "token.json"),
    )

    assert result == {
        "slots": [
            {
                "start": "2026-07-27T08:00:00+00:00",
                "end": "2026-07-27T08:30:00+00:00",
                "timezone": "America/Sao_Paulo",
            }
        ]
    }
    assert "google_event_id" not in json.dumps(result)
    assert "summary" not in json.dumps(result)
