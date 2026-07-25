from backend.app.calendar_notifications import enable_calendar_notifications
from backend.app.config import Settings


class FakePatchRequest:
    def __init__(self, payload):
        self.payload = payload

    def execute(self):
        return {"status": "ok"}


class FakeGetRequest:
    def execute(self):
        return {
            "notificationSettings": {
                "notifications": [
                    {"type": "agenda", "method": "email"},
                    {"type": "eventCreation", "method": "email"},
                ]
            }
        }


class FakeListRequest:
    def execute(self):
        return {"items": [{"id": "owner@example.com", "primary": True}]}


class FakeCalendarList:
    def __init__(self):
        self.patch_calls = []

    def patch(self, **kwargs):
        self.patch_calls.append(kwargs)
        return FakePatchRequest(kwargs)

    def get(self, **kwargs):
        self.get_call = kwargs
        return FakeGetRequest()

    def list(self, **kwargs):
        self.list_call = kwargs
        return FakeListRequest()


class FakeService:
    def __init__(self):
        self.calendar_list = FakeCalendarList()

    def calendarList(self):
        return self.calendar_list


def test_enable_calendar_notifications_patches_calendar_list(monkeypatch, tmp_path) -> None:
    fake_service = FakeService()
    monkeypatch.setattr("backend.app.calendar_notifications.build_calendar_service", lambda _settings: fake_service)
    settings = Settings(
        google_client_id="client-id",
        google_client_secret="client-secret",
        google_redirect_uri="http://localhost/callback",
        google_token_path=tmp_path / "token.json",
        _env_file=None,
    )

    enable_calendar_notifications(settings)

    patch_call = fake_service.calendar_list.patch_calls[0]
    assert fake_service.calendar_list.list_call == {"minAccessRole": "owner"}
    assert fake_service.calendar_list.get_call == {"calendarId": "owner@example.com"}
    assert patch_call["calendarId"] == "owner@example.com"
    notifications = patch_call["body"]["notificationSettings"]["notifications"]
    assert {item["type"] for item in notifications} == {
        "agenda",
        "eventCreation",
        "eventChange",
        "eventCancellation",
        "eventResponse",
    }
    assert all(item["method"] == "email" for item in notifications)
