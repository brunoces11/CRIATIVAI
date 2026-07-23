from datetime import datetime

from pydantic import BaseModel, Field

SESSION_ID_PATTERN = r"^[A-Za-z0-9_-]{16,64}$"
TURN_ID_PATTERN = r"^[A-Za-z0-9_-]{16,96}$"


class HealthResponse(BaseModel):
    ok: bool
    database: bool
    frontend: bool


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str | None = Field(default=None, min_length=16, max_length=64, pattern=SESSION_ID_PATTERN)
    turn_id: str | None = Field(default=None, min_length=16, max_length=96, pattern=TURN_ID_PATTERN)


class ConversationMessage(BaseModel):
    role: str
    content: str


class ConversationResponse(BaseModel):
    session_id: str
    messages: list[ConversationMessage]


class AdminConversationSummary(BaseModel):
    id: int
    visitor_label: str
    last_activity_at: datetime | None
    status: str
    booking_state: str | None
    summary: str | None


class AdminConversationMessage(BaseModel):
    role: str
    content: str
    status: str
    created_at: datetime | None


class AdminConversationDetail(AdminConversationSummary):
    messages: list[AdminConversationMessage]


class GoogleOAuthStatus(BaseModel):
    status: str
    calendar_id: str | None = None
    scopes: list[str] = []
