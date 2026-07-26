from datetime import UTC, datetime, timedelta
import logging
import os
from pathlib import Path
import secrets
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from google.auth.exceptions import GoogleAuthError
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_503_SERVICE_UNAVAILABLE

from backend.app.config import Settings, get_settings
from backend.app.db import get_session
from backend.app.models import OAuthState
from backend.app.schemas import GoogleOAuthStatus

logger = logging.getLogger(__name__)

GOOGLE_OAUTH_PURPOSE = "google_calendar"
GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"

admin_router = APIRouter(prefix="/api/admin/google", tags=["google-oauth"])
callback_router = APIRouter(prefix="/api/google/oauth", tags=["google-oauth"])


@admin_router.get("/connect")
def google_connect(
    request: Request,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> RedirectResponse:
    ensure_google_oauth_config(settings)
    state = create_oauth_state(session, settings)
    flow = build_flow(settings, state.state, redirect_uri=resolve_google_redirect_uri(settings, request))
    authorization_url, _state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
    state.code_verifier = flow.code_verifier
    session.commit()
    return RedirectResponse(authorization_url, status_code=302)


@admin_router.get("/status", response_model=GoogleOAuthStatus)
def google_status(settings: Settings = Depends(get_settings)) -> GoogleOAuthStatus:
    if not settings.google_token_path.is_file():
        return GoogleOAuthStatus(status="disconnected", calendar_id=settings.google_calendar_id, scopes=settings.google_oauth_scopes)

    try:
        credentials = Credentials.from_authorized_user_file(str(settings.google_token_path), scopes=settings.google_oauth_scopes)
    except (ValueError, OSError, GoogleAuthError):
        return GoogleOAuthStatus(status="error", calendar_id=settings.google_calendar_id, scopes=settings.google_oauth_scopes)

    status = "connected" if credentials.valid or credentials.refresh_token else "error"
    return GoogleOAuthStatus(status=status, calendar_id=settings.google_calendar_id, scopes=settings.google_oauth_scopes)


@callback_router.get("/callback")
def google_oauth_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    error_description: str | None = None,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> RedirectResponse:
    if error:
        return oauth_error_redirect(settings, error, error_description)

    if not code or not state:
        return oauth_error_redirect(settings, "missing_callback_params", "Google callback did not include code and state.")

    oauth_state = consume_oauth_state(session, state)
    if oauth_state is None:
        return oauth_error_redirect(settings, "invalid_state", "OAuth state is missing, expired, or already used.")

    try:
        flow = build_flow(
            settings,
            state,
            oauth_state.code_verifier,
            redirect_uri=resolve_google_redirect_uri(settings, request),
        )
        flow.fetch_token(code=code)
        save_credentials(flow.credentials, settings.google_token_path)
        from backend.app.calendar_notifications import enable_calendar_notifications

        enable_calendar_notifications(settings)
    except Exception as exc:
        reason, detail = classify_oauth_exception(exc)
        logger.warning("Google OAuth callback failed: %s - %s", reason, detail)
        return oauth_error_redirect(settings, reason, detail)

    return RedirectResponse(settings.google_oauth_success_path, status_code=303)


def ensure_google_oauth_config(settings: Settings) -> None:
    if not settings.google_client_id or settings.google_client_secret is None or not settings.resolved_google_redirect_uri:
        raise HTTPException(status_code=HTTP_503_SERVICE_UNAVAILABLE, detail="Google OAuth is not configured")


def create_oauth_state(session: Session, settings: Settings) -> OAuthState:
    state = OAuthState(
        state=secrets.token_urlsafe(48),
        purpose=GOOGLE_OAUTH_PURPOSE,
        expires_at=datetime.now(UTC) + timedelta(seconds=settings.google_oauth_state_ttl_seconds),
    )
    session.add(state)
    session.commit()
    session.refresh(state)
    return state


def consume_oauth_state(session: Session, state: str) -> OAuthState | None:
    now = datetime.now(UTC)
    oauth_state = session.scalar(
        select(OAuthState).where(
            OAuthState.state == state,
            OAuthState.purpose == GOOGLE_OAUTH_PURPOSE,
            OAuthState.used_at.is_(None),
            OAuthState.expires_at > now,
        )
    )
    if oauth_state is None:
        return None

    oauth_state.used_at = now
    session.commit()
    session.refresh(oauth_state)
    return oauth_state


def build_flow(
    settings: Settings,
    state: str,
    code_verifier: str | None = None,
    *,
    redirect_uri: str | None = None,
) -> Flow:
    ensure_google_oauth_config(settings)
    resolved_redirect_uri = redirect_uri or settings.resolved_google_redirect_uri
    return Flow.from_client_config(
        {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret.get_secret_value(),
                "auth_uri": GOOGLE_AUTH_URI,
                "token_uri": GOOGLE_TOKEN_URI,
                "redirect_uris": [resolved_redirect_uri],
            }
        },
        scopes=settings.google_oauth_scopes,
        state=state,
        redirect_uri=resolved_redirect_uri,
        code_verifier=code_verifier,
    )


def resolve_google_redirect_uri(settings: Settings, request: Request | None = None) -> str:
    if request is not None:
        return str(request.url_for("google_oauth_callback"))
    return settings.resolved_google_redirect_uri


def save_credentials(credentials: Credentials, token_path: Path) -> None:
    token_path.parent.mkdir(parents=True, exist_ok=True)
    token_path.write_text(credentials.to_json(), encoding="utf-8")
    try:
        os.chmod(token_path, 0o600)
    except OSError:
        pass


def oauth_error_redirect(settings: Settings, reason: str, detail: str | None = None) -> RedirectResponse:
    parsed = urlsplit(settings.google_oauth_error_path)
    params = dict(parse_qsl(parsed.query, keep_blank_values=True))
    params["google"] = "error"
    params["reason"] = sanitize_oauth_message(reason)
    safe_detail = sanitize_oauth_message(detail)
    if safe_detail:
        params["detail"] = safe_detail

    location = urlunsplit((parsed.scheme, parsed.netloc, parsed.path, urlencode(params), parsed.fragment))
    return RedirectResponse(location, status_code=303)


def classify_oauth_exception(exc: Exception) -> tuple[str, str]:
    reason = getattr(exc, "error", None) or exc.__class__.__name__
    description = getattr(exc, "description", None) or str(exc) or exc.__class__.__name__
    return sanitize_oauth_message(reason), sanitize_oauth_message(description)


def sanitize_oauth_message(value: object | None) -> str:
    if value is None:
        return ""

    text = str(value).replace("\r", " ").replace("\n", " ").strip()
    if not text:
        return ""

    sensitive_markers = ("client_secret", "refresh_token", "access_token", "id_token", "authorization_code", "code=", "state=")
    lowered = text.lower()
    if any(marker in lowered for marker in sensitive_markers):
        return "Sensitive OAuth details were redacted. Check server logs only after removing secrets."

    return text[:240]
