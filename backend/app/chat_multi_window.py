from pathlib import Path

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from backend.app.config import Settings, get_settings

DEFAULT_CHAT_MULTI_WINDOW_ENABLED = True

router = APIRouter(prefix="/api/admin/chat-multi-window", tags=["chat-multi-window"])


class ChatMultiWindowStatus(BaseModel):
    enabled: bool
    state_path: str


class ChatMultiWindowUpdate(BaseModel):
    enabled: bool


@router.get("", response_model=ChatMultiWindowStatus)
def get_chat_multi_window_status(settings: Settings = Depends(get_settings)) -> ChatMultiWindowStatus:
    return build_chat_multi_window_status(settings)


@router.put("", response_model=ChatMultiWindowStatus)
def update_chat_multi_window(payload: ChatMultiWindowUpdate, settings: Settings = Depends(get_settings)) -> ChatMultiWindowStatus:
    set_chat_multi_window_enabled(payload.enabled, settings=settings)
    return build_chat_multi_window_status(settings)


def build_chat_multi_window_status(settings: Settings) -> ChatMultiWindowStatus:
    return ChatMultiWindowStatus(
        enabled=is_chat_multi_window_enabled(settings),
        state_path=str(settings.chat_multi_window_state_path),
    )


def is_chat_multi_window_enabled(settings: Settings | None = None) -> bool:
    resolved_settings = settings or get_settings()
    state_path = resolved_settings.chat_multi_window_state_path
    if not state_path.is_file():
        return DEFAULT_CHAT_MULTI_WINDOW_ENABLED

    raw_value = state_path.read_text(encoding="utf-8").strip().lower()
    if raw_value in {"0", "false", "no", "off", "disabled"}:
        return False
    if raw_value in {"1", "true", "yes", "on", "enabled"}:
        return True
    return DEFAULT_CHAT_MULTI_WINDOW_ENABLED


def set_chat_multi_window_enabled(enabled: bool, *, settings: Settings | None = None) -> None:
    resolved_settings = settings or get_settings()
    state_path = resolved_settings.chat_multi_window_state_path
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text("1\n" if enabled else "0\n", encoding="utf-8")
