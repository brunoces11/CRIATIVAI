"""Check the built image without connecting to production services."""

import json
from pathlib import Path

from fastapi.testclient import TestClient

from backend.app.chat_context import get_context_message
from backend.app.main import app


root = Path("/app")
pt = json.loads((root / "Chat-Welcome-Messages-br.json").read_text(encoding="utf-8"))
en = json.loads((root / "Chat-Welcome-Messages-en.json").read_text(encoding="utf-8"))
context = json.loads((root / "Chat-Context-Messages.json").read_text(encoding="utf-8"))
key = next(key for key in pt if pt[key].strip() and en.get(key, "").strip() and context.get(key, "").strip())
state = (root / "chat-multi-window-enabled.txt").read_text(encoding="utf-8").strip().lower()
assert state in {"0", "1"}, "Unexpected multi-window setting"
assert get_context_message(key), "Missing chat context"

with TestClient(app) as client:
    health = client.get("/api/health")
    assert health.status_code == 200 and health.json()["database"] and health.json()["frontend"]
    for language in ("pt", "en"):
        response = client.post("/api/chat/welcome", json={"welcome_key": key, "language": language})
        assert response.status_code == 200 and response.json()["message"]
    window = client.get("/api/admin/chat-multi-window")
    assert window.status_code == 200 and window.json()["enabled"] == (state == "1")

print("Image verified: health, chat context, both languages, and multi-window setting")
