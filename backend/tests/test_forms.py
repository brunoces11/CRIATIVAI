from __future__ import annotations

from time import time

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app import forms as forms_module
from backend.app.config import Settings
from backend.app.main import app
from backend.app.models import Base


def make_session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()


def contact_payload(*, started_at_ms: int | None = None) -> dict[str, str | int]:
    return {
        "name": "Bruno",
        "email": "bruno@example.com",
        "subject": "Project inquiry",
        "message": "I want to discuss an AI automation project.",
        "started_at_ms": started_at_ms if started_at_ms is not None else int(time() * 1000) - 5000,
        "honeypot": "",
    }


def talent_payload(*, started_at_ms: int | None = None) -> dict[str, str | int]:
    return {
        "requester_name": "Bruno",
        "requester_email": "bruno@example.com",
        "job_title": "Head of AI",
        "search_criteria_1": "Leadership",
        "started_at_ms": started_at_ms if started_at_ms is not None else int(time() * 1000) - 5000,
        "honeypot": "",
    }


def test_contact_submission_returns_pending_config_without_smtp(tmp_path) -> None:
    session = make_session()

    def override_session():
        try:
            yield session
        finally:
            pass

    def override_settings():
        return Settings(
            database_url=f"sqlite:///{tmp_path / 'forms.db'}",
            frontend_dist_dir=tmp_path / "dist",
            forms_notification_email="bruno@criativai.site",
            _env_file=None,
        )

    app.dependency_overrides[forms_module.get_session] = override_session
    app.dependency_overrides[forms_module.get_settings] = override_settings
    client = TestClient(app)

    try:
        response = client.post("/api/forms/contact", json=contact_payload())
        assert response.status_code == 201
        assert response.json()["notification_email_status"] == "pending_config"
    finally:
        app.dependency_overrides.clear()


def test_form_submission_rejects_too_fast_input(tmp_path) -> None:
    session = make_session()

    def override_session():
        try:
            yield session
        finally:
            pass

    def override_settings():
        return Settings(
            database_url=f"sqlite:///{tmp_path / 'forms-fast.db'}",
            frontend_dist_dir=tmp_path / "dist",
            form_min_fill_seconds=4,
            _env_file=None,
        )

    app.dependency_overrides[forms_module.get_session] = override_session
    app.dependency_overrides[forms_module.get_settings] = override_settings
    client = TestClient(app)

    try:
        response = client.post("/api/forms/contact", json=contact_payload(started_at_ms=int(time() * 1000)))
        assert response.status_code == 422
        assert "Please review the form" in response.json()["detail"]
    finally:
        app.dependency_overrides.clear()


def test_form_rate_limit_blocks_repeated_requests(tmp_path) -> None:
    session = make_session()

    def override_session():
        try:
            yield session
        finally:
            pass

    def override_settings():
        return Settings(
            database_url=f"sqlite:///{tmp_path / 'forms-rate.db'}",
            frontend_dist_dir=tmp_path / "dist",
            form_rate_limit_count=1,
            form_rate_limit_window_seconds=3600,
            _env_file=None,
        )

    app.dependency_overrides[forms_module.get_session] = override_session
    app.dependency_overrides[forms_module.get_settings] = override_settings
    client = TestClient(app)

    try:
        first = client.post("/api/forms/talent-preview", json=talent_payload())
        second = client.post("/api/forms/talent-preview", json=talent_payload())

        assert first.status_code == 201
        assert second.status_code == 429
        assert "Too many form submissions" in second.json()["detail"]
    finally:
        app.dependency_overrides.clear()


def test_talent_preview_submission_accepts_optional_fields_as_blank(tmp_path) -> None:
    session = make_session()

    def override_session():
        try:
            yield session
        finally:
            pass

    def override_settings():
        return Settings(
            database_url=f"sqlite:///{tmp_path / 'forms-optional.db'}",
            frontend_dist_dir=tmp_path / "dist",
            forms_notification_email="bruno@criativai.site",
            _env_file=None,
        )

    app.dependency_overrides[forms_module.get_session] = override_session
    app.dependency_overrides[forms_module.get_settings] = override_settings
    client = TestClient(app)

    try:
        response = client.post(
            "/api/forms/talent-preview",
            json={
                "requester_name": "Bruno",
                "requester_email": "bruno@example.com",
                "job_title": "Head of AI",
                "search_criteria_1": "Leadership across product and delivery",
                "started_at_ms": int(time() * 1000) - 5000,
                "honeypot": "",
            },
        )
        assert response.status_code == 201
        assert response.json()["notification_email_status"] == "pending_config"
    finally:
        app.dependency_overrides.clear()


def test_form_tables_are_created_on_startup(tmp_path) -> None:
    def override_settings():
        return Settings(
            database_url=f"sqlite:///{tmp_path / 'forms-startup.db'}",
            frontend_dist_dir=tmp_path / "dist",
            forms_notification_email="bruno@criativai.site",
            _env_file=None,
        )

    app.dependency_overrides[forms_module.get_settings] = override_settings

    try:
        with TestClient(app) as client:
            response = client.post(
                "/api/forms/contact",
                json={
                    "name": "Bruno",
                    "email": "bruno@example.com",
                    "subject": "Project inquiry",
                    "message": "I want to discuss an AI automation project.",
                    "started_at_ms": int(time() * 1000) - 5000,
                    "honeypot": "",
                },
            )
            assert response.status_code == 201
    finally:
        app.dependency_overrides.clear()
