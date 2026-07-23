from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from backend.app import chat as chat_module
from backend.app.models import Base, Conversation, Message
from backend.app.schemas import ChatRequest


def make_session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()


def test_stream_chat_persists_user_and_assistant_only_after_success(monkeypatch) -> None:
    session = make_session()
    monkeypatch.setattr(chat_module, "stream_openai_text", lambda *_args: iter(["hello", " world"]))

    events = list(chat_module.stream_chat(session, ChatRequest(message="Hi")))

    assert any('"event": "done"' in event for event in events)
    messages = session.scalars(select(Message).order_by(Message.id)).all()
    assert [(message.role, message.content) for message in messages] == [
        ("user", "Hi"),
        ("assistant", "hello world"),
    ]


def test_stream_chat_does_not_persist_incomplete_turn_after_error(monkeypatch) -> None:
    session = make_session()

    def fail_after_delta(*_args):
        yield "partial"
        raise chat_module.OpenAIChatUnavailable("boom")

    monkeypatch.setattr(chat_module, "stream_openai_text", fail_after_delta)

    events = list(chat_module.stream_chat(session, ChatRequest(message="Hi")))

    assert any('"event": "error"' in event for event in events)
    assert session.scalar(select(Conversation)) is not None
    assert session.scalars(select(Message)).all() == []
