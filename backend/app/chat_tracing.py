from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
import json
import threading
from pathlib import Path

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from backend.app.config import Settings, get_settings

_TRACE_LOCK = threading.Lock()
DEFAULT_TRACE_ENABLED = True

router = APIRouter(prefix="/api/admin/chat-tracing", tags=["chat-tracing"])


class ChatTracingStatus(BaseModel):
    enabled: bool
    log_path: str
    state_path: str
    log_exists: bool
    log_size_bytes: int


class ChatTracingUpdate(BaseModel):
    enabled: bool


@dataclass(frozen=True)
class ChatTraceContext:
    request_id: str
    conversation_id: int
    session_id: str
    turn_id: str
    mode: str


@dataclass(frozen=True)
class ChatTraceSink:
    settings: Settings
    context: ChatTraceContext
    enabled: bool

    def log(self, event: str, **fields: object) -> None:
        if not self.enabled:
            return

        record: dict[str, object] = {
            "ts": datetime.now(UTC).isoformat(),
            "request_id": self.context.request_id,
            "conversation_id": self.context.conversation_id,
            "session_id": mask_identifier(self.context.session_id),
            "turn_id": self.context.turn_id,
            "mode": self.context.mode,
            "event": event,
        }
        for key, value in fields.items():
            record[key] = sanitize_value(value)
        append_trace_record(self.settings.chat_tracing_log_path, record)


@router.get("", response_model=ChatTracingStatus)
def get_chat_tracing_status(settings: Settings = Depends(get_settings)) -> ChatTracingStatus:
    return build_chat_tracing_status(settings)


@router.put("", response_model=ChatTracingStatus)
def update_chat_tracing(payload: ChatTracingUpdate, settings: Settings = Depends(get_settings)) -> ChatTracingStatus:
    set_chat_tracing_enabled(payload.enabled, settings=settings)
    return build_chat_tracing_status(settings)


def build_chat_tracing_status(settings: Settings) -> ChatTracingStatus:
    return ChatTracingStatus(
        enabled=is_chat_tracing_enabled(settings),
        log_path=str(settings.chat_tracing_log_path),
        state_path=str(settings.chat_tracing_state_path),
        log_exists=settings.chat_tracing_log_path.is_file(),
        log_size_bytes=settings.chat_tracing_log_path.stat().st_size if settings.chat_tracing_log_path.is_file() else 0,
    )


def create_chat_trace_sink(settings: Settings, context: ChatTraceContext) -> ChatTraceSink:
    return ChatTraceSink(settings=settings, context=context, enabled=is_chat_tracing_enabled(settings))


def is_chat_tracing_enabled(settings: Settings | None = None) -> bool:
    resolved_settings = settings or get_settings()
    state_path = resolved_settings.chat_tracing_state_path
    if not state_path.is_file():
        return DEFAULT_TRACE_ENABLED

    raw_value = state_path.read_text(encoding="utf-8").strip().lower()
    if raw_value in {"0", "false", "no", "off", "disabled"}:
        return False
    if raw_value in {"1", "true", "yes", "on", "enabled"}:
        return True
    return DEFAULT_TRACE_ENABLED


def set_chat_tracing_enabled(enabled: bool, *, settings: Settings | None = None) -> None:
    resolved_settings = settings or get_settings()
    state_path = resolved_settings.chat_tracing_state_path
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text("1\n" if enabled else "0\n", encoding="utf-8")


def append_trace_record(log_path: Path, record: dict[str, object]) -> None:
    log_path.parent.mkdir(parents=True, exist_ok=True)
    line = json.dumps(record, ensure_ascii=False, separators=(",", ":"))
    with _TRACE_LOCK:
        with log_path.open("a", encoding="utf-8") as handle:
            handle.write(line)
            handle.write("\n")


def mask_identifier(value: str) -> str:
    if len(value) <= 8:
        return "***"
    return f"{value[:4]}...{value[-4:]}"


def sanitize_value(value: object) -> object:
    if isinstance(value, str):
        return sanitize_text(value)
    if isinstance(value, list):
        return [sanitize_value(item) for item in value]
    if isinstance(value, dict):
        return {str(key): sanitize_value(item) for key, item in value.items()}
    return value


def sanitize_text(value: str) -> str:
    text = value.replace("\r", " ").replace("\n", " ").strip()
    if not text:
        return ""

    lowered = text.lower()
    sensitive_markers = ("client_secret", "refresh_token", "access_token", "id_token", "authorization_code", "code=", "state=")
    if any(marker in lowered for marker in sensitive_markers):
        return "Sensitive OAuth details were redacted."

    return text if len(text) <= 2000 else f"{text[:1997]}..."
