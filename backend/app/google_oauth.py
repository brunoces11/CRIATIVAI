from datetime import UTC, datetime, timedelta
import logging
import os
from pathlib import Path
import secrets

from fastapi import APIRouter, Depends, HTTPException
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
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> RedirectResponse:
    ensure_google_oauth_config(settings)
    state = create_oauth_state(session, settings)
    flow = build_flow(settings, state.state)
    authorization_url, _state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
    )
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
    code: str | None = None,
    state: str | None = None,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> RedirectResponse:
    if not code or not state:
        return RedirectResponse(settings.google_oauth_error_path, status_code=303)

    oauth_state = consume_oauth_state(session, state)
    if oauth_state is None:
        return RedirectResponse(settings.google_oauth_error_path, status_code=303)

    try:
        flow = build_flow(settings, state)
        flow.fetch_token(code=code)
        save_credentials(flow.credentials, settings.google_token_path)
    except Exception as exc:
        logger.warning("Google OAuth callback failed: %s", exc.__class__.__name__)
        return RedirectResponse(settings.google_oauth_error_path, status_code=303)

    return RedirectResponse(settings.google_oauth_success_path, status_code=303)


def ensure_google_oauth_config(settings: Settings) -> None:
    if not settings.google_client_id or settings.google_client_secret is None or not settings.google_redirect_uri:
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


def build_flow(settings: Settings, state: str) -> Flow:
    ensure_google_oauth_config(settings)
    return Flow.from_client_config(
        {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret.get_secret_value(),
                "auth_uri": GOOGLE_AUTH_URI,
                "token_uri": GOOGLE_TOKEN_URI,
                "redirect_uris": [settings.google_redirect_uri],
            }
        },
        scopes=settings.google_oauth_scopes,
        state=state,
        redirect_uri=settings.google_redirect_uri,
    )


def save_credentials(credentials: Credentials, token_path: Path) -> None:
    token_path.parent.mkdir(parents=True, exist_ok=True)
    token_path.write_text(credentials.to_json(), encoding="utf-8")
    try:
        os.chmod(token_path, 0o600)
    except OSError:
        pass
