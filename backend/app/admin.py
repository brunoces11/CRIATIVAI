from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from starlette.status import HTTP_404_NOT_FOUND

from backend.app.config import Settings, get_settings
from backend.app.db import get_session
from backend.app.models import Conversation
from backend.app.schemas import AdminConversationDetail, AdminConversationMessage, AdminConversationSummary, AdminPromptResponse, AdminPromptUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/conversations", response_model=list[AdminConversationSummary])
def admin_conversations(session: Session = Depends(get_session)) -> list[AdminConversationSummary]:
    conversations = session.scalars(
        select(Conversation)
        .order_by(Conversation.last_activity_at.desc(), Conversation.updated_at.desc(), Conversation.created_at.desc())
        .limit(200)
    ).all()

    return [conversation_summary(conversation) for conversation in conversations]


@router.get("/conversations/{conversation_id}", response_model=AdminConversationDetail)
def admin_conversation_detail(conversation_id: int, session: Session = Depends(get_session)) -> AdminConversationDetail:
    conversation = session.scalar(
        select(Conversation)
        .where(Conversation.id == conversation_id)
        .options(selectinload(Conversation.messages))
    )
    if conversation is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Conversation not found")

    summary = conversation_summary(conversation)
    return AdminConversationDetail(
        **summary.model_dump(),
        messages=[
            AdminConversationMessage(
                role=message.role,
                content=message.content,
                status=message.status,
                created_at=message.created_at,
            )
            for message in conversation.messages
            if message.role in {"user", "assistant"}
        ],
    )


@router.get("/prompt", response_model=AdminPromptResponse)
def admin_prompt(settings: Settings = Depends(get_settings)) -> AdminPromptResponse:
    prompt_path = settings.sdr_prompt_path
    if not prompt_path.is_file():
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Prompt file not found")

    content = prompt_path.read_text(encoding="utf-8").strip()
    if not content:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Prompt file is empty")

    return AdminPromptResponse(content=content)


@router.put("/prompt", response_model=AdminPromptResponse)
def update_admin_prompt(payload: AdminPromptUpdate, settings: Settings = Depends(get_settings)) -> AdminPromptResponse:
    prompt_path = settings.sdr_prompt_path
    prompt_path.parent.mkdir(parents=True, exist_ok=True)
    prompt_path.write_text(f"{payload.content}\n", encoding="utf-8")
    return AdminPromptResponse(content=payload.content)


def conversation_summary(conversation: Conversation) -> AdminConversationSummary:
    return AdminConversationSummary(
        id=conversation.id,
        visitor_label=visitor_label(conversation),
        last_activity_at=conversation.last_activity_at or conversation.updated_at or conversation.created_at,
        status=conversation.status,
        booking_state=conversation.booking_state,
        summary=short_summary(conversation.summary),
    )


def visitor_label(conversation: Conversation) -> str:
    if conversation.visitor_name and conversation.visitor_company:
        return f"{conversation.visitor_name} - {conversation.visitor_company}"
    if conversation.visitor_name:
        return conversation.visitor_name
    if conversation.visitor_company:
        return conversation.visitor_company
    return "Anonymous visitor"


def short_summary(summary: str | None) -> str | None:
    if not summary:
        return None
    compact = " ".join(summary.split())
    if len(compact) <= 240:
        return compact
    return f"{compact[:237]}..."
