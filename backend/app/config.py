from functools import lru_cache
from pathlib import Path
from urllib.parse import unquote

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "CriativAI"
    database_url: str = "sqlite:///./data/app.db"
    frontend_dist_dir: Path = Path("dist")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", env_ignore_empty=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()


def ensure_sqlite_parent(database_url: str) -> None:
    if not database_url.startswith("sqlite:///"):
        return

    db_path = unquote(database_url.removeprefix("sqlite:///"))
    if db_path == ":memory:":
        return

    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
