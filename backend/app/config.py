from functools import lru_cache
import os
from pathlib import Path
from urllib.parse import unquote

from pydantic import SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CriativAI"
    app_env: str = "development"
    app_base_url: str = "http://127.0.0.1:8000"
    database_url: str = "sqlite:///./data/app.db"
    frontend_dist_dir: Path = Path("dist")
    cors_origins: list[str] = []
    base_timezone: str = "America/Sao_Paulo"
    openai_api_key: SecretStr | None = None
    openai_model: str = "gpt-5-mini"
    openai_timeout_seconds: float = 30.0
    openai_mock_response: str | None = None
    sdr_prompt_path: Path = Path("backend/app/prompts/sdr_default.md")
    chat_message_max_chars: int = 2000
    chat_rate_limit_count: int = 8
    chat_rate_limit_window_seconds: int = 60
    chat_context_recent_messages: int = 12
    google_client_id: str | None = None
    google_client_secret: SecretStr | None = None
    google_redirect_uri: str | None = None
    google_calendar_id: str = "primary"
    google_token_path: Path = Path("data/google-token.json")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
        hide_input_in_errors=True,
    )

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        if self.app_env.lower() != "production":
            return self

        missing = []
        if self.openai_api_key is None:
            missing.append("OPENAI_API_KEY")
        if not self.openai_model:
            missing.append("OPENAI_MODEL")
        if not self.google_client_id:
            missing.append("GOOGLE_CLIENT_ID")
        if self.google_client_secret is None:
            missing.append("GOOGLE_CLIENT_SECRET")
        if not self.google_redirect_uri:
            missing.append("GOOGLE_REDIRECT_URI")
        if not self.google_calendar_id:
            missing.append("GOOGLE_CALENDAR_ID")
        if self.openai_mock_response:
            missing.append("OPENAI_MOCK_RESPONSE must be empty")

        if missing:
            joined = ", ".join(missing)
            raise ValueError(f"Missing required production settings: {joined}")

        return self


@lru_cache
def get_settings() -> Settings:
    env_file = ".env" if should_load_dotenv() else None
    return Settings(_env_file=env_file)


def should_load_dotenv() -> bool:
    explicit = os.getenv("CRIATIVAI_LOAD_DOTENV")
    if explicit is not None:
        return explicit.strip().lower() not in {"0", "false", "no", "off"}

    return os.getenv("APP_ENV", "development").strip().lower() != "test"


def ensure_sqlite_parent(database_url: str) -> None:
    if not database_url.startswith("sqlite:///"):
        return

    db_path = unquote(database_url.removeprefix("sqlite:///"))
    if db_path == ":memory:":
        return

    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
