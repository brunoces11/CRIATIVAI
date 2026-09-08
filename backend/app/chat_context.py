from pathlib import Path

from backend.app.chat_message_catalog import load_message_catalog

CONTEXT_MESSAGES_PATH = Path(__file__).resolve().parents[2] / "Chat-Context-Messages.json"


def get_context_message(welcome_key: str | None) -> str | None:
    if not welcome_key:
        return None

    message = load_message_catalog(CONTEXT_MESSAGES_PATH, label="Context messages").get(welcome_key)
    if not message or not message.strip():
        return None
    return message
