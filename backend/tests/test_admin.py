from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app import admin as admin_module
from backend.app.main import app
from backend.app.models import Base, Conversation, Message


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
