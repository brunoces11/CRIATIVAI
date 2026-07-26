from datetime import UTC, datetime, timedelta
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app import admin as admin_module
from backend.app.config import Settings
from backend.app.main import app
from backend.app.models import Base, Booking, Conversation, Message


def make_session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()


def test_admin_list_and_detail_hide_sensitive_fields() -> None:
    session = make_session()
    older = Conversation(
        session_id="older_session_123456",
        visitor_name="Ada",
        summary="Older summary",
        last_activity_at=datetime.now(UTC) - timedelta(hours=2),
    )
    newer = Conversation(
        session_id="newer_session_123456",
        visitor_email="person@example.com",
        visitor_company="Example Co",
        summary="Newer summary",
        last_activity_at=datetime.now(UTC),
    )
    session.add_all([older, newer])
    session.commit()
    session.add(Message(conversation_id=newer.id, role="user", content="Hello", status="completed", turn_id="turn_secret_123456"))
    session.add(Message(conversation_id=newer.id, role="assistant", content="Hi", status="completed", turn_id="turn_secret_123456"))
    session.commit()

    def override_session():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[admin_module.get_session] = override_session
    client = TestClient(app)

    try:
        list_response = client.get("/api/admin/conversations")
        assert list_response.status_code == 200
        listed = list_response.json()
        assert [item["id"] for item in listed] == [newer.id, older.id]
        assert "messages" not in listed[0]
        assert "session_id" not in listed[0]
        assert "person@example.com" not in str(listed)

        detail_response = client.get(f"/api/admin/conversations/{newer.id}")
        assert detail_response.status_code == 200
        detail = detail_response.json()
        assert detail["visitor_label"] == "Example Co"
        assert [message["content"] for message in detail["messages"]] == ["Hello", "Hi"]
        assert "session_id" not in detail
        assert "turn_secret_123456" not in str(detail)

        missing_response = client.get("/api/admin/conversations/9999")
        assert missing_response.status_code == 404
    finally:
        app.dependency_overrides.clear()


def test_admin_can_delete_conversation_and_related_records() -> None:
    session = make_session()
    conversation = Conversation(
        session_id="delete_session_123456",
        visitor_name="Temp",
        summary="Delete me",
        last_activity_at=datetime.now(UTC),
    )
    session.add(conversation)
    session.commit()
    session.add_all(
        [
            Message(conversation_id=conversation.id, role="user", content="Hello", status="completed", turn_id="turn_delete_123456"),
            Message(conversation_id=conversation.id, role="assistant", content="Hi", status="completed", turn_id="turn_delete_123456"),
            Booking(
                conversation_id=conversation.id,
                participant_email="person@example.com",
                starts_at_utc=datetime.now(UTC),
                ends_at_utc=datetime.now(UTC) + timedelta(minutes=30),
                timezone="America/Sao_Paulo",
                status="confirmed",
                idempotency_key="delete-booking-123456",
            ),
        ]
    )
    session.commit()

    def override_session():
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[admin_module.get_session] = override_session
    client = TestClient(app)

    try:
        delete_response = client.delete(f"/api/admin/conversations/{conversation.id}")
        assert delete_response.status_code == 204
        assert session.get(Conversation, conversation.id) is None
        assert session.query(Message).filter(Message.conversation_id == conversation.id).count() == 0
        assert session.query(Booking).filter(Booking.conversation_id == conversation.id).count() == 0

        list_response = client.get("/api/admin/conversations")
        listed_ids = [item["id"] for item in list_response.json()]
        assert conversation.id not in listed_ids
    finally:
        app.dependency_overrides.clear()


def test_admin_can_read_and_update_chat_tracing(tmp_path: Path) -> None:
    session = make_session()
    log_path = tmp_path / "chat-tracing-log.txt"
    state_path = tmp_path / "chat-tracing-enabled.txt"

    def override_session():
        try:
            yield session
        finally:
            pass

    def override_settings():
        return Settings(chat_tracing_log_path=log_path, chat_tracing_state_path=state_path, _env_file=None)

    app.dependency_overrides[admin_module.get_session] = override_session
    app.dependency_overrides[admin_module.get_settings] = override_settings
    client = TestClient(app)

    try:
        get_response = client.get("/api/admin/chat-tracing")
        assert get_response.status_code == 200
        payload = get_response.json()
        assert payload["enabled"] is True
        assert payload["log_path"].endswith("chat-tracing-log.txt")

        update_response = client.put("/api/admin/chat-tracing", json={"enabled": False})
        assert update_response.status_code == 200
        updated = update_response.json()
        assert updated["enabled"] is False
        assert state_path.read_text(encoding="utf-8").strip() == "0"
    finally:
        app.dependency_overrides.clear()


def test_admin_prompt_can_be_read_and_updated(tmp_path: Path) -> None:
    session = make_session()
    prompt_path = tmp_path / "prompt.md"
    prompt_path.write_text("Original prompt", encoding="utf-8")

    def override_session():
        try:
            yield session
        finally:
            pass

    def override_settings():
        return Settings(sdr_prompt_path=prompt_path, _env_file=None)

    app.dependency_overrides[admin_module.get_session] = override_session
    app.dependency_overrides[admin_module.get_settings] = override_settings
    client = TestClient(app)

    try:
        get_response = client.get("/api/admin/prompt")
        assert get_response.status_code == 200
        assert get_response.json() == {"content": "Original prompt"}

        update_response = client.put("/api/admin/prompt", json={"content": "Updated prompt for the agent"})
        assert update_response.status_code == 200
        assert update_response.json() == {"content": "Updated prompt for the agent"}
        assert prompt_path.read_text(encoding="utf-8").strip() == "Updated prompt for the agent"
    finally:
        app.dependency_overrides.clear()
