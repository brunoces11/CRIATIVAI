from pathlib import Path
import re

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from starlette.status import HTTP_404_NOT_FOUND

from backend.app.admin import router as admin_router
from backend.app.chat import stream_chat
from backend.app.config import get_settings
from backend.app.db import get_session, ping_database
from backend.app.forms import router as forms_router
from backend.app.google_oauth import admin_router as google_admin_router
from backend.app.google_oauth import callback_router as google_callback_router
from backend.app.models import Conversation
from backend.app.schemas import SESSION_ID_PATTERN, ChatRequest, ConversationMessage, ConversationResponse, HealthResponse

settings = get_settings()
app = FastAPI(title="CriativAI API")
app.include_router(admin_router)
app.include_router(google_admin_router)
app.include_router(google_callback_router)
app.include_router(forms_router)

if settings.cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["content-type"],
        allow_credentials=False,
    )


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    dist_dir = get_settings().frontend_dist_dir
    return HealthResponse(
        ok=True,
        database=ping_database(),
        frontend=(dist_dir / "index.html").is_file(),
    )


@app.post("/api/chat")
def chat(request: ChatRequest, session: Session = Depends(get_session)) -> StreamingResponse:
    return StreamingResponse(
        stream_chat(session, request),
        media_type="application/x-ndjson",
        headers={"Cache-Control": "no-store"},
    )


@app.get("/api/conversations/current", response_model=ConversationResponse)
def current_conversation(session_id: str, session: Session = Depends(get_session)) -> ConversationResponse:
    if not re.fullmatch(SESSION_ID_PATTERN, session_id):
        raise HTTPException(status_code=422, detail="Invalid session_id")

    conversation = session.scalar(
        select(Conversation)
        .where(Conversation.session_id == session_id)
        .options(selectinload(Conversation.messages))
    )
    if not conversation:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Conversation not found")

    return ConversationResponse(
        session_id=conversation.session_id,
        messages=[ConversationMessage(role=message.role, content=message.content) for message in conversation.messages],
    )


@app.get("/{path:path}", include_in_schema=False)
def frontend(path: str) -> FileResponse:
    if path.startswith("api/"):
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Not found")

    dist_dir = get_settings().frontend_dist_dir.resolve()
    requested = (dist_dir / path).resolve() if path else dist_dir / "index.html"

    if requested.is_file() and _is_relative_to(requested, dist_dir):
        return _file_response(requested)

    index = dist_dir / "index.html"
    if index.is_file():
        return _file_response(index, no_store=True)

    raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Frontend build not found")


def _file_response(path: Path, no_store: bool = False) -> FileResponse:
    headers = {"Cache-Control": "no-store"} if no_store or path.name == "index.html" else {"Cache-Control": "public, max-age=31536000, immutable"}
    return FileResponse(path, headers=headers)


def _is_relative_to(path: Path, parent: Path) -> bool:
    try:
        path.relative_to(parent)
        return True
    except ValueError:
        return False
