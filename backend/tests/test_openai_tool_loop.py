import json
from types import SimpleNamespace

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.config import Settings
from backend.app.models import Base, Conversation
from backend.app.openai_chat import PublicToolStatus, stream_openai_text_with_calendar_tools


def make_session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()


class FakeResponses:
    def __init__(self):
        self.calls = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        if len(self.calls) == 1:
            return SimpleNamespace(
                output_text="",
                output=[
                    SimpleNamespace(
                        type="function_call",
                        call_id="call_1",
                        name="calendar_check_availability",
                        arguments=json.dumps({"visitor_timezone": "America/Sao_Paulo"}),
                    )
                ],
            )
        return SimpleNamespace(output_text="Tenho 3 horários disponíveis.", output=[])


class FakeClient:
    def __init__(self):
        self.responses = FakeResponses()


def test_openai_tool_loop_runs_tool_and_continues(monkeypatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()
    settings = Settings(
        openai_mock_response=None,
        openai_api_key="test-key",
        sdr_prompt_path=tmp_path / "prompt.md",
        _env_file=None,
    )
    settings.sdr_prompt_path.write_text("You are helpful.", encoding="utf-8")
    monkeypatch.setattr(
        "backend.app.openai_chat.execute_calendar_tool",
        lambda *_args, **_kwargs: {"slots": [{"start": "2026-07-27T08:00:00-03:00"}]},
    )
    client = FakeClient()

    events = list(stream_openai_text_with_calendar_tools(client, settings, session, conversation, [], "Quero agendar", None))

    assert any(isinstance(event, PublicToolStatus) for event in events)
    assert events[-1] == "Tenho 3 horários disponíveis."
    assert client.responses.calls[0]["tools"]
    second_input = client.responses.calls[1]["input"]
    assert second_input[-2]["type"] == "function_call"
    assert second_input[-1]["type"] == "function_call_output"
    assert second_input[-1]["call_id"] == "call_1"


def test_openai_tool_loop_returns_calendar_errors_to_model(monkeypatch, tmp_path) -> None:
    session = make_session()
    conversation = Conversation(session_id="session_1234567890abcdef")
    session.add(conversation)
    session.commit()
    settings = Settings(
        openai_mock_response=None,
        openai_api_key="test-key",
        sdr_prompt_path=tmp_path / "prompt.md",
        _env_file=None,
    )
    settings.sdr_prompt_path.write_text("You are helpful.", encoding="utf-8")

    def fail_calendar_tool(*_args, **_kwargs):
        raise HTTPException(status_code=503, detail="Google Calendar is not connected")

    monkeypatch.setattr("backend.app.openai_chat.execute_calendar_tool", fail_calendar_tool)
    client = FakeClient()

    events = list(stream_openai_text_with_calendar_tools(client, settings, session, conversation, [], "Quero agendar", None))

    assert any(isinstance(event, PublicToolStatus) for event in events)
    assert events[-1] == "Tenho 3 horários disponíveis."
    tool_output = json.loads(client.responses.calls[1]["input"][-1]["output"])
    assert tool_output["error"]["message"] == "Google Calendar is not connected"
    assert tool_output["error"]["status_code"] == 503
