import json
from pathlib import Path

from fastapi import HTTPException
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR


def load_message_catalog(path: Path, *, label: str) -> dict[str, str]:
    try:
        raw_messages = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{label} file not found") from exc
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{label} file is invalid") from exc

    if not isinstance(raw_messages, dict):
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR, detail=f"{label} file is invalid")

    return {
        key: value
        for key, value in raw_messages.items()
        if isinstance(key, str) and isinstance(value, str)
    }
