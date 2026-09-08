from datetime import UTC, datetime, timedelta
from pathlib import Path
import hashlib
import json
import re
import secrets

from fastapi import APIRouter, Cookie, Depends, Header, HTTPException, Response
from pydantic import BaseModel, Field
from starlette.status import HTTP_403_FORBIDDEN, HTTP_500_INTERNAL_SERVER_ERROR

from backend.app.chat_context import CONTEXT_MESSAGES_PATH
from backend.app.chat_message_catalog import load_message_catalog
from backend.app.chat_welcome import WELCOME_MESSAGES_PATH
from backend.app.config import Settings, get_settings

DEFAULT_CTA_EDITOR_ENABLED = False
CTA_EDITOR_COOKIE_NAME = "cta_editor_token"
WELCOME_KEY_PATTERN = re.compile(r"^[a-z0-9-]+(?:/[a-z0-9-]+)+$")

router = APIRouter(prefix="/api/admin/cta-editor", tags=["cta-editor"])


class CtaEditorStatus(BaseModel):
    enabled: bool
    state_path: str
    token: str | None = None
    token_valid: bool = False
    token_expires_at: datetime | None = None


class CtaEditorUpdate(BaseModel):
    enabled: bool


class CtaMessagesResponse(BaseModel):
    welcome_key: str
    welcome_message: str = ""
    context_message: str = ""


class CtaMessagesUpdate(BaseModel):
    welcome_message: str = Field(default="", max_length=12000)
    context_message: str = Field(default="", max_length=40000)


@router.get("", response_model=CtaEditorStatus)
def get_cta_editor_status(
    response: Response,
    settings: Settings = Depends(get_settings),
    x_cta_editor_token: str | None = Header(default=None),
    cta_editor_token: str | None = Cookie(default=None),
) -> CtaEditorStatus:
    add_no_store(response)
    return build_cta_editor_status(settings, token=x_cta_editor_token or cta_editor_token)


@router.put("", response_model=CtaEditorStatus)
def update_cta_editor(payload: CtaEditorUpdate, response: Response, settings: Settings = Depends(get_settings)) -> CtaEditorStatus:
    add_no_store(response)
    token = issue_cta_editor_token(settings) if payload.enabled else None
    if token:
        response.set_cookie(
            CTA_EDITOR_COOKIE_NAME,
            token,
            max_age=settings.cta_editor_token_ttl_seconds,
            httponly=True,
            samesite="lax",
            secure=False,
        )
    if not payload.enabled:
        set_cta_editor_state(settings, enabled=False)
        response.delete_cookie(CTA_EDITOR_COOKIE_NAME, samesite="lax")
    return build_cta_editor_status(settings, token=token, issued_token=token)


@router.get("/messages/{welcome_key:path}", response_model=CtaMessagesResponse)
def get_cta_messages(
    welcome_key: str,
    response: Response,
    settings: Settings = Depends(get_settings),
    x_cta_editor_token: str | None = Header(default=None),
    cta_editor_token: str | None = Cookie(default=None),
) -> CtaMessagesResponse:
    add_no_store(response)
    require_cta_editor_token(x_cta_editor_token or cta_editor_token, settings=settings)
    validate_welcome_key(welcome_key)
    return CtaMessagesResponse(
        welcome_key=welcome_key,
        welcome_message=load_message_catalog(WELCOME_MESSAGES_PATH, label="Welcome messages").get(welcome_key, ""),
        context_message=load_message_catalog(CONTEXT_MESSAGES_PATH, label="Context messages").get(welcome_key, ""),
    )


@router.put("/messages/{welcome_key:path}", response_model=CtaMessagesResponse)
def update_cta_messages(
    welcome_key: str,
    payload: CtaMessagesUpdate,
    response: Response,
    settings: Settings = Depends(get_settings),
    x_cta_editor_token: str | None = Header(default=None),
    cta_editor_token: str | None = Cookie(default=None),
) -> CtaMessagesResponse:
    add_no_store(response)
    require_cta_editor_token(x_cta_editor_token or cta_editor_token, settings=settings)
    validate_welcome_key(welcome_key)
    update_message_catalog(WELCOME_MESSAGES_PATH, welcome_key, payload.welcome_message)
    update_message_catalog(CONTEXT_MESSAGES_PATH, welcome_key, payload.context_message)
    return CtaMessagesResponse(
        welcome_key=welcome_key,
        welcome_message=payload.welcome_message,
        context_message=payload.context_message,
    )


def build_cta_editor_status(settings: Settings, *, token: str | None = None, issued_token: str | None = None) -> CtaEditorStatus:
    state = read_cta_editor_state(settings)
    token_valid = is_cta_editor_token_valid(token, settings=settings)
    return CtaEditorStatus(
        enabled=state.enabled,
        state_path=str(settings.cta_editor_state_path),
        token=issued_token,
        token_valid=token_valid,
        token_expires_at=state.token_expires_at if token_valid or issued_token else None,
    )


def is_cta_editor_enabled(settings: Settings | None = None) -> bool:
    resolved_settings = settings or get_settings()
    return read_cta_editor_state(resolved_settings).enabled


def set_cta_editor_enabled(enabled: bool, *, settings: Settings | None = None) -> None:
    resolved_settings = settings or get_settings()
    set_cta_editor_state(resolved_settings, enabled=enabled)


def issue_cta_editor_token(settings: Settings | None = None) -> str:
    resolved_settings = settings or get_settings()
    token = secrets.token_urlsafe(32)
    token_expires_at = datetime.now(UTC) + timedelta(seconds=resolved_settings.cta_editor_token_ttl_seconds)
    set_cta_editor_state(
        resolved_settings,
        enabled=True,
        token_hash=hash_token(token),
        token_expires_at=token_expires_at,
    )
    return token


def clear_cta_editor_token() -> None:
    return


def is_cta_editor_token_valid(token: str | None, *, settings: Settings | None = None) -> bool:
    if not token:
        return False
    resolved_settings = settings or get_settings()
    state = read_cta_editor_state(resolved_settings)
    if not state.enabled or not state.token_hash or not state.token_expires_at:
        return False
    if datetime.now(UTC) >= state.token_expires_at:
        set_cta_editor_state(resolved_settings, enabled=False)
        return False
    return secrets.compare_digest(hash_token(token), state.token_hash)


class CtaEditorStoredState(BaseModel):
    enabled: bool = DEFAULT_CTA_EDITOR_ENABLED
    token_hash: str | None = None
    token_expires_at: datetime | None = None


def read_cta_editor_state(settings: Settings) -> CtaEditorStoredState:
    state_path = settings.cta_editor_state_path
    if not state_path.is_file():
        return CtaEditorStoredState()

    raw_value = state_path.read_text(encoding="utf-8").strip()
    if not raw_value:
        return CtaEditorStoredState()
    try:
        parsed = json.loads(raw_value)
    except json.JSONDecodeError:
        return CtaEditorStoredState(enabled=parse_legacy_enabled_value(raw_value))
    if not isinstance(parsed, dict):
        return CtaEditorStoredState()
    try:
        return CtaEditorStoredState.model_validate(parsed)
    except ValueError:
        return CtaEditorStoredState()


def set_cta_editor_state(
    settings: Settings,
    *,
    enabled: bool,
    token_hash: str | None = None,
    token_expires_at: datetime | None = None,
) -> None:
    state_path = settings.cta_editor_state_path
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state = CtaEditorStoredState(
        enabled=enabled,
        token_hash=token_hash if enabled else None,
        token_expires_at=token_expires_at if enabled else None,
    )
    state_path.write_text(f"{state.model_dump_json()}\n", encoding="utf-8")


def parse_legacy_enabled_value(raw_value: str) -> bool:
    normalized = raw_value.strip().lower()
    if normalized in {"0", "false", "no", "off", "disabled"}:
        return False
    if normalized in {"1", "true", "yes", "on", "enabled"}:
        return True
    return DEFAULT_CTA_EDITOR_ENABLED


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def add_no_store(response: Response) -> None:
    response.headers["Cache-Control"] = "no-store"


def require_cta_editor_token(token: str | None, *, settings: Settings | None = None) -> None:
    if not is_cta_editor_token_valid(token, settings=settings):
        raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="CTA editor token is invalid or expired")


def validate_welcome_key(welcome_key: str) -> None:
    if not WELCOME_KEY_PATTERN.fullmatch(welcome_key):
        raise HTTPException(status_code=HTTP_403_FORBIDDEN, detail="Invalid CTA key")


def update_message_catalog(path: Path, key: str, value: str) -> None:
    messages = load_message_catalog(path, label=path.name)
    messages[key] = value
    try:
        path.write_text(f"{json_dump(messages)}\n", encoding="utf-8")
    except OSError as exc:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{path.name} could not be updated") from exc


def json_dump(messages: dict[str, str]) -> str:
    import json

    return json.dumps(messages, ensure_ascii=False, indent=2)
