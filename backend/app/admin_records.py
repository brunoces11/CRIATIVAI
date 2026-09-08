from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.status import HTTP_404_NOT_FOUND

from backend.app.models import AdminRecord, Booking, ContactSubmission, Conversation, ProjectBriefing, TalentPreviewRequest

ADMIN_RECORD_LABELS: dict[str, str] = {
    "briefing": "Briefing",
    "contact_form": "Contact Form",
    "talent_preview": "Talent Preview",
    "booking": "Booking",
}


def sync_admin_record(
    session: Session,
    *,
    user_from: str,
    source_record_id: int,
    name: str | None,
    email: str | None,
    company: str | None,
    timezone: str | None,
    conversation_id: int | None = None,
) -> AdminRecord:
    record = session.scalar(
        select(AdminRecord).where(
            AdminRecord.user_from == user_from,
            AdminRecord.source_record_id == source_record_id,
        )
    )
    if record is None:
        record = AdminRecord(
            user_from=user_from,
            source_record_id=source_record_id,
            conversation_id=conversation_id,
            name=clean_value(name),
            email=clean_value(email),
            company=clean_value(company),
            timezone=clean_value(timezone),
        )
        session.add(record)
        session.commit()
        session.refresh(record)
    return record


def sync_existing_admin_records(session: Session) -> None:
    for briefing, conversation in session.execute(
        select(ProjectBriefing, Conversation).join(Conversation, Conversation.id == ProjectBriefing.conversation_id)
    ):
        sync_admin_record(
            session,
            user_from="briefing",
            source_record_id=briefing.briefing_id,
            name=conversation.visitor_name,
            email=conversation.visitor_email,
            company=conversation.visitor_company,
            timezone=conversation.visitor_timezone,
            conversation_id=conversation.id,
        )

    for submission in session.scalars(select(ContactSubmission)).all():
        sync_admin_record(
            session,
            user_from="contact_form",
            source_record_id=submission.id,
            name=submission.name,
            email=submission.email,
            company=None,
            timezone=None,
        )

    for request in session.scalars(select(TalentPreviewRequest)).all():
        sync_admin_record(
            session,
            user_from="talent_preview",
            source_record_id=request.id,
            name=request.requester_name,
            email=request.requester_email,
            company=None,
            timezone=None,
        )

    for booking in session.scalars(select(Booking)).all():
        conversation = session.get(Conversation, booking.conversation_id) if booking.conversation_id is not None else None
        sync_admin_record(
            session,
            user_from="booking",
            source_record_id=booking.id,
            name=booking.participant_name or (conversation.visitor_name if conversation else None),
            email=booking.participant_email,
            company=conversation.visitor_company if conversation else None,
            timezone=booking.timezone,
            conversation_id=booking.conversation_id,
        )


def admin_record_label(user_from: str) -> str:
    return ADMIN_RECORD_LABELS.get(user_from, user_from.replace("_", " ").title())


def admin_record_detail_payload(session: Session, record: AdminRecord) -> dict[str, object]:
    if record.user_from == "briefing":
        briefing = session.scalar(select(ProjectBriefing).where(ProjectBriefing.briefing_id == record.source_record_id))
        if briefing is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Briefing not found")
        conversation = session.get(Conversation, briefing.conversation_id)
        if conversation is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Conversation not found")
        return {
            "briefing_id": briefing.briefing_id,
            "conversation_id": conversation.id,
            "briefing_title": briefing.briefing_title,
            "briefing_markdown": briefing.briefing_markdown,
            "briefing_status": briefing.briefing_status,
            "idempotency_key": briefing.idempotency_key,
            "owner_email_status": briefing.owner_email_status,
            "client_email_status": briefing.client_email_status,
            "email_error": briefing.email_error,
            "briefing_created_at": briefing.briefing_created_at,
            "briefing_sent_at": briefing.briefing_sent_at,
            "briefing_updated_at": briefing.briefing_updated_at,
            "visitor_name": conversation.visitor_name,
            "visitor_email": conversation.visitor_email,
            "visitor_company": conversation.visitor_company,
            "visitor_timezone": conversation.visitor_timezone,
            "summary": conversation.summary,
        }

    if record.user_from == "contact_form":
        submission = session.scalar(select(ContactSubmission).where(ContactSubmission.id == record.source_record_id))
        if submission is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Contact submission not found")
        return {
            "contact_id": submission.id,
            "name": submission.name,
            "email": submission.email,
            "subject": submission.subject,
            "message": submission.message,
            "status": submission.status,
            "notification_email_status": submission.notification_email_status,
            "email_error": submission.email_error,
            "source_ip": submission.source_ip,
            "user_agent": submission.user_agent,
            "created_at": submission.created_at,
            "updated_at": submission.updated_at,
        }

    if record.user_from == "talent_preview":
        request = session.scalar(select(TalentPreviewRequest).where(TalentPreviewRequest.id == record.source_record_id))
        if request is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Talent preview request not found")
        return {
            "request_id": request.id,
            "requester_name": request.requester_name,
            "requester_email": request.requester_email,
            "job_title": request.job_title,
            "search_criteria_1": request.search_criteria_1,
            "search_criteria_2": request.search_criteria_2,
            "search_criteria_3": request.search_criteria_3,
            "search_criteria_4": request.search_criteria_4,
            "exclusion_criteria": request.exclusion_criteria,
            "differentiator": request.differentiator,
            "status": request.status,
            "notification_email_status": request.notification_email_status,
            "confirmation_email_status": request.confirmation_email_status,
            "email_error": request.email_error,
            "source_ip": request.source_ip,
            "user_agent": request.user_agent,
            "notification_sent_at": request.notification_sent_at,
            "confirmation_sent_at": request.confirmation_sent_at,
            "created_at": request.created_at,
            "updated_at": request.updated_at,
        }

    if record.user_from == "booking":
        booking = session.scalar(select(Booking).where(Booking.id == record.source_record_id))
        if booking is None:
            raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Booking not found")
        conversation = session.get(Conversation, booking.conversation_id) if booking.conversation_id is not None else None
        return {
            "booking_id": booking.id,
            "conversation_id": booking.conversation_id,
            "google_event_id": booking.google_event_id,
            "participant_name": booking.participant_name,
            "participant_email": booking.participant_email,
            "starts_at_utc": booking.starts_at_utc,
            "ends_at_utc": booking.ends_at_utc,
            "timezone": booking.timezone,
            "status": booking.status,
            "idempotency_key": booking.idempotency_key,
            "conversation_summary": booking.conversation_summary,
            "created_at": booking.created_at,
            "confirmed_at": booking.confirmed_at,
            "cancelled_at": booking.cancelled_at,
            "visitor_name": conversation.visitor_name if conversation else None,
            "visitor_email": conversation.visitor_email if conversation else None,
            "visitor_company": conversation.visitor_company if conversation else None,
            "visitor_timezone": conversation.visitor_timezone if conversation else None,
        }

    raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Record source not supported")


def clean_value(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None
