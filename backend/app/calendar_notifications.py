from __future__ import annotations

from fastapi import HTTPException
from googleapiclient.errors import HttpError
from starlette.status import HTTP_503_SERVICE_UNAVAILABLE

from backend.app.calendar_availability import build_calendar_service
from backend.app.config import Settings

REQUIRED_EMAIL_NOTIFICATION_TYPES = {
    "eventCreation",
    "eventChange",
    "eventCancellation",
    "eventResponse",
}


def enable_calendar_notifications(settings: Settings) -> None:
    service = build_calendar_service(settings)
    calendar_list_id = resolve_calendar_list_id(service, settings.google_calendar_id)
    entry = service.calendarList().get(calendarId=calendar_list_id).execute()
    existing_notifications = entry.get("notificationSettings", {}).get("notifications", [])
    notifications = merge_email_notifications(existing_notifications)
    body = {
        "notificationSettings": {
            "notifications": notifications
        }
    }

    try:
        service.calendarList().patch(calendarId=calendar_list_id, body=body).execute()
    except HttpError as exc:
        raise HTTPException(
            status_code=HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google Calendar notification settings could not be configured",
        ) from exc


def resolve_calendar_list_id(service, calendar_id: str) -> str:
    if calendar_id != "primary":
        return calendar_id

    response = service.calendarList().list(minAccessRole="owner").execute()
    for item in response.get("items", []):
        if item.get("primary"):
            return item["id"]

    return calendar_id


def merge_email_notifications(existing_notifications: list[dict]) -> list[dict]:
    notifications = [
        notification
        for notification in existing_notifications
        if notification.get("type") and notification.get("method")
    ]
    configured_pairs = {
        (notification.get("type"), notification.get("method"))
        for notification in notifications
    }

    for notification_type in sorted(REQUIRED_EMAIL_NOTIFICATION_TYPES):
        pair = (notification_type, "email")
        if pair not in configured_pairs:
            notifications.append({"type": notification_type, "method": "email"})

    return notifications
