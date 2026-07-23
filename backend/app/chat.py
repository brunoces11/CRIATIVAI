import json
import logging
import secrets
import threading
from collections import defaultdict, deque
from collections.abc import Iterator
from datetime import UTC, datetime
from time import monotonic

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from backend.app.config import get_settings
from backend.app.models import Conversation, Message
from backend.app.openai_chat import OpenAIChatUnavailable, stream_openai_text
from backend.app.schemas import ChatRequest

logger = logging.getLogger(__name__)
PUBLIC_BUSY_ERROR = "This conversation already has a response in progress. Please wait a moment."
PUBLIC_RATE_LIMIT_ERROR = "Too many messages in a short period. Please wait a moment and try again."

_active_sessions: set[str] = set()
_rate_limit_hits: dict[str, deque[float]] = defaultdict(deque)
_state_lock = threading.Lock()


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
    request_id = secrets.token_hex(8)
    started_at = monotonic()
    error_category = "none"
    conversation = get_or_create_conversation_with_messages(session, request.session_id)
    history = list(conversation.messages)
    masked_session = _mask_session_id(conversation.session_id)

    yield _event("session_start", {"session_id": conversation.session_id})

    settings = get_settings()
    if len(request.message) > settings.chat_message_max_chars:
        yield _event("error", {"message": f"Message is too long. Please keep it under {settings.chat_message_max_chars} characters."})
        _log_chat_turn(request_id, masked_session, started_at, "message_too_long")
        return

    if request.turn_id:
        replay = _find_completed_turn(history, request.turn_id)
        if replay is not None:
            yield _event("delta", {"text": replay.content})
            yield _event("done", {"session_id": conversation.session_id})
            _log_chat_turn(request_id, masked_session, started_at, "replayed")
            return

    if not _try_start_turn(conversation.session_id):
        yield _event("error", {"message": PUBLIC_BUSY_ERROR})
        _log_chat_turn(request_id, masked_session, started_at, "busy")
        return

    if not _allow_rate_limit(conversation.session_id):
        _finish_turn(conversation.session_id)
        yield _event("error", {"message": PUBLIC_RATE_LIMIT_ERROR})
        _log_chat_turn(request_id, masked_session, started_at, "rate_limited")
        return

    response = ""
    try:
        recent_history = _recent_completed_messages(history, settings.chat_context_recent_messages)
        for delta in stream_openai_text(settings, recent_history, request.message, conversation.summary):
            if not delta:
                continue
            response += delta
            yield _event("delta", {"text": delta})
    except OpenAIChatUnavailable:
        error_category = "openai_unavailable"
        yield _event("error", {"message": "The assistant is temporarily unavailable. Please try again in a moment."})
        return
    except Exception:
        error_category = "unexpected"
        logger.exception("Chat turn failed unexpectedly")
        yield _event("error", {"message": "The assistant is temporarily unavailable. Please try again in a moment."})
        return
    finally:
        _finish_turn(conversation.session_id)
        if error_category != "none":
            _log_chat_turn(request_id, masked_session, started_at, error_category)

    if not response.strip():
        error_category = "empty_response"
        yield _event("error", {"message": "The assistant returned an empty response. Please try again."})
        _log_chat_turn(request_id, masked_session, started_at, error_category)
        return

    turn_id = request.turn_id or secrets.token_urlsafe(18)
    now = datetime.now(UTC)
    user_record = Message(conversation_id=conversation.id, role="user", content=request.message, status="completed", turn_id=turn_id)
    assistant_record = Message(conversation_id=conversation.id, role="assistant", content=response, status="completed", turn_id=turn_id)
    session.add(user_record)
    session.add(assistant_record)
    conversation.last_activity_at = now
    conversation.updated_at = now
    _update_summary_if_needed(conversation, [*history, user_record, assistant_record], get_settings().chat_context_recent_messages)
    session.commit()
    yield _event("done", {"session_id": conversation.session_id})
    _log_chat_turn(request_id, masked_session, started_at, "completed")


def get_or_create_conversation_with_messages(session: Session, session_id: str | None) -> Conversation:
    conversation = get_or_create_conversation(session, session_id)
    loaded = session.scalar(
        select(Conversation)
        .where(Conversation.id == conversation.id)
        .options(selectinload(Conversation.messages))
        .execution_options(populate_existing=True)
    )
    if loaded is None:
        raise RuntimeError("Conversation disappeared during chat turn.")
    return loaded


def _event(event: str, payload: dict[str, str]) -> str:
    return json.dumps({"event": event, **payload}, ensure_ascii=False) + "\n"


def _find_completed_turn(messages: list[Message], turn_id: str) -> Message | None:
    matches = [message for message in messages if message.turn_id == turn_id and message.status == "completed"]
    return next((message for message in matches if message.role == "assistant"), None)


def _recent_completed_messages(messages: list[Message], limit: int) -> list[Message]:
    completed = [message for message in messages if message.status == "completed"]
    return completed[-limit:]


def _try_start_turn(session_id: str) -> bool:
    with _state_lock:
        if session_id in _active_sessions:
            return False
        _active_sessions.add(session_id)
        return True


def _finish_turn(session_id: str) -> None:
    with _state_lock:
        _active_sessions.discard(session_id)


def _allow_rate_limit(session_id: str) -> bool:
    settings = get_settings()
    now = monotonic()
    with _state_lock:
        hits = _rate_limit_hits[session_id]
        while hits and now - hits[0] > settings.chat_rate_limit_window_seconds:
            hits.popleft()
        if len(hits) >= settings.chat_rate_limit_count:
            return False
        hits.append(now)
        return True


def _update_summary_if_needed(conversation: Conversation, messages: list[Message], recent_limit: int) -> None:
    completed_messages = [message for message in messages if message.status == "completed"]
    if len(completed_messages) <= recent_limit:
        return

    lines = []
    for message in completed_messages[-recent_limit:]:
        if message.role not in {"user", "assistant"}:
            continue
        content = " ".join(message.content.split())
        if len(content) > 160:
            content = f"{content[:157]}..."
        lines.append(f"{message.role}: {content}")

    conversation.summary = "\n".join(lines)[-1600:]


def _mask_session_id(session_id: str) -> str:
    if len(session_id) <= 8:
        return "***"
    return f"{session_id[:4]}...{session_id[-4:]}"


def _log_chat_turn(request_id: str, masked_session: str, started_at: float, category: str) -> None:
    duration_ms = round((monotonic() - started_at) * 1000)
    logger.info(
        "chat_turn request_id=%s session=%s duration_ms=%s category=%s",
        request_id,
        masked_session,
        duration_ms,
        category,
    )
