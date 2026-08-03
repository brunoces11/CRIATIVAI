from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from html import escape
import hashlib
import re
from uuid import NAMESPACE_URL, uuid5

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND

from backend.app.config import Settings, get_settings
from backend.app.emailer import send_email
from backend.app.models import Conversation, ProjectBriefing

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
IDEMPOTENCY_PATTERN = re.compile(r"^[A-Za-z0-9_-]{16,128}$")


@dataclass(frozen=True)
class ContactCaptureResult:
    conversation_id: int
    visitor_name: str
    visitor_email: str
    visitor_company: str | None


@dataclass(frozen=True)
class ProjectBriefingResult:
    briefing_id: int
    conversation_id: int
    briefing_title: str
    briefing_status: str
    idempotency_key: str
    owner_email_status: str
    client_email_status: str
    email_error: str | None
    briefing_sent_at: datetime | None


def chat_capture_contact(
    session: Session,
    *,
    conversation_id: int,
    name: str,
    email: str,
    company: str | None,
    confirmed: bool,
) -> ContactCaptureResult:
    if not confirmed:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Contact confirmation is required")

    normalized_name = name.strip()
    normalized_email = email.strip().lower()
    normalized_company = company.strip() if isinstance(company, str) else None
    normalized_company = normalized_company or None

    if not normalized_name:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Visitor name is required")
    if not EMAIL_PATTERN.fullmatch(normalized_email):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Valid visitor email is required")

    conversation = session.get(Conversation, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Conversation not found")

    conversation.visitor_name = normalized_name
    conversation.visitor_email = normalized_email
    conversation.visitor_company = normalized_company
    conversation.updated_at = datetime.now(UTC)
    session.add(conversation)
    session.commit()

    return ContactCaptureResult(
        conversation_id=conversation.id,
        visitor_name=conversation.visitor_name or "",
        visitor_email=conversation.visitor_email or "",
        visitor_company=conversation.visitor_company,
    )


def project_briefing_send_email(
    session: Session,
    *,
    conversation_id: int,
    briefing_title: str,
    briefing_markdown: str,
    idempotency_key: str,
    confirmed: bool,
    settings: Settings | None = None,
) -> ProjectBriefingResult:
    resolved_settings = settings or get_settings()
    validate_briefing_request(briefing_title, briefing_markdown, idempotency_key, confirmed)

    existing = session.scalar(select(ProjectBriefing).where(ProjectBriefing.idempotency_key == idempotency_key))
    if existing is not None:
        return briefing_result(existing)

    conversation = session.get(Conversation, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Conversation not found")

    visitor_name = (conversation.visitor_name or "").strip()
    visitor_email = (conversation.visitor_email or "").strip().lower()
    if not visitor_name or not visitor_email:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Visitor name and email are required before sending a briefing")
    if not EMAIL_PATTERN.fullmatch(visitor_email):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Valid visitor email is required before sending a briefing")

    briefing = ProjectBriefing(
        conversation_id=conversation.id,
        briefing_title=briefing_title.strip(),
        briefing_markdown=briefing_markdown.strip(),
        briefing_status="created",
        idempotency_key=idempotency_key,
        owner_email_status="pending",
        client_email_status="pending",
    )
    session.add(briefing)
    session.commit()
    session.refresh(briefing)

    owner_result = send_email(
        settings=resolved_settings,
        to_email=resolved_settings.forms_notification_email.strip(),
        subject=f"[CriativAI] New project briefing: {briefing.briefing_title}",
        reply_to=visitor_email,
        text_body=owner_email_text(briefing, conversation),
        html_body=owner_email_html(briefing, conversation),
    )
    client_result = send_email(
        settings=resolved_settings,
        to_email=visitor_email,
        subject=f"CriativAI received your briefing: {briefing.briefing_title}",
        text_body=client_email_text(briefing, conversation, resolved_settings),
        html_body=client_email_html(briefing, conversation),
    )

    briefing.owner_email_status = owner_result.status
    briefing.client_email_status = client_result.status
    briefing.email_error = merge_errors(owner_result.error, client_result.error)
    if owner_result.status == "sent" and client_result.status == "sent":
        briefing.briefing_status = "sent"
        briefing.briefing_sent_at = datetime.now(UTC)
    elif owner_result.status == "failed" or client_result.status == "failed":
        briefing.briefing_status = "failed"
    else:
        briefing.briefing_status = "created"
    briefing.briefing_updated_at = datetime.now(UTC)
    session.add(briefing)
    session.commit()
    session.refresh(briefing)

    return briefing_result(briefing)


def build_briefing_idempotency_key(
    *,
    conversation_id: int,
    turn_id: str,
    briefing_title: str,
    briefing_markdown: str,
) -> str:
    digest = hashlib.sha256(
        "\n".join(
            [
                str(conversation_id),
                turn_id.strip(),
                briefing_title.strip(),
                briefing_markdown.strip(),
            ]
        ).encode("utf-8")
    ).hexdigest()
    return f"briefing_{uuid5(NAMESPACE_URL, digest).hex}"


def validate_briefing_request(briefing_title: str, briefing_markdown: str, idempotency_key: str, confirmed: bool) -> None:
    if not confirmed:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Briefing confirmation is required")
    if not briefing_title.strip():
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Briefing title is required")
    if not briefing_markdown.strip():
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Briefing markdown is required")
    if not IDEMPOTENCY_PATTERN.fullmatch(idempotency_key):
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Invalid idempotency key")


def briefing_result(briefing: ProjectBriefing) -> ProjectBriefingResult:
    return ProjectBriefingResult(
        briefing_id=briefing.briefing_id,
        conversation_id=briefing.conversation_id,
        briefing_title=briefing.briefing_title,
        briefing_status=briefing.briefing_status,
        idempotency_key=briefing.idempotency_key,
        owner_email_status=briefing.owner_email_status,
        client_email_status=briefing.client_email_status,
        email_error=briefing.email_error,
        briefing_sent_at=briefing.briefing_sent_at,
    )


def owner_email_text(briefing: ProjectBriefing, conversation: Conversation) -> str:
    return "\n".join(
        [
            "New project briefing",
            "",
            f"Reference: #{briefing.briefing_id}",
            f"Title: {briefing.briefing_title}",
            f"Client name: {conversation.visitor_name or 'n/a'}",
            f"Client email: {conversation.visitor_email or 'n/a'}",
            f"Company: {conversation.visitor_company or 'n/a'}",
            "",
            "Briefing:",
            briefing.briefing_markdown,
        ]
    )


def owner_email_html(briefing: ProjectBriefing, conversation: Conversation) -> str:
    return f"""
    <h1>New project briefing</h1>
    <p><strong>Reference:</strong> #{briefing.briefing_id}</p>
    <p><strong>Title:</strong> {escape(briefing.briefing_title)}<br />
    <strong>Client name:</strong> {escape(conversation.visitor_name or "n/a")}<br />
    <strong>Client email:</strong> {escape(conversation.visitor_email or "n/a")}<br />
    <strong>Company:</strong> {escape(conversation.visitor_company or "n/a")}</p>
    <h2>Briefing</h2>
    <p>{markdown_as_html_text(briefing.briefing_markdown)}</p>
    """


def client_email_text(briefing: ProjectBriefing, conversation: Conversation, settings: Settings) -> str:
    return "\n".join(
        [
            f"Hi {conversation.visitor_name},",
            "",
            "Thanks for sharing your briefing with CriativAI.",
            "",
            f"Briefing: {briefing.briefing_title}",
            "",
            briefing.briefing_markdown,
            "",
            "Bruno will review it and reply with the next steps.",
            "",
            "CriativAI",
            settings.app_base_url,
        ]
    )


def client_email_html(briefing: ProjectBriefing, conversation: Conversation) -> str:
    return f"""
    <p>Hi {escape(conversation.visitor_name or "there")},</p>
    <p>Thanks for sharing your briefing with <strong>CriativAI</strong>.</p>
    <p><strong>Briefing:</strong> {escape(briefing.briefing_title)}</p>
    <p>{markdown_as_html_text(briefing.briefing_markdown)}</p>
    <p>Bruno will review it and reply with the next steps.</p>
    <p>CriativAI</p>
    """


def markdown_as_html_text(value: str) -> str:
    return escape(value).replace("\n", "<br />")


def merge_errors(*errors: str | None) -> str | None:
    joined = " | ".join(error for error in errors if error)
    return joined or None
