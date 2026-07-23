from datetime import UTC, datetime

from fastapi import HTTPException
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from backend.app.calendar_availability import AvailabilitySlot
from backend.app.calendar_booking import calendar_cancel_event, calendar_create_event, calendar_update_event, deterministic_google_event_id
from backend.app.config import Settings
from backend.app.models import Base, Booking, Conversation


def make_session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()


def booking_settings(tmp_path) -> Settings:
    return Settings(
        google_client_id="client-id",
        google_client_secret="client-secret",
        google_redirect_uri="http://localhost/callback",
        google_token_path=tmp_path / "token.json",
        _env_file=None,
    )


class FakeInsert:
    def __init__(self, payload: dict):
        self.payload = payload

    def execute(self) -> dict:
        return {"id": self.payload["id"], "hangoutLink": "https://meet.google.com/abc-defg-hij"}


class FakePatch:
    def __init__(self, payload: dict):
        self.payload = payload

    def execute(self) -> dict:
        return {"id": self.payload["eventId"], "hangoutLink": "https://meet.google.com/abc-defg-hij"}


class FakeDelete:
    def execute(self) -> dict:
        return {}


class FakeEvents:
    def __init__(self):
        self.insert_calls: list[dict] = []
        self.patch_calls: list[dict] = []
        self.delete_calls: list[dict] = []

    def insert(self, **kwargs):
        self.insert_calls.append(kwargs)
        return FakeInsert(kwargs["body"])

    def patch(self, **kwargs):
        self.patch_calls.append(kwargs)
        return FakePatch(kwargs)

    def delete(self, **kwargs):
        self.delete_calls.append(kwargs)
        return FakeDelete()


class FakeService:
    def __init__(self):
        self.events_resource = FakeEvents()

    def events(self):
        return self.events_resource


def test_create_event_persists_booking_and_google_meet(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    settings = booking_settings(tmp_path)
    slot = AvailabilitySlot(
        start=datetime(2026, 7, 27, 8, 0, tzinfo=UTC),
        end=datetime(2026, 7, 27, 8, 30, tzinfo=UTC),
        timezone="America/Sao_Paulo",
    )
    fake_service = FakeService()
    monkeypatch.setattr("backend.app.calendar_booking.calendar_check_availability", lambda *_args, **_kwargs: [slot])
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)

    result = calendar_create_event(
        session,
        conversation_id=conversation.id,
        participant_name="Bruno Cliente",
        participant_email="cliente@example.com",
        visitor_timezone="America/Sao_Paulo",
        starts_at=slot.start,
        idempotency_key="booking_1234567890abcdef",
        confirmed=True,
        settings=settings,
    )

    booking = session.scalar(select(Booking).where(Booking.id == result.booking_id))
    assert booking is not None
    assert booking.status == "confirmed"
    assert booking.google_event_id == deterministic_google_event_id("booking_1234567890abcdef")
    assert result.meet_link == "https://meet.google.com/abc-defg-hij"
    insert_call = fake_service.events_resource.insert_calls[0]
    assert insert_call["conferenceDataVersion"] == 1
    assert insert_call["sendUpdates"] == "all"
    assert insert_call["body"]["conferenceData"]["createRequest"]["requestId"] == booking.google_event_id
    assert insert_call["body"]["summary"] == "Reunião CriativAI"


def test_create_event_is_idempotent_without_second_google_insert(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()
    existing = Booking(
        conversation_id=conversation.id,
        google_event_id="cai12345",
        participant_email="cliente@example.com",
        starts_at_utc=datetime(2026, 7, 27, 11, 0, tzinfo=UTC),
        ends_at_utc=datetime(2026, 7, 27, 11, 30, tzinfo=UTC),
        timezone="America/Sao_Paulo",
        status="confirmed",
        idempotency_key="booking_1234567890abcdef",
    )
    session.add(existing)
    session.commit()
    fake_service = FakeService()
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)

    result = calendar_create_event(
        session,
        conversation_id=conversation.id,
        participant_name="Bruno Cliente",
        participant_email="cliente@example.com",
        visitor_timezone="America/Sao_Paulo",
        starts_at=datetime(2026, 7, 27, 8, 0, tzinfo=UTC),
        idempotency_key="booking_1234567890abcdef",
        confirmed=True,
        settings=booking_settings(tmp_path),
    )

    assert result.google_event_id == "cai12345"
    assert fake_service.events_resource.insert_calls == []


def test_create_event_requires_explicit_confirmation(tmp_path) -> None:
    with pytest.raises(HTTPException) as exc_info:
        calendar_create_event(
            make_session(),
            conversation_id=1,
            participant_name="Cliente",
            participant_email="cliente@example.com",
            visitor_timezone="America/Sao_Paulo",
            starts_at=datetime(2026, 7, 27, 8, 0, tzinfo=UTC),
            idempotency_key="booking_1234567890abcdef",
            confirmed=False,
            settings=booking_settings(tmp_path),
        )

    assert exc_info.value.status_code == 400


def test_create_event_rejects_slot_not_currently_offered(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()
    monkeypatch.setattr("backend.app.calendar_booking.calendar_check_availability", lambda *_args, **_kwargs: [])

    with pytest.raises(HTTPException) as exc_info:
        calendar_create_event(
            session,
            conversation_id=conversation.id,
            participant_name="Cliente",
            participant_email="cliente@example.com",
            visitor_timezone="America/Sao_Paulo",
            starts_at=datetime(2026, 7, 27, 8, 0, tzinfo=UTC),
            idempotency_key="booking_1234567890abcdef",
            confirmed=True,
            settings=booking_settings(tmp_path),
        )

    assert exc_info.value.status_code == 409


def test_update_event_uses_owned_booking_and_patches_google(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()
    booking = Booking(
        conversation_id=conversation.id,
        google_event_id="cai12345",
        participant_email="cliente@example.com",
        starts_at_utc=datetime(2026, 7, 27, 11, 0, tzinfo=UTC),
        ends_at_utc=datetime(2026, 7, 27, 11, 30, tzinfo=UTC),
        timezone="America/Sao_Paulo",
        status="confirmed",
        idempotency_key="booking_1234567890abcdef",
    )
    session.add(booking)
    session.commit()
    session.refresh(booking)
    new_slot = AvailabilitySlot(
        start=datetime(2026, 7, 28, 12, 0, tzinfo=UTC),
        end=datetime(2026, 7, 28, 12, 30, tzinfo=UTC),
        timezone="America/Sao_Paulo",
    )
    fake_service = FakeService()
    monkeypatch.setattr("backend.app.calendar_booking.calendar_check_availability", lambda *_args, **_kwargs: [new_slot])
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)

    result = calendar_update_event(
        session,
        conversation_id=conversation.id,
        booking_id=booking.id,
        visitor_timezone="America/Sao_Paulo",
        new_starts_at=new_slot.start,
        confirmed=True,
        settings=booking_settings(tmp_path),
    )

    assert result.google_event_id == "cai12345"
    assert result.starts_at_utc == datetime(2026, 7, 28, 12, 0, tzinfo=UTC)
    patch_call = fake_service.events_resource.patch_calls[0]
    assert patch_call["eventId"] == "cai12345"
    assert patch_call["sendUpdates"] == "all"


def test_update_event_rejects_booking_from_other_conversation(tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    other = Conversation(session_id="session_abcdef1234567890")
    session.add_all([conversation, other])
    session.commit()
    booking = Booking(
        conversation_id=other.id,
        google_event_id="cai12345",
        participant_email="cliente@example.com",
        starts_at_utc=datetime(2026, 7, 27, 11, 0, tzinfo=UTC),
        ends_at_utc=datetime(2026, 7, 27, 11, 30, tzinfo=UTC),
        timezone="America/Sao_Paulo",
        status="confirmed",
        idempotency_key="booking_1234567890abcdef",
    )
    session.add(booking)
    session.commit()

    with pytest.raises(HTTPException) as exc_info:
        calendar_update_event(
            session,
            conversation_id=conversation.id,
            booking_id=booking.id,
            visitor_timezone="America/Sao_Paulo",
            new_starts_at=datetime(2026, 7, 28, 12, 0, tzinfo=UTC),
            confirmed=True,
            settings=booking_settings(tmp_path),
        )

    assert exc_info.value.status_code == 404


def test_cancel_event_deletes_google_event_and_preserves_booking(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()
    booking = Booking(
        conversation_id=conversation.id,
        google_event_id="cai12345",
        participant_email="cliente@example.com",
        starts_at_utc=datetime(2026, 7, 27, 11, 0, tzinfo=UTC),
        ends_at_utc=datetime(2026, 7, 27, 11, 30, tzinfo=UTC),
        timezone="America/Sao_Paulo",
        status="confirmed",
        idempotency_key="booking_1234567890abcdef",
    )
    session.add(booking)
    session.commit()
    session.refresh(booking)
    fake_service = FakeService()
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)

    result = calendar_cancel_event(
        session,
        conversation_id=conversation.id,
        booking_id=booking.id,
        confirmed=True,
        settings=booking_settings(tmp_path),
    )

    assert result.status == "cancelled"
    assert session.get(Booking, booking.id).cancelled_at is not None
    delete_call = fake_service.events_resource.delete_calls[0]
    assert delete_call["eventId"] == "cai12345"
    assert delete_call["sendUpdates"] == "all"
