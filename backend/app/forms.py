from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from backend.app.config import Settings, get_settings
from backend.app.db import get_session
from backend.app.emailer import send_email
from backend.app.models import ContactSubmission, TalentPreviewRequest
from backend.app.schemas import ContactSubmissionCreate, FormSubmissionResponse, TalentPreviewSubmissionCreate

router = APIRouter(prefix="/api/forms", tags=["forms"])


@router.post("/talent-preview", response_model=FormSubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_talent_preview(
    payload: TalentPreviewSubmissionCreate,
    request: Request,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> FormSubmissionResponse:
    submission = TalentPreviewRequest(
        requester_name=payload.requester_name,
        requester_email=payload.requester_email,
        job_title=payload.job_title,
        search_criteria_1=payload.search_criteria_1,
        search_criteria_2=payload.search_criteria_2,
        search_criteria_3=payload.search_criteria_3,
        search_criteria_4=payload.search_criteria_4,
        exclusion_criteria=payload.exclusion_criteria,
        differentiator=payload.differentiator,
        source_ip=_client_ip(request),
        user_agent=_user_agent(request),
    )
    session.add(submission)
    session.commit()
    session.refresh(submission)

    notification_result = send_email(
        settings=settings,
        to_email=settings.forms_notification_email,
        subject=f"[CriativAI] New Talent Preview request #{submission.id}",
        reply_to=submission.requester_email,
        text_body=_talent_preview_internal_text(submission),
        html_body=_talent_preview_internal_html(submission),
    )
    confirmation_result = send_email(
        settings=settings,
        to_email=submission.requester_email,
        subject="Your Talent Preview request is in",
        text_body=_talent_preview_confirmation_text(submission, settings),
        html_body=_talent_preview_confirmation_html(submission),
    )

    submission.notification_email_status = notification_result.status
    submission.confirmation_email_status = confirmation_result.status
    submission.notification_sent_at = _sent_at(notification_result.status)
    submission.confirmation_sent_at = _sent_at(confirmation_result.status)
    submission.email_error = _merge_errors(notification_result.error, confirmation_result.error)
    session.add(submission)
    session.commit()

    return FormSubmissionResponse(
        reference_id=submission.id,
        notification_email_status=submission.notification_email_status,
        confirmation_email_status=submission.confirmation_email_status,
    )


@router.post("/contact", response_model=FormSubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_contact(
    payload: ContactSubmissionCreate,
    request: Request,
    session: Session = Depends(get_session),
    settings: Settings = Depends(get_settings),
) -> FormSubmissionResponse:
    submission = ContactSubmission(
        name=payload.name,
        email=payload.email,
        subject=payload.subject,
        message=payload.message,
        source_ip=_client_ip(request),
        user_agent=_user_agent(request),
    )
    session.add(submission)
    session.commit()
    session.refresh(submission)

    notification_result = send_email(
        settings=settings,
        to_email=settings.forms_notification_email,
        subject=f"[CriativAI] New contact message #{submission.id}: {submission.subject}",
        reply_to=submission.email,
        text_body=_contact_internal_text(submission),
        html_body=_contact_internal_html(submission),
    )

    submission.notification_email_status = notification_result.status
    submission.notification_sent_at = _sent_at(notification_result.status)
    submission.email_error = notification_result.error
    session.add(submission)
    session.commit()

    return FormSubmissionResponse(
        reference_id=submission.id,
        notification_email_status=submission.notification_email_status,
        confirmation_email_status=None,
    )


def _client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


def _user_agent(request: Request) -> str | None:
    return request.headers.get("user-agent")


def _sent_at(email_status: str) -> datetime | None:
    if email_status != "sent":
        return None
    return datetime.now(timezone.utc)


def _merge_errors(*errors: str | None) -> str | None:
    joined = " | ".join(error for error in errors if error)
    return joined or None


def _talent_preview_internal_text(submission: TalentPreviewRequest) -> str:
    return f"""New Talent Preview request

Reference: #{submission.id}
Requester: {submission.requester_name}
Email: {submission.requester_email}
Job title: {submission.job_title}

Top search criteria:
1. {submission.search_criteria_1}
2. {submission.search_criteria_2}
3. {submission.search_criteria_3}
4. {submission.search_criteria_4}

Exclusion criteria:
{submission.exclusion_criteria}

Differentiator:
{submission.differentiator}

Source IP: {submission.source_ip or "n/a"}
User-Agent: {submission.user_agent or "n/a"}
"""


def _talent_preview_internal_html(submission: TalentPreviewRequest) -> str:
    return f"""
    <h1>New Talent Preview request</h1>
    <p><strong>Reference:</strong> #{submission.id}</p>
    <p><strong>Requester:</strong> {submission.requester_name}<br />
    <strong>Email:</strong> {submission.requester_email}<br />
    <strong>Job title:</strong> {submission.job_title}</p>
    <h2>Top search criteria</h2>
    <ol>
      <li>{submission.search_criteria_1}</li>
      <li>{submission.search_criteria_2}</li>
      <li>{submission.search_criteria_3}</li>
      <li>{submission.search_criteria_4}</li>
    </ol>
    <p><strong>Exclusion criteria:</strong><br />{submission.exclusion_criteria}</p>
    <p><strong>Differentiator:</strong><br />{submission.differentiator}</p>
    <p><strong>Source IP:</strong> {submission.source_ip or "n/a"}<br />
    <strong>User-Agent:</strong> {submission.user_agent or "n/a"}</p>
    """


def _talent_preview_confirmation_text(submission: TalentPreviewRequest, settings: Settings) -> str:
    return f"""Hi {submission.requester_name},

Thanks for requesting a Talent Preview from CriativAI.

We received your brief for:
{submission.job_title}

Our team will review the criteria you submitted and send a shortlist of up to 20 aligned candidate profiles within 24 hours.

If we need any clarification, we will reply to this email.

CriativAI
{settings.app_base_url}
"""


def _talent_preview_confirmation_html(submission: TalentPreviewRequest) -> str:
    return f"""
    <p>Hi {submission.requester_name},</p>
    <p>Thanks for requesting a <strong>Talent Preview</strong> from CriativAI.</p>
    <p>We received your brief for <strong>{submission.job_title}</strong>.</p>
    <p>Our team will review the criteria you submitted and send a shortlist of up to 20 aligned candidate profiles within 24 hours.</p>
    <p>If we need any clarification, we will reply to this email.</p>
    <p>CriativAI</p>
    """


def _contact_internal_text(submission: ContactSubmission) -> str:
    return f"""New contact message

Reference: #{submission.id}
Name: {submission.name}
Email: {submission.email}
Subject: {submission.subject}

Message:
{submission.message}

Source IP: {submission.source_ip or "n/a"}
User-Agent: {submission.user_agent or "n/a"}
"""


def _contact_internal_html(submission: ContactSubmission) -> str:
    return f"""
    <h1>New contact message</h1>
    <p><strong>Reference:</strong> #{submission.id}</p>
    <p><strong>Name:</strong> {submission.name}<br />
    <strong>Email:</strong> {submission.email}<br />
    <strong>Subject:</strong> {submission.subject}</p>
    <p><strong>Message:</strong><br />{submission.message.replace("\n", "<br />")}</p>
    <p><strong>Source IP:</strong> {submission.source_ip or "n/a"}<br />
    <strong>User-Agent:</strong> {submission.user_agent or "n/a"}</p>
    """
