from pathlib import Path

import pytest
from pydantic import ValidationError

from backend.app.config import Settings, get_settings, should_load_dotenv


def test_valid_settings_do_not_require_dotenv(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("CRIATIVAI_LOAD_DOTENV", "0")
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path / 'settings.db'}")
    monkeypatch.setenv("FRONTEND_DIST_DIR", str(tmp_path / "dist"))
    get_settings.cache_clear()

    settings = get_settings()

    assert settings.app_env == "test"
    assert settings.database_url.endswith("settings.db")
    assert settings.frontend_dist_dir == tmp_path / "dist"
    assert should_load_dotenv() is False


def test_dotenv_extra_keys_are_ignored_without_exposing_secret_values(tmp_path: Path) -> None:
    sentinel = "SENTINEL_SECRET_VALUE_SHOULD_NOT_APPEAR"
    env_file = tmp_path / ".env"
    env_file.write_text(
        "\n".join(
            [
                "APP_ENV=development",
                "OPENAI_API_KEY" + "=test-openai-key-value",
                f"UNSUPPORTED_SECRET={sentinel}",
            ]
        ),
        encoding="utf-8",
    )

    settings = Settings(_env_file=env_file)

    assert settings.openai_api_key is not None


def test_validation_errors_hide_input_values(tmp_path: Path) -> None:
    sentinel = "SENTINEL_INVALID_ENV_VALUE_SHOULD_NOT_APPEAR"
    env_file = tmp_path / ".env"
    env_file.write_text(f"CORS_ORIGINS={sentinel}\n", encoding="utf-8")

    with pytest.raises(ValueError) as exc_info:
        Settings(_env_file=env_file)

    assert sentinel not in str(exc_info.value)


def test_production_missing_required_settings_reports_names_only() -> None:
    with pytest.raises(ValidationError) as exc_info:
        Settings(app_env="production", openai_mock_response="test only", _env_file=None)

    error_text = str(exc_info.value)

    assert "OPENAI_API_KEY" in error_text
    assert "GOOGLE_CLIENT_SECRET" in error_text
    assert "OPENAI_MOCK_RESPONSE must be empty" in error_text
    assert "input_value" not in error_text
