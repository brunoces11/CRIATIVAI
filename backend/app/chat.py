import json
import secrets
from collections.abc import Iterator

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models import Conversation, Message
from backend.app.schemas import ChatRequest


def get_or_create_conversation(session: Session, session_id: str | None) -> Conversation:
    if session_id:
        conversation = session.scalar(select(Conversation).where(Conversation.session_id == session_id))
        if conversation:
            return conversation

    conversation = Conversation(session_id=secrets.token_urlsafe(32))
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


def stream_fake_chat(session: Session, request: ChatRequest) -> Iterator[str]:
    conversation = get_or_create_conversation(session, request.session_id)
    session.add(Message(conversation_id=conversation.id, role="user", content=request.message))
    session.commit()

    yield _event("session", {"session_id": conversation.session_id})

    response = (
        "Vertical test online. The backend received your message, stored it in SQLite, "
        "and streamed this response from FastAPI."
    )
    for token in response.split(" "):
        yield _event("delta", {"text": f"{token} "})

    session.add(Message(conversation_id=conversation.id, role="assistant", content=response))
    session.commit()
    yield _event("done", {"session_id": conversation.session_id})


def _event(event: str, payload: dict[str, str]) -> str:
    return json.dumps({"event": event, **payload}, ensure_ascii=False) + "\n"
