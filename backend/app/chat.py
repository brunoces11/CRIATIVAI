import json
import logging
import re
import secrets
import threading
from collections import defaultdict, deque
from collections.abc import Iterator
from datetime import UTC, datetime
from time import monotonic

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from backend.app.config import get_settings
from backend.app.chat_tracing import ChatTraceContext, create_chat_trace_sink
from backend.app.models import Conversation, Message
from backend.app.openai_chat import OpenAIChatUnavailable, PublicToolStatus, stream_openai_text
from backend.app.schemas import ChatRequest

logger = logging.getLogger(__name__)
PUBLIC_BUSY_ERROR = "This conversation already has a response in progress. Please wait a moment."
PUBLIC_RATE_LIMIT_ERROR = "Too many messages in a short period. Please wait a moment and try again."
SECRET_PATTERN = re.compile(r"(sk-[A-Za-z0-9_-]{8,}|Bearer\s+[A-Za-z0-9._-]+)", re.IGNORECASE)

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
    persist_client_temporal_context(conversation, request)
    history = list(conversation.messages)
    masked_session = _mask_session_id(conversation.session_id)
    turn_id = request.turn_id or secrets.token_urlsafe(18)
    trace = create_chat_trace_sink(
        get_settings(),
        ChatTraceContext(
            request_id=request_id,
            conversation_id=conversation.id,
            session_id=conversation.session_id,
            turn_id=turn_id,
            mode="calendar",
        ),
    )

    yield _event("session_start", {"session_id": conversation.session_id})
    trace.log(
        "turn_start",
        user_message=request.message,
        history_count=len(history),
        summary_present=bool(conversation.summary),
    )

    settings = get_settings()
    if len(request.message) > settings.chat_message_max_chars:
        trace.log("turn_rejected", reason="message_too_long", max_chars=settings.chat_message_max_chars)
        yield _event("error", {"message": f"Message is too long. Please keep it under {settings.chat_message_max_chars} characters."})
        _log_chat_turn(request_id, masked_session, started_at, "message_too_long")
        return

    if request.turn_id:
        replay = _find_completed_turn(history, request.turn_id)
        if replay is not None:
            trace.log("turn_replayed", turn_id=request.turn_id)
            yield _event("delta", {"text": replay.content})
            yield _event("done", {"session_id": conversation.session_id})
            _log_chat_turn(request_id, masked_session, started_at, "replayed")
            return

    if not _try_start_turn(conversation.session_id):
        trace.log("turn_rejected", reason="busy")
        yield _event("error", {"message": PUBLIC_BUSY_ERROR})
        _log_chat_turn(request_id, masked_session, started_at, "busy")
        return

    if not _allow_rate_limit(conversation.session_id):
        _finish_turn(conversation.session_id)
        trace.log("turn_rejected", reason="rate_limited")
        yield _event("error", {"message": PUBLIC_RATE_LIMIT_ERROR})
        _log_chat_turn(request_id, masked_session, started_at, "rate_limited")
        return

    response = ""
    welcome_record = _ensure_cta_welcome_message(session, conversation, history, request)
    if welcome_record is not None:
        history = [*history, welcome_record]

    user_record = _find_turn_message(history, turn_id, "user")
    if user_record is None:
        user_record = Message(conversation_id=conversation.id, role="user", content=request.message, status="completed", turn_id=turn_id)
        session.add(user_record)
        now = datetime.now(UTC)
        conversation.last_activity_at = now
        conversation.updated_at = now
        session.commit()
        session.refresh(user_record)
        trace.log("user_message_persisted", message=request.message)
    try:
        recent_history = _recent_completed_messages(history, settings.chat_context_recent_messages)
        model_history, model_user_message = _build_model_context_for_request(recent_history, request.message)
        for delta in _stream_openai_text(
            settings,
            model_history,
            model_user_message,
            conversation.summary,
            session=session,
            conversation=conversation,
            trace=trace,
        ):
            if not delta:
                continue
            if isinstance(delta, PublicToolStatus):
                yield _event("tool_status", {"message": delta.message})
                trace.log("tool_status", message=delta.message)
                continue
            response += delta
            yield _event("delta", {"text": delta})
            trace.log("assistant_delta", text=delta)
    except OpenAIChatUnavailable as exc:
        error_category = "openai_unavailable"
        trace.log("turn_error", category=error_category, message=str(exc))
        yield _event("error", {"message": str(exc)})
        return
    except Exception as exc:
        error_category = "unexpected"
        logger.exception("Chat turn failed unexpectedly")
        trace.log("turn_error", category=error_category, message=str(exc))
        yield _event("error", {"message": _public_unexpected_error(exc)})
        return
    finally:
        _finish_turn(conversation.session_id)
        if error_category != "none":
            _log_chat_turn(request_id, masked_session, started_at, error_category)

    if not response.strip():
        error_category = "empty_response"
        trace.log("turn_error", category=error_category, message="Model returned an empty response")
        yield _event("error", {"message": "The assistant returned an empty response. Please try again."})
        _log_chat_turn(request_id, masked_session, started_at, error_category)
        return

    now = datetime.now(UTC)
    assistant_record = Message(conversation_id=conversation.id, role="assistant", content=response, status="completed", turn_id=turn_id)
    session.add(assistant_record)
    conversation.last_activity_at = now
    conversation.updated_at = now
    _update_summary_if_needed(conversation, [*history, user_record, assistant_record], get_settings().chat_context_recent_messages)
    session.commit()
    trace.log("turn_completed", assistant_message=response)
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


def _find_turn_message(messages: list[Message], turn_id: str, role: str) -> Message | None:
    return next((message for message in messages if message.turn_id == turn_id and message.role == role), None)


def _recent_completed_messages(messages: list[Message], limit: int) -> list[Message]:
    completed = [message for message in messages if message.status == "completed"]
    return completed[-limit:]


def _build_model_context_for_request(history: list[Message], user_message: str) -> tuple[list[Message], str]:
    welcome_message = _first_turn_cta_welcome_message(history)
    model_history = [message for message in history if not _is_cta_welcome_message(message)]
    if welcome_message is None:
        return model_history, user_message

    return (
        model_history,
        "\n\n".join(
            [
                "CTA welcome context shown to the visitor before this first message:",
                welcome_message.content,
                "Visitor's first message:",
                user_message,
            ]
        ),
    )


def _first_turn_cta_welcome_message(history: list[Message]) -> Message | None:
    user_messages = [message for message in history if message.role == "user"]
    if user_messages:
        return None
    welcome_messages = [message for message in history if _is_cta_welcome_message(message)]
    return welcome_messages[0] if len(welcome_messages) == 1 else None


def _is_cta_welcome_message(message: Message) -> bool:
    if message.role != "assistant" or not message.metadata_json:
        return False
    try:
        metadata = json.loads(message.metadata_json)
    except json.JSONDecodeError:
        return False
    return isinstance(metadata, dict) and metadata.get("source") == "cta_welcome"


def _ensure_cta_welcome_message(
    session: Session,
    conversation: Conversation,
    history: list[Message],
    request: ChatRequest,
) -> Message | None:
    if request.session_id or not request.welcome_message:
        return None

    existing = _first_turn_cta_welcome_message(history)
    if existing is not None:
        return existing

    welcome_record = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=request.welcome_message,
        status="completed",
        turn_id=f"welcome_{secrets.token_urlsafe(18)}",
        metadata_json=json.dumps(
            {
                "source": "cta_welcome",
                "welcome_key": request.welcome_key,
            },
            ensure_ascii=False,
        ),
    )
    session.add(welcome_record)
    now = datetime.now(UTC)
    conversation.last_activity_at = now
    conversation.updated_at = now
    session.commit()
    session.refresh(welcome_record)
    return welcome_record


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


def persist_client_temporal_context(conversation: Conversation, request: ChatRequest) -> None:
    if request.client_timezone:
        conversation.visitor_timezone = request.client_timezone
        conversation.visitor_timezone_source = "browser"
    if request.client_locale:
        conversation.visitor_locale = request.client_locale


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


def _public_unexpected_error(exc: BaseException) -> str:
    detail = SECRET_PATTERN.sub("<redacted>", " ".join(str(exc).split()))
    if len(detail) > 500:
        detail = f"{detail[:500].rstrip()}..."
    suffix = f": {detail}" if detail else ""
    return f"The assistant is temporarily unavailable. Please try again in a moment.\n\nBackend error: {exc.__class__.__name__}{suffix}"


def _stream_openai_text(
    settings,
    history,
    user_message,
    summary,
    *,
    session: Session,
    conversation: Conversation,
    trace=None,
):
    try:
        return stream_openai_text(settings, history, user_message, summary, session=session, conversation=conversation, trace=trace)
    except TypeError as exc:
        if "unexpected keyword argument" not in str(exc):
            raise
        try:
            return stream_openai_text(settings, history, user_message, summary, session=session, conversation=conversation)
        except TypeError as inner_exc:
            if "unexpected keyword argument" not in str(inner_exc):
                raise
            return stream_openai_text(settings, history, user_message, summary)
