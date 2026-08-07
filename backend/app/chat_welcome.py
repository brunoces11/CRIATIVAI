from pathlib import Path

from backend.app.chat_message_catalog import load_message_catalog
from backend.app.schemas import ChatWelcomeResponse

WELCOME_MESSAGES_PATH = Path(__file__).resolve().parents[2] / "Chat-Welcome-Messages.json"


def create_welcome_conversation(welcome_key: str) -> ChatWelcomeResponse:
    return ChatWelcomeResponse(message=_load_welcome_messages().get(welcome_key))


def _load_welcome_messages() -> dict[str, str]:
    return load_message_catalog(WELCOME_MESSAGES_PATH, label="Welcome messages")
