from pathlib import Path

from backend.app.chat_message_catalog import load_message_catalog
from backend.app.schemas import ChatWelcomeResponse

WELCOME_MESSAGES_PATHS = {
    "pt": Path(__file__).resolve().parents[2] / "Chat-Welcome-Messages-br.json",
    "en": Path(__file__).resolve().parents[2] / "Chat-Welcome-Messages-en.json",
}
WELCOME_MESSAGES_PATH = WELCOME_MESSAGES_PATHS["en"]


def create_welcome_conversation(welcome_key: str, language: str = "pt") -> ChatWelcomeResponse:
    legacy_override = WELCOME_MESSAGES_PATH != WELCOME_MESSAGES_PATHS["en"]
    if legacy_override:
        return ChatWelcomeResponse(message=_load_welcome_messages("en").get(welcome_key))
    primary = _load_welcome_messages(language)
    message = primary.get(welcome_key)
    if message is None:
        message = _load_welcome_messages("en" if language == "pt" else "pt").get(welcome_key)
    return ChatWelcomeResponse(message=message)


def _load_welcome_messages(language: str = "pt") -> dict[str, str]:
    if WELCOME_MESSAGES_PATH != WELCOME_MESSAGES_PATHS["en"]:
        return load_message_catalog(WELCOME_MESSAGES_PATH, label="Welcome messages")
    return load_message_catalog(WELCOME_MESSAGES_PATHS.get(language, WELCOME_MESSAGES_PATHS["pt"]), label="Welcome messages")
