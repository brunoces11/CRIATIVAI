import json
import secrets
from collections.abc import Iterator

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from backend.app.config import get_settings
from backend.app.models import Conversation, Message
from backend.app.openai_chat import OpenAIChatUnavailable, stream_openai_text
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


def stream_chat(session: Session, request: ChatRequest) -> Iterator[str]:
    conversation = get_or_create_conversation_with_messages(session, request.session_id)
    history = list(conversation.messages)
    session.add(Message(conversation_id=conversation.id, role="user", content=request.message))
    session.commit()

    yield _event("session_start", {"session_id": conversation.session_id})

    response = ""
    try:
        for delta in stream_openai_text(get_settings(), history, request.message):
            if not delta:
                continue
            response += delta
            yield _event("delta", {"text": delta})
    except OpenAIChatUnavailable:
        yield _event("error", {"message": "The assistant is temporarily unavailable. Please try again in a moment."})
        return

    if not response.strip():
        yield _event("error", {"message": "The assistant returned an empty response. Please try again."})
        return

    session.add(Message(conversation_id=conversation.id, role="assistant", content=response))
    session.commit()
    yield _event("done", {"session_id": conversation.session_id})


def get_or_create_conversation_with_messages(session: Session, session_id: str | None) -> Conversation:
    conversation = get_or_create_conversation(session, session_id)
    loaded = session.scalar(
        select(Conversation)
        .where(Conversation.id == conversation.id)
        .options(selectinload(Conversation.messages))
    )
    if loaded is None:
        raise RuntimeError("Conversation disappeared during chat turn.")
    return loaded


def _event(event: str, payload: dict[str, str]) -> str:
    return json.dumps({"event": event, **payload}, ensure_ascii=False) + "\n"
