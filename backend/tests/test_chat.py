from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from backend.app import chat as chat_module
from backend.app.config import Settings
from backend.app.models import Base, Conversation, Message
from backend.app.schemas import ChatRequest


def setup_function() -> None:
    chat_module._active_sessions.clear()
    chat_module._rate_limit_hits.clear()


def make_session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()


def test_stream_chat_persists_user_and_assistant_only_after_success(monkeypatch) -> None:
    session = make_session()
    monkeypatch.setattr(chat_module, "get_settings", lambda: Settings(openai_mock_response="hello world", _env_file=None))
    monkeypatch.setattr(chat_module, "stream_openai_text", lambda *_args: iter(["hello", " world"]))

    events = list(chat_module.stream_chat(session, ChatRequest(message="Hi")))

    assert any('"event": "done"' in event for event in events)
    messages = session.scalars(select(Message).order_by(Message.id)).all()
    assert [(message.role, message.content) for message in messages] == [
        ("user", "Hi"),
        ("assistant", "hello world"),
    ]


def test_stream_chat_keeps_user_message_when_assistant_fails(monkeypatch) -> None:
    session = make_session()
    monkeypatch.setattr(chat_module, "get_settings", lambda: Settings(openai_mock_response="unused", _env_file=None))

    def fail_after_delta(*_args):
        yield "partial"
        raise chat_module.OpenAIChatUnavailable("boom")

    monkeypatch.setattr(chat_module, "stream_openai_text", fail_after_delta)

    events = list(chat_module.stream_chat(session, ChatRequest(message="Hi")))

    assert any('"event": "error"' in event for event in events)
    assert session.scalar(select(Conversation)) is not None
    messages = session.scalars(select(Message).order_by(Message.id)).all()
    assert [(message.role, message.content) for message in messages] == [("user", "Hi")]


def test_stream_chat_retries_failed_turn_without_duplicate_user_message(monkeypatch) -> None:
    session = make_session()
    monkeypatch.setattr(chat_module, "get_settings", lambda: Settings(openai_mock_response="unused", _env_file=None))
    request = ChatRequest(message="Hi", turn_id="turn_123456789012")

    def fail_after_delta(*_args):
        yield "partial"
        raise chat_module.OpenAIChatUnavailable("boom")

    monkeypatch.setattr(chat_module, "stream_openai_text", fail_after_delta)
    first_events = [json_event(event) for event in chat_module.stream_chat(session, request)]
    session_id = next(event["session_id"] for event in first_events if event["event"] == "session_start")

    monkeypatch.setattr(chat_module, "stream_openai_text", lambda *_args: iter(["hello"]))
    second_events = [json_event(event) for event in chat_module.stream_chat(session, ChatRequest(message="Hi", session_id=session_id, turn_id=request.turn_id))]

    assert any(event["event"] == "done" for event in second_events)
    messages = session.scalars(select(Message).order_by(Message.id)).all()
    assert [(message.role, message.content) for message in messages] == [("user", "Hi"), ("assistant", "hello")]


def test_stream_chat_replays_completed_turn_without_duplicate_messages(monkeypatch) -> None:
    session = make_session()
    monkeypatch.setattr(chat_module, "get_settings", lambda: Settings(openai_mock_response="hello world", _env_file=None))
    monkeypatch.setattr(chat_module, "stream_openai_text", lambda *_args: iter(["hello"]))
    request = ChatRequest(message="Hi", turn_id="turn_123456789012")

    first_events = [json_event(event) for event in chat_module.stream_chat(session, request)]
    session_id = next(event["session_id"] for event in first_events if event["event"] == "session_start")
    monkeypatch.setattr(chat_module, "stream_openai_text", lambda *_args: (_ for _ in ()).throw(AssertionError("should replay")))
    replay_events = list(chat_module.stream_chat(session, ChatRequest(message="Hi", session_id=session_id, turn_id=request.turn_id)))

    assert any('"text": "hello"' in event for event in replay_events)
    assert len(session.scalars(select(Message)).all()) == 2


def test_stream_chat_rate_limits_per_session(monkeypatch) -> None:
    session = make_session()
    settings = Settings(openai_mock_response="hello", chat_rate_limit_count=1, chat_rate_limit_window_seconds=60, _env_file=None)
    monkeypatch.setattr(chat_module, "get_settings", lambda: settings)
    monkeypatch.setattr(chat_module, "stream_openai_text", lambda *_args: iter(["hello"]))

    first_events = [json_event(event) for event in chat_module.stream_chat(session, ChatRequest(message="First"))]
    session_id = next(event["session_id"] for event in first_events if event["event"] == "session_start")
    second_events = [json_event(event) for event in chat_module.stream_chat(session, ChatRequest(message="Second", session_id=session_id))]

    assert any(event["event"] == "done" for event in first_events)
    assert any(event["event"] == "error" and "Too many messages" in event["message"] for event in second_events)


def test_stream_chat_applies_configured_message_limit(monkeypatch) -> None:
    session = make_session()
    settings = Settings(openai_mock_response="unused", chat_message_max_chars=2, _env_file=None)
    monkeypatch.setattr(chat_module, "get_settings", lambda: settings)

    events = [json_event(event) for event in chat_module.stream_chat(session, ChatRequest(message="Too long"))]

    assert any(event["event"] == "error" and "too long" in event["message"] for event in events)
    assert session.scalars(select(Message)).all() == []


def test_stream_chat_blocks_simultaneous_stream_for_session(monkeypatch) -> None:
    session = make_session()
    monkeypatch.setattr(chat_module, "get_settings", lambda: Settings(openai_mock_response="held response", _env_file=None))
    monkeypatch.setattr(chat_module, "stream_openai_text", lambda *_args: iter(["held"]))

    first_stream = chat_module.stream_chat(session, ChatRequest(message="First"))
    first_session = json_event(next(first_stream))["session_id"]
    next(first_stream)

    second_events = [json_event(event) for event in chat_module.stream_chat(session, ChatRequest(message="Second", session_id=first_session))]

    assert any(event["event"] == "error" and "already has a response" in event["message"] for event in second_events)
    list(first_stream)


def test_stream_chat_limits_context_and_updates_summary(monkeypatch) -> None:
    session = make_session()
    settings = Settings(openai_mock_response="new answer", chat_context_recent_messages=2, _env_file=None)
    captured = {}
    conversation = chat_module.get_or_create_conversation(session, None)
    for index in range(6):
        role = "user" if index % 2 == 0 else "assistant"
        session.add(Message(conversation_id=conversation.id, role=role, content=f"message {index}", status="completed"))
    session.commit()

    def capture_context(_settings, history, user_message, summary):
        captured["history"] = list(history)
        captured["summary"] = summary
        yield "new answer"

    monkeypatch.setattr(chat_module, "get_settings", lambda: settings)
    monkeypatch.setattr(chat_module, "stream_openai_text", capture_context)

    list(chat_module.stream_chat(session, ChatRequest(message="Latest", session_id=conversation.session_id)))
    session.refresh(conversation)

    assert [message.content for message in captured["history"]] == ["message 4", "message 5"]
    assert conversation.summary is not None
    assert session.query(Message).count() == 8


def test_stream_chat_logs_metadata_without_message_content(monkeypatch, caplog) -> None:
    session = make_session()
    message = "contact me at person@example.com"
    monkeypatch.setattr(chat_module, "get_settings", lambda: Settings(openai_mock_response="hello", _env_file=None))
    monkeypatch.setattr(chat_module, "stream_openai_text", lambda *_args: iter(["hello"]))

    with caplog.at_level("INFO", logger="backend.app.chat"):
        list(chat_module.stream_chat(session, ChatRequest(message=message)))

    logs = "\n".join(record.getMessage() for record in caplog.records)

    assert "chat_turn request_id=" in logs
    assert "completed" in logs
    assert "person@example.com" not in logs
    assert message not in logs


def json_event(line: str) -> dict:
    import json

    return json.loads(line)
