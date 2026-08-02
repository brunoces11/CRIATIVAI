import json
from pathlib import Path

from fastapi import HTTPException
from starlette.status import HTTP_404_NOT_FOUND, HTTP_500_INTERNAL_SERVER_ERROR

from backend.app.schemas import ChatWelcomeResponse

WELCOME_MESSAGES_PATH = Path(__file__).resolve().parents[2] / "Chat-Welcome-Messages.json"


def create_welcome_conversation(welcome_key: str) -> ChatWelcomeResponse:
    messages = _load_welcome_messages()
    message = messages.get(welcome_key)
    if not message:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Welcome message not found")

    return ChatWelcomeResponse(message=message)


def _load_welcome_messages() -> dict[str, str]:
    try:
        raw_messages = json.loads(WELCOME_MESSAGES_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail="Welcome messages file not found") from exc
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail="Welcome messages file is invalid") from exc

    if not isinstance(raw_messages, dict):
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail="Welcome messages file is invalid")

    return {key: value for key, value in raw_messages.items() if isinstance(key, str) and isinstance(value, str)}
