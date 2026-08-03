from __future__ import annotations

from datetime import date, datetime
import json
from typing import Any, Callable, Literal

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST

from backend.app.calendar_availability import calendar_check_availability
from backend.app.calendar_booking import calendar_cancel_event, calendar_create_event, calendar_lookup_bookings, calendar_update_event
from backend.app.config import Settings
from backend.app.models import Conversation
from backend.app.project_briefings import chat_capture_contact, project_briefing_send_email


class CalendarCheckAvailabilityArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    visitor_timezone: str = Field(min_length=1, max_length=80)
    requested_start: datetime | None = None
    requested_date: date | None = None
    requested_end_date: date | None = None
    requested_period: Literal["morning", "afternoon", "evening"] | None = None


class CalendarCreateEventArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    participant_name: str = Field(min_length=1, max_length=200)
    participant_email: str = Field(min_length=3, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    visitor_timezone: str = Field(min_length=1, max_length=80)
    starts_at: datetime
    idempotency_key: str = Field(min_length=16, max_length=128)
    meeting_summary: str = Field(min_length=20, max_length=1200)
    confirmed: bool


class CalendarLookupBookingsArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    participant_email: str = Field(min_length=3, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class CalendarUpdateEventArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    participant_email: str = Field(min_length=3, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    booking_id: int | None = Field(default=None, ge=1)
    visitor_timezone: str = Field(min_length=1, max_length=80)
    new_starts_at: datetime
    confirmed: bool


class CalendarCancelEventArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    participant_email: str = Field(min_length=3, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    booking_id: int | None = Field(default=None, ge=1)
    confirmed: bool


class ChatCaptureContactArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1, max_length=200)
    email: str = Field(min_length=3, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    company: str | None = Field(default=None, max_length=200)
    confirmed: bool


class ProjectBriefingSendEmailArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=1, max_length=220)
    briefing_markdown: str = Field(min_length=1, max_length=40000)
    idempotency_key: str = Field(min_length=16, max_length=128)
    confirmed: bool


def function_tool(*, name: str, description: str, model: type[BaseModel]) -> dict[str, Any]:
    schema = model.model_json_schema()
    schema["additionalProperties"] = False
    schema["required"] = list(schema.get("properties", {}).keys())
    return {
        "type": "function",
        "name": name,
        "description": description,
        "parameters": schema,
        "strict": True,
    }


TOOL_ARGUMENT_MODELS: dict[str, type[BaseModel]] = {
    "calendar_check_availability": CalendarCheckAvailabilityArgs,
    "calendar_create_event": CalendarCreateEventArgs,
    "calendar_lookup_bookings": CalendarLookupBookingsArgs,
    "calendar_update_event": CalendarUpdateEventArgs,
    "calendar_cancel_event": CalendarCancelEventArgs,
    "chat_capture_contact": ChatCaptureContactArgs,
    "project_briefing_send_email": ProjectBriefingSendEmailArgs,
}


CALENDAR_TOOLS: list[dict[str, Any]] = [
    function_tool(
        name="calendar_check_availability",
        description="Check available CriativAI meeting slots. Set requested_start for an exact requested time. Set requested_date for a day-only request, requested_end_date for a date range such as next week, and requested_period for morning/afternoon/evening in the visitor timezone. Use null dates for general suggestions. Returns only available slots, never busy event details.",
        model=CalendarCheckAvailabilityArgs,
    ),
    function_tool(
        name="calendar_create_event",
        description="Create a confirmed CriativAI meeting after the visitor explicitly confirms an available slot. meeting_summary is a concise 3-4 line Portuguese summary of the visitor's reason for the meeting.",
        model=CalendarCreateEventArgs,
    ),
    function_tool(
        name="calendar_lookup_bookings",
        description="Search live Google Calendar events for one participant email and return every non-cancelled matching event. Use this before asking for a new time when the visitor wants to check, change, or cancel an existing booking. It never changes a booking.",
        model=CalendarLookupBookingsArgs,
    ),
    function_tool(
        name="calendar_update_event",
        description="Reschedule a confirmed CriativAI booking using the participant email first, or booking_id if already known. If several confirmed bookings share the same email, the tool returns candidates for clarification.",
        model=CalendarUpdateEventArgs,
    ),
    function_tool(
        name="calendar_cancel_event",
        description="Cancel a confirmed CriativAI booking using the participant email first, or booking_id if already known. If several confirmed bookings share the same email, the tool returns candidates for clarification.",
        model=CalendarCancelEventArgs,
    ),
    function_tool(
        name="chat_capture_contact",
        description="Save the current visitor's confirmed contact details on the active chat conversation. Use only after the visitor explicitly confirms the name and email to store. Company may be null.",
        model=ChatCaptureContactArgs,
    ),
    function_tool(
        name="project_briefing_send_email",
        description="Create a confirmed project briefing for the active chat conversation and email it to Bruno and the visitor. The title must be a short LLM-created phrase describing the briefing. Use only after the visitor explicitly confirms the contact details and final briefing content.",
        model=ProjectBriefingSendEmailArgs,
    ),
]


def execute_calendar_tool(
    name: str,
    raw_arguments: str,
    *,
    session: Session,
    conversation: Conversation,
    settings: Settings,
) -> dict[str, Any]:
    model = TOOL_ARGUMENT_MODELS.get(name)
    if model is None:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Unknown calendar tool")

    try:
        payload = json.loads(raw_arguments or "{}")
        args = model.model_validate(payload)
    except (json.JSONDecodeError, ValidationError) as exc:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail="Invalid calendar tool arguments") from exc

    handlers: dict[str, Callable[[BaseModel], dict[str, Any]]] = {
        "calendar_check_availability": lambda parsed: serialize_availability(
            calendar_check_availability(
                parsed.visitor_timezone,  # type: ignore[attr-defined]
                requested_start=parsed.requested_start,  # type: ignore[attr-defined]
                requested_date=parsed.requested_date,  # type: ignore[attr-defined]
                requested_end_date=parsed.requested_end_date,  # type: ignore[attr-defined]
                requested_period=parsed.requested_period,  # type: ignore[attr-defined]
                settings=settings,
            )
        ),
        "calendar_create_event": lambda parsed: serialize_booking(
            calendar_create_event(
                session,
                conversation_id=conversation.id,
                participant_name=parsed.participant_name,  # type: ignore[attr-defined]
                participant_email=parsed.participant_email,  # type: ignore[attr-defined]
                visitor_timezone=parsed.visitor_timezone,  # type: ignore[attr-defined]
                starts_at=parsed.starts_at,  # type: ignore[attr-defined]
                idempotency_key=parsed.idempotency_key,  # type: ignore[attr-defined]
                meeting_summary=parsed.meeting_summary,  # type: ignore[attr-defined]
                confirmed=parsed.confirmed,  # type: ignore[attr-defined]
                settings=settings,
            )
        ),
        "calendar_lookup_bookings": lambda parsed: {
            "bookings": [serialize_booking(booking) for booking in calendar_lookup_bookings(
                session,
                participant_email=parsed.participant_email,  # type: ignore[attr-defined]
                settings=settings,
            )]
        },
        "calendar_update_event": lambda parsed: serialize_booking(
            calendar_update_event(
                session,
                participant_email=parsed.participant_email,  # type: ignore[attr-defined]
                booking_id=parsed.booking_id,  # type: ignore[attr-defined]
                visitor_timezone=parsed.visitor_timezone,  # type: ignore[attr-defined]
                new_starts_at=parsed.new_starts_at,  # type: ignore[attr-defined]
                confirmed=parsed.confirmed,  # type: ignore[attr-defined]
                settings=settings,
            )
        ),
        "calendar_cancel_event": lambda parsed: serialize_booking(
            calendar_cancel_event(
                session,
                participant_email=parsed.participant_email,  # type: ignore[attr-defined]
                booking_id=parsed.booking_id,  # type: ignore[attr-defined]
                confirmed=parsed.confirmed,  # type: ignore[attr-defined]
                settings=settings,
            )
        ),
        "chat_capture_contact": lambda parsed: serialize_contact_capture(
            chat_capture_contact(
                session,
                conversation_id=conversation.id,
                name=parsed.name,  # type: ignore[attr-defined]
                email=parsed.email,  # type: ignore[attr-defined]
                company=parsed.company,  # type: ignore[attr-defined]
                confirmed=parsed.confirmed,  # type: ignore[attr-defined]
            )
        ),
        "project_briefing_send_email": lambda parsed: serialize_project_briefing(
            project_briefing_send_email(
                session,
                conversation_id=conversation.id,
                title=parsed.title,  # type: ignore[attr-defined]
                briefing_markdown=parsed.briefing_markdown,  # type: ignore[attr-defined]
                idempotency_key=parsed.idempotency_key,  # type: ignore[attr-defined]
                confirmed=parsed.confirmed,  # type: ignore[attr-defined]
                settings=settings,
            )
        ),
    }
    return handlers[name](args)


def serialize_availability(slots) -> dict[str, Any]:
    return {
        "slots": [
            {
                "start": slot.start.isoformat(),
                "end": slot.end.isoformat(),
                "timezone": slot.timezone,
            }
            for slot in slots
        ]
    }


def serialize_booking(booking) -> dict[str, Any]:
    return {
        "booking_id": booking.booking_id,
        "starts_at_utc": booking.starts_at_utc.isoformat(),
        "ends_at_utc": booking.ends_at_utc.isoformat(),
        "timezone": booking.timezone,
        "status": booking.status,
        "participant_name": getattr(booking, "participant_name", None),
        "participant_email": getattr(booking, "participant_email", None),
        "conversation_summary": getattr(booking, "conversation_summary", None),
        "meet_link": booking.meet_link,
    }


def serialize_contact_capture(contact) -> dict[str, Any]:
    return {
        "conversation_id": contact.conversation_id,
        "visitor_name": contact.visitor_name,
        "visitor_email": contact.visitor_email,
        "visitor_company": contact.visitor_company,
    }


def serialize_project_briefing(briefing) -> dict[str, Any]:
    return {
        "briefing_id": briefing.briefing_id,
        "conversation_id": briefing.conversation_id,
        "briefing_title": briefing.briefing_title,
        "briefing_status": briefing.briefing_status,
        "idempotency_key": briefing.idempotency_key,
        "owner_email_status": briefing.owner_email_status,
        "client_email_status": briefing.client_email_status,
        "email_error": briefing.email_error,
        "briefing_sent_at": briefing.briefing_sent_at.isoformat() if briefing.briefing_sent_at else None,
    }
