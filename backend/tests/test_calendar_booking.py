from datetime import UTC, datetime

from fastapi import HTTPException
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from backend.app.calendar_availability import AvailabilitySlot
from backend.app.calendar_booking import calendar_cancel_event, calendar_create_event, calendar_lookup_bookings, calendar_update_event, deterministic_google_event_id
from backend.app.config import Settings
from backend.app.emailer import EmailDeliveryResult
from backend.app.models import Base, AdminRecord, Booking, Conversation


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
        calendar_notification_email="bruno@criativai.site",
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


class FakeGet:
    def __init__(self, payload: dict):
        self.payload = payload

    def execute(self) -> dict:
        return self.payload


class FakeList:
    def __init__(self, payload: dict):
        self.payload = payload

    def execute(self) -> dict:
        return self.payload


class FakeEvents:
    def __init__(self):
        self.insert_calls: list[dict] = []
        self.patch_calls: list[dict] = []
        self.delete_calls: list[dict] = []
        self.get_calls: list[dict] = []
        self.list_calls: list[dict] = []
        self.events_by_id: dict[str, dict] = {}
        self.list_items: list[dict] = []

    def insert(self, **kwargs):
        self.insert_calls.append(kwargs)
        return FakeInsert(kwargs["body"])

    def patch(self, **kwargs):
        self.patch_calls.append(kwargs)
        return FakePatch(kwargs)

    def delete(self, **kwargs):
        self.delete_calls.append(kwargs)
        return FakeDelete()

    def get(self, **kwargs):
        self.get_calls.append(kwargs)
        event_id = kwargs["eventId"]
        return FakeGet(self.events_by_id.get(event_id, {"id": event_id, "status": "confirmed"}))

    def list(self, **kwargs):
        self.list_calls.append(kwargs)
        return FakeList({"items": self.list_items})


class FakeService:
    def __init__(self):
        self.events_resource = FakeEvents()

    def events(self):
        return self.events_resource


def capture_email(email_calls: list[dict]):
    def _capture(**kwargs):
        email_calls.append(kwargs)
        return EmailDeliveryResult(status="sent")

    return _capture


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
    email_calls: list[dict] = []
    monkeypatch.setattr("backend.app.calendar_booking.calendar_check_availability", lambda *_args, **_kwargs: [slot])
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)
    monkeypatch.setattr("backend.app.calendar_booking.send_email", capture_email(email_calls))

    result = calendar_create_event(
        session,
        conversation_id=conversation.id,
        participant_name="Bruno Cliente",
        participant_email="cliente@example.com",
        visitor_timezone="America/Sao_Paulo",
        starts_at=slot.start,
        idempotency_key="booking_1234567890abcdef",
        meeting_summary="O visitante quer conhecer a CriativAI.\nBusca apoio para automacao comercial.\nDeseja entender os proximos passos.",
        confirmed=True,
        settings=settings,
    )

    booking = session.scalar(select(Booking).where(Booking.id == result.booking_id))
    assert booking is not None
    assert booking.status == "confirmed"
    assert booking.participant_name == "Bruno Cliente"
    assert booking.participant_email == "cliente@example.com"
    assert booking.conversation_summary is not None
    assert booking.google_event_id == deterministic_google_event_id("booking_1234567890abcdef")
    assert session.query(AdminRecord).count() == 1
    assert result.meet_link == "https://meet.google.com/abc-defg-hij"
    assert conversation.visitor_name == "Bruno Cliente"
    assert conversation.visitor_email == "cliente@example.com"
    insert_call = fake_service.events_resource.insert_calls[0]
    assert insert_call["conferenceDataVersion"] == 1
    assert insert_call["sendUpdates"] == "all"
    assert insert_call["body"]["conferenceData"]["createRequest"]["requestId"] == booking.google_event_id
    assert insert_call["body"]["summary"] == "Reunião CriativAI"
    assert len(email_calls) == 1
    assert email_calls[0]["to_email"] == "bruno@criativai.site"
    assert email_calls[0]["reply_to"] == "cliente@example.com"
    assert "Event created" in email_calls[0]["subject"]
    assert "Client name: Bruno Cliente" in email_calls[0]["text_body"]
    assert "Link: https://meet.google.com/abc-defg-hij" in email_calls[0]["text_body"]


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
        meeting_summary="O visitante quer conhecer a CriativAI.\nBusca apoio para automacao comercial.\nDeseja entender os proximos passos.",
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
            meeting_summary="O visitante quer conhecer a CriativAI.\nBusca apoio para automacao comercial.\nDeseja entender os proximos passos.",
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
            meeting_summary="O visitante quer conhecer a CriativAI.\nBusca apoio para automacao comercial.\nDeseja entender os proximos passos.",
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
        participant_name="Bruno Cliente",
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
    email_calls: list[dict] = []
    monkeypatch.setattr("backend.app.calendar_booking.calendar_check_availability", lambda *_args, **_kwargs: [new_slot])
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)
    monkeypatch.setattr("backend.app.calendar_booking.send_email", capture_email(email_calls))

    result = calendar_update_event(
        session,
        participant_email="cliente@example.com",
        booking_id=None,
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
    assert len(email_calls) == 1
    assert email_calls[0]["to_email"] == "bruno@criativai.site"
    assert "Event updated" in email_calls[0]["subject"]
    assert "Date: 28/07/2026" in email_calls[0]["text_body"]


def test_update_event_rejects_ambiguous_email_matches(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    first_conversation = Conversation(session_id="session_1234567890abcdef")
    second_conversation = Conversation(session_id="session_abcdef1234567890")
    session.add_all([first_conversation, second_conversation])
    session.commit()
    first_booking = Booking(
        conversation_id=first_conversation.id,
        google_event_id="cai12345",
        participant_name="Cliente 1",
        participant_email="cliente@example.com",
        starts_at_utc=datetime(2026, 7, 27, 11, 0, tzinfo=UTC),
        ends_at_utc=datetime(2026, 7, 27, 11, 30, tzinfo=UTC),
        timezone="America/Sao_Paulo",
        status="confirmed",
        idempotency_key="booking_1234567890abcdef",
    )
    second_booking = Booking(
        conversation_id=second_conversation.id,
        google_event_id="cai12346",
        participant_name="Cliente 2",
        participant_email="cliente@example.com",
        starts_at_utc=datetime(2026, 7, 28, 11, 0, tzinfo=UTC),
        ends_at_utc=datetime(2026, 7, 28, 11, 30, tzinfo=UTC),
        timezone="America/Sao_Paulo",
        status="confirmed",
        idempotency_key="booking_abcdef1234567890",
    )
    session.add_all([first_booking, second_booking])
    session.commit()
    fake_service = FakeService()
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)

    with pytest.raises(HTTPException) as exc_info:
        calendar_update_event(
            session,
            participant_email="cliente@example.com",
            booking_id=None,
            visitor_timezone="America/Sao_Paulo",
            new_starts_at=datetime(2026, 7, 28, 12, 0, tzinfo=UTC),
            confirmed=True,
            settings=booking_settings(tmp_path),
        )

    assert exc_info.value.status_code == 409
    assert isinstance(exc_info.value.detail, dict)
    assert len(exc_info.value.detail["candidates"]) == 2


def test_update_event_can_patch_single_live_google_booking_without_local_row(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    new_slot = AvailabilitySlot(
        start=datetime(2026, 7, 27, 16, 0, tzinfo=UTC),
        end=datetime(2026, 7, 27, 16, 30, tzinfo=UTC),
        timezone="America/Sao_Paulo",
    )
    fake_service = FakeService()
    fake_service.events_resource.list_items = [
        {
            "id": "google-live-event",
            "status": "confirmed",
            "start": {"dateTime": "2026-07-27T09:00:00-03:00", "timeZone": "America/Sao_Paulo"},
            "end": {"dateTime": "2026-07-27T09:30:00-03:00", "timeZone": "America/Sao_Paulo"},
            "attendees": [{"email": "cliente@example.com", "displayName": "Cliente Vivo"}],
            "hangoutLink": "https://meet.google.com/live-event",
        }
    ]
    monkeypatch.setattr("backend.app.calendar_booking.calendar_check_availability", lambda *_args, **_kwargs: [new_slot])
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)

    result = calendar_update_event(
        session,
        participant_email="cliente@example.com",
        booking_id=None,
        visitor_timezone="America/Sao_Paulo",
        new_starts_at=new_slot.start,
        confirmed=True,
        settings=booking_settings(tmp_path),
    )

    assert result.booking_id is None
    assert result.google_event_id == "google-live-event"
    assert result.starts_at_utc == datetime(2026, 7, 27, 16, 0, tzinfo=UTC)
    patch_call = fake_service.events_resource.patch_calls[0]
    assert patch_call["eventId"] == "google-live-event"
    assert patch_call["sendUpdates"] == "all"


def test_lookup_bookings_reads_google_calendar_and_ignores_cancelled_local_rows(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()
    session.add_all(
        [
            Booking(
                conversation_id=conversation.id,
                google_event_id="cai12345",
                participant_name="Bruno Cliente",
                participant_email="cliente@example.com",
                starts_at_utc=datetime(2026, 7, 27, 11, 0, tzinfo=UTC),
                ends_at_utc=datetime(2026, 7, 27, 11, 30, tzinfo=UTC),
                timezone="America/Sao_Paulo",
                status="confirmed",
                idempotency_key="booking_1234567890abcdef",
            ),
            Booking(
                conversation_id=conversation.id,
                google_event_id="cai12346",
                participant_email="cliente@example.com",
                starts_at_utc=datetime(2026, 7, 28, 11, 0, tzinfo=UTC),
                ends_at_utc=datetime(2026, 7, 28, 11, 30, tzinfo=UTC),
                timezone="America/Sao_Paulo",
                status="cancelled",
                idempotency_key="booking_abcdef1234567890",
            ),
        ]
    )
    session.commit()
    fake_service = FakeService()
    fake_service.events_resource.list_items = [
        {
            "id": "cai12345",
            "status": "cancelled",
            "start": {"dateTime": "2026-07-27T08:00:00-03:00", "timeZone": "America/Sao_Paulo"},
            "end": {"dateTime": "2026-07-27T08:30:00-03:00", "timeZone": "America/Sao_Paulo"},
            "attendees": [{"email": "cliente@example.com", "displayName": "Bruno Cliente"}],
        },
        {
            "id": "google-live-event",
            "status": "confirmed",
            "start": {"dateTime": "2026-07-29T09:00:00-03:00", "timeZone": "America/Sao_Paulo"},
            "end": {"dateTime": "2026-07-29T09:30:00-03:00", "timeZone": "America/Sao_Paulo"},
            "attendees": [{"email": "cliente@example.com", "displayName": "Cliente Vivo"}],
            "hangoutLink": "https://meet.google.com/live-event",
        },
        {
            "id": "other-attendee",
            "status": "confirmed",
            "start": {"dateTime": "2026-07-30T09:00:00-03:00", "timeZone": "America/Sao_Paulo"},
            "end": {"dateTime": "2026-07-30T09:30:00-03:00", "timeZone": "America/Sao_Paulo"},
            "attendees": [{"email": "outra@example.com"}],
        },
    ]
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)

    result = calendar_lookup_bookings(
        session,
        participant_email="cliente@example.com",
        settings=booking_settings(tmp_path),
        now=datetime(2026, 7, 24, 12, 0, tzinfo=UTC),
    )

    assert len(result) == 1
    assert result[0].booking_id is None
    assert result[0].google_event_id == "google-live-event"
    assert result[0].participant_email == "cliente@example.com"
    assert result[0].participant_name == "Cliente Vivo"
    assert result[0].meet_link == "https://meet.google.com/live-event"
    list_call = fake_service.events_resource.list_calls[0]
    assert list_call["showDeleted"] is False
    assert list_call["singleEvents"] is True


def test_cancel_event_deletes_google_event_and_preserves_booking(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()
    booking = Booking(
        conversation_id=conversation.id,
        google_event_id="cai12345",
        participant_name="Bruno Cliente",
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
    email_calls: list[dict] = []
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)
    monkeypatch.setattr("backend.app.calendar_booking.send_email", capture_email(email_calls))

    result = calendar_cancel_event(
        session,
        participant_email="cliente@example.com",
        booking_id=None,
        confirmed=True,
        settings=booking_settings(tmp_path),
    )

    assert result.status == "cancelled"
    assert session.get(Booking, booking.id).cancelled_at is not None
    delete_call = fake_service.events_resource.delete_calls[0]
    assert delete_call["eventId"] == "cai12345"
    assert delete_call["sendUpdates"] == "all"
    assert len(email_calls) == 1
    assert email_calls[0]["to_email"] == "bruno@criativai.site"
    assert "Event cancelled" in email_calls[0]["subject"]
    assert "Client email: cliente@example.com" in email_calls[0]["text_body"]


def test_cancel_event_can_delete_single_live_google_booking_without_local_row(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    session = make_session()
    fake_service = FakeService()
    fake_service.events_resource.list_items = [
        {
            "id": "google-live-event",
            "status": "confirmed",
            "start": {"dateTime": "2026-07-27T09:00:00-03:00", "timeZone": "America/Sao_Paulo"},
            "end": {"dateTime": "2026-07-27T09:30:00-03:00", "timeZone": "America/Sao_Paulo"},
            "attendees": [{"email": "cliente@example.com", "displayName": "Cliente Vivo"}],
            "hangoutLink": "https://meet.google.com/live-event",
        }
    ]
    monkeypatch.setattr("backend.app.calendar_booking.build_calendar_service", lambda _settings: fake_service)

    result = calendar_cancel_event(
        session,
        participant_email="cliente@example.com",
        booking_id=None,
        confirmed=True,
        settings=booking_settings(tmp_path),
    )

    assert result.booking_id is None
    assert result.google_event_id == "google-live-event"
    assert result.status == "cancelled"
    delete_call = fake_service.events_resource.delete_calls[0]
    assert delete_call["eventId"] == "google-live-event"
    assert delete_call["sendUpdates"] == "all"
