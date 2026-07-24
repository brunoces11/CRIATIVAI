from datetime import datetime

from pydantic import BaseModel, Field, field_validator, model_validator

SESSION_ID_PATTERN = r"^[A-Za-z0-9_-]{16,64}$"
TURN_ID_PATTERN = r"^[A-Za-z0-9_-]{16,96}$"
EMAIL_PATTERN = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"


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


class AdminPromptResponse(BaseModel):
    content: str


class AdminPromptUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=40000)

    @field_validator("content", mode="before")
    @classmethod
    def strip_content(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value


class TalentPreviewSubmissionCreate(BaseModel):
    requester_name: str = Field(min_length=2, max_length=160)
    requester_email: str = Field(min_length=3, max_length=320, pattern=EMAIL_PATTERN)
    job_title: str = Field(min_length=2, max_length=200)
    search_criteria_1: str = Field(min_length=2, max_length=2000)
    search_criteria_2: str | None = Field(default=None, max_length=220)
    search_criteria_3: str | None = Field(default=None, max_length=220)
    search_criteria_4: str | None = Field(default=None, max_length=220)
    exclusion_criteria: str | None = Field(default=None, max_length=220)
    differentiator: str | None = Field(default=None, max_length=220)
    started_at_ms: int = Field(gt=0)
    honeypot: str = Field(default="", max_length=200)

    @field_validator(
        "requester_name",
        "requester_email",
        "job_title",
        "search_criteria_1",
        "search_criteria_2",
        "search_criteria_3",
        "search_criteria_4",
        "exclusion_criteria",
        "differentiator",
        "honeypot",
        mode="before",
    )
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_honeypot(self) -> "TalentPreviewSubmissionCreate":
        if self.honeypot:
            raise ValueError("Invalid submission")
        self.search_criteria_2 = self.search_criteria_2.strip() if isinstance(self.search_criteria_2, str) else ""
        self.search_criteria_3 = self.search_criteria_3.strip() if isinstance(self.search_criteria_3, str) else ""
        self.search_criteria_4 = self.search_criteria_4.strip() if isinstance(self.search_criteria_4, str) else ""
        self.exclusion_criteria = self.exclusion_criteria.strip() if isinstance(self.exclusion_criteria, str) else ""
        self.differentiator = self.differentiator.strip() if isinstance(self.differentiator, str) else ""
        return self


class ContactSubmissionCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: str = Field(min_length=3, max_length=320, pattern=EMAIL_PATTERN)
    subject: str = Field(min_length=2, max_length=220)
    message: str = Field(min_length=10, max_length=5000)
    started_at_ms: int = Field(gt=0)
    honeypot: str = Field(default="", max_length=200)

    @field_validator("name", "email", "subject", "message", "honeypot", mode="before")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_honeypot(self) -> "ContactSubmissionCreate":
        if self.honeypot:
            raise ValueError("Invalid submission")
        return self


class FormSubmissionResponse(BaseModel):
    ok: bool = True
    reference_id: int
    notification_email_status: str
    confirmation_email_status: str | None = None
