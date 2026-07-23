from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    ok: bool
    database: bool
    frontend: bool


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str | None = Field(default=None, min_length=16, max_length=64)


class ConversationMessage(BaseModel):
    role: str
    content: str


class ConversationResponse(BaseModel):
    session_id: str
    messages: list[ConversationMessage]
