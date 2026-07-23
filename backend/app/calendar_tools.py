from __future__ import annotations

from datetime import datetime
import json
from typing import Any, Callable

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from sqlalchemy.orm import Session
from starlette.status import HTTP_400_BAD_REQUEST

from backend.app.calendar_availability import calendar_check_availability
from backend.app.calendar_booking import calendar_cancel_event, calendar_create_event, calendar_update_event
from backend.app.config import Settings
from backend.app.models import Conversation


class CalendarCheckAvailabilityArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    visitor_timezone: str = Field(min_length=1, max_length=80)


class CalendarCreateEventArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    participant_name: str = Field(min_length=1, max_length=200)
    participant_email: str = Field(min_length=3, max_length=320, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    visitor_timezone: str = Field(min_length=1, max_length=80)
    starts_at: datetime
    idempotency_key: str = Field(min_length=16, max_length=128)
    confirmed: bool


class CalendarUpdateEventArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    booking_id: int = Field(ge=1)
    visitor_timezone: str = Field(min_length=1, max_length=80)
    new_starts_at: datetime
    confirmed: bool


class CalendarCancelEventArgs(BaseModel):
    model_config = ConfigDict(extra="forbid")

    booking_id: int = Field(ge=1)
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
    "calendar_update_event": CalendarUpdateEventArgs,
    "calendar_cancel_event": CalendarCancelEventArgs,
}


CALENDAR_TOOLS: list[dict[str, Any]] = [
    function_tool(
        name="calendar_check_availability",
        description="Check available CriativAI meeting slots. Returns only available slots, never busy event details.",
        model=CalendarCheckAvailabilityArgs,
    ),
    function_tool(
        name="calendar_create_event",
        description="Create a confirmed CriativAI meeting after the visitor explicitly confirms an offered slot.",
        model=CalendarCreateEventArgs,
    ),
    function_tool(
        name="calendar_update_event",
        description="Reschedule an existing confirmed CriativAI booking owned by this conversation after explicit confirmation.",
        model=CalendarUpdateEventArgs,
    ),
    function_tool(
        name="calendar_cancel_event",
        description="Cancel an existing confirmed CriativAI booking owned by this conversation after explicit confirmation.",
        model=CalendarCancelEventArgs,
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
                confirmed=parsed.confirmed,  # type: ignore[attr-defined]
                settings=settings,
            )
        ),
        "calendar_update_event": lambda parsed: serialize_booking(
            calendar_update_event(
                session,
                conversation_id=conversation.id,
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
                conversation_id=conversation.id,
                booking_id=parsed.booking_id,  # type: ignore[attr-defined]
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
        "meet_link": booking.meet_link,
    }
