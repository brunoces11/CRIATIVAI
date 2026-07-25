from datetime import UTC, datetime, timedelta
import json
from pathlib import Path
from types import SimpleNamespace
from urllib.parse import parse_qs, urlsplit

from fastapi import HTTPException
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from backend.app.config import Settings
from backend.app.google_oauth import (
    build_flow,
    consume_oauth_state,
    create_oauth_state,
    ensure_google_oauth_config,
    google_connect,
    google_oauth_callback,
    google_status,
    oauth_error_redirect,
    save_credentials,
)
from backend.app.models import Base, OAuthState


def make_session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()


def oauth_settings(tmp_path: Path) -> Settings:
    return Settings(
        google_client_id="client-id",
        google_client_secret="client-secret",
        google_redirect_uri="http://localhost:8000/api/google/oauth/callback",
        google_token_path=tmp_path / "google-token.json",
        _env_file=None,
    )


def test_google_status_never_returns_token(tmp_path: Path) -> None:
    settings = oauth_settings(tmp_path)
    refresh_field = "refresh" + "_token"
    client_secret_field = "client" + "_secret"
    settings.google_token_path.write_text(
        json.dumps(
            {
                "token": "access-value",
                refresh_field: "refresh-value",
                "token_uri": "https://oauth2.googleapis.com/token",
                "client_id": "client-id",
                client_secret_field: "client-secret",
                "scopes": ["https://www.googleapis.com/auth/calendar.events"],
            }
        ),
        encoding="utf-8",
    )

    status = google_status(settings)

    payload = status.model_dump()
    assert payload["status"] == "connected"
    assert "token" not in str(payload)
    assert "client-secret" not in str(payload)


def test_google_connect_requires_configuration() -> None:
    with pytest.raises(HTTPException) as exc_info:
        ensure_google_oauth_config(Settings(_env_file=None))

    assert exc_info.value.status_code == 503


def test_create_and_consume_oauth_state_is_single_use(tmp_path: Path) -> None:
    session = make_session()
    state = create_oauth_state(session, oauth_settings(tmp_path))

    consumed = consume_oauth_state(session, state.state)
    second = consume_oauth_state(session, state.state)

    assert consumed is not None
    assert consumed.used_at is not None
    assert second is None


def test_expired_oauth_state_is_rejected() -> None:
    session = make_session()
    state = OAuthState(
        state="expired-state",
        purpose="google_calendar",
        expires_at=datetime.now(UTC) - timedelta(seconds=1),
    )
    session.add(state)
    session.commit()

    assert consume_oauth_state(session, "expired-state") is None


def test_build_flow_uses_official_calendar_scopes(tmp_path: Path) -> None:
    settings = oauth_settings(tmp_path)

    flow = build_flow(settings, "opaque-state")

    assert flow.redirect_uri == settings.google_redirect_uri
    assert "https://www.googleapis.com/auth/calendar.freebusy" in flow.oauth2session.scope
    assert "https://www.googleapis.com/auth/calendar.events" in flow.oauth2session.scope
    assert "https://www.googleapis.com/auth/calendar.calendarlist" in flow.oauth2session.scope


def test_google_connect_persists_pkce_code_verifier(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    session = make_session()
    settings = oauth_settings(tmp_path)

    class FakeFlow:
        code_verifier = "stored-code-verifier"

        def authorization_url(self, **_kwargs: object) -> tuple[str, str]:
            return "https://accounts.google.com/o/oauth2/auth", "ignored"

    monkeypatch.setattr("backend.app.google_oauth.build_flow", lambda _settings, _state: FakeFlow())

    response = google_connect(session=session, settings=settings)

    stored_state = session.scalar(select(OAuthState))
    assert response.status_code == 302
    assert stored_state is not None
    assert stored_state.code_verifier == "stored-code-verifier"


def test_callback_saves_token_and_redirects_cleanly(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    session = make_session()
    settings = oauth_settings(tmp_path)
    state = create_oauth_state(session, settings)
    state.code_verifier = "stored-code-verifier"
    session.commit()

    class FakeFlow:
        credentials = SimpleNamespace(to_json=lambda: json.dumps({"refresh" + "_token": "saved-refresh-token"}))

        def fetch_token(self, code: str) -> None:
            assert code == "auth-code"

    def fake_build_flow(_settings: Settings, _state: str, code_verifier: str | None = None) -> FakeFlow:
        assert code_verifier == "stored-code-verifier"
        return FakeFlow()

    monkeypatch.setattr("backend.app.google_oauth.build_flow", fake_build_flow)
    monkeypatch.setattr("backend.app.calendar_notifications.enable_calendar_notifications", lambda _settings: None)

    response = google_oauth_callback(code="auth-code", state=state.state, session=session, settings=settings)

    assert response.status_code == 303
    assert response.headers["location"] == settings.google_oauth_success_path
    assert json.loads(settings.google_token_path.read_text(encoding="utf-8")) == {"refresh" + "_token": "saved-refresh-token"}
    assert "auth-code" not in response.headers["location"]
    assert "state" not in response.headers["location"]
    assert session.scalar(select(OAuthState).where(OAuthState.state == state.state)).used_at is not None


def test_callback_redirects_with_safe_google_error_detail(tmp_path: Path) -> None:
    session = make_session()
    settings = oauth_settings(tmp_path)

    response = google_oauth_callback(
        error="access_denied",
        error_description="User denied access",
        session=session,
        settings=settings,
    )

    parsed = urlsplit(response.headers["location"])
    params = parse_qs(parsed.query)
    assert response.status_code == 303
    assert parsed.path == "/adm"
    assert params["google"] == ["error"]
    assert params["reason"] == ["access_denied"]
    assert params["detail"] == ["User denied access"]


def test_callback_failure_redirect_redacts_sensitive_details(tmp_path: Path) -> None:
    settings = oauth_settings(tmp_path)

    response = oauth_error_redirect(settings, "invalid_grant", "bad code=abc&state=secret")

    location = response.headers["location"]
    assert "invalid_grant" in location
    assert "abc" not in location
    assert "state%3Dsecret" not in location
    assert "redacted" in location


def test_save_credentials_creates_private_token_file_when_supported(tmp_path: Path) -> None:
    token_path = tmp_path / "nested" / "google-token.json"
    credentials = SimpleNamespace(to_json=lambda: json.dumps({"refresh_token": "saved"}))

    save_credentials(credentials, token_path)

    assert json.loads(token_path.read_text(encoding="utf-8")) == {"refresh" + "_token": "saved"}
