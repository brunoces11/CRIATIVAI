from pathlib import Path
from types import SimpleNamespace

import pytest

from backend.app.config import Settings
from datetime import UTC, datetime

from backend.app.models import Conversation, Message
from backend.app.openai_chat import build_calendar_instructions, build_client_temporal_context, build_instructions, build_response_input, load_sdr_prompt, stream_openai_text


def test_build_response_input_uses_recent_public_roles() -> None:
    history = [
        Message(role="system", content="hidden"),
        Message(role="user", content="one"),
        Message(role="assistant", content="two"),
    ]

    assert build_response_input(history, "three") == [
        {"role": "user", "content": "one"},
        {"role": "assistant", "content": "two"},
        {"role": "user", "content": "three"},
    ]


def test_calendar_instructions_require_confirmation_of_reused_email(tmp_path: Path) -> None:
    prompt_path = tmp_path / "prompt.md"
    prompt_path.write_text("Default SDR prompt", encoding="utf-8")

    instructions = build_calendar_instructions(
        prompt_path,
        None,
        recent_visitor_email="cliente@example.com",
    )

    assert "cliente@example.com" in instructions
    assert "ask the visitor to confirm it" in instructions


def test_calendar_instructions_limit_long_day_availability_lists(tmp_path: Path) -> None:
    prompt_path = tmp_path / "prompt.md"
    prompt_path.write_text("Default SDR prompt", encoding="utf-8")

    instructions = build_calendar_instructions(prompt_path, None)

    assert "Never return more than 5 availability slots in one reply." in instructions
    assert "Bruno's schedule is very flexible for that day" in instructions


def test_client_temporal_context_uses_iana_timezone_and_server_time() -> None:
    conversation = Conversation(
        session_id="session_1234567890abcdef",
        visitor_timezone="Europe/Helsinki",
        visitor_locale="fi-FI",
    )

    context = build_client_temporal_context(
        conversation,
        Settings(_env_file=None),
        now=datetime(2026, 7, 24, 17, 0, tzinfo=UTC),
    )

    assert "CLIENT_TIMEZONE: Europe/Helsinki" in context
    assert "CLIENT_CURRENT_DATETIME: 2026-07-24T20:00:00+03:00" in context
    assert "CLIENT_LOCALE: fi-FI" in context
    assert "CALENDAR_OWNER_TIMEZONE: America/Sao_Paulo" in context


def test_client_temporal_context_handles_dst_with_zoneinfo() -> None:
    conversation = Conversation(session_id="session_1234567890abcdef", visitor_timezone="Europe/Helsinki")

    context = build_client_temporal_context(
        conversation,
        Settings(_env_file=None),
        now=datetime(2026, 1, 24, 17, 0, tzinfo=UTC),
    )

    assert "CLIENT_CURRENT_DATETIME: 2026-01-24T19:00:00+02:00" in context


def test_load_sdr_prompt_reads_editable_file(tmp_path: Path) -> None:
    prompt_path = tmp_path / "prompt.md"
    prompt_path.write_text("Default SDR prompt", encoding="utf-8")

    assert load_sdr_prompt(prompt_path) == "Default SDR prompt"


def test_build_instructions_appends_summary_without_changing_messages(tmp_path: Path) -> None:
    prompt_path = tmp_path / "prompt.md"
    prompt_path.write_text("Default SDR prompt", encoding="utf-8")

    instructions = build_instructions(prompt_path, "Visitor asked about automation.")

    assert "Default SDR prompt" in instructions
    assert "Visitor asked about automation." in instructions


def test_stream_openai_text_uses_responses_stream_with_store_false(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    prompt_path = tmp_path / "prompt.md"
    prompt_path.write_text("Prompt without secrets", encoding="utf-8")
    captured = {}

    class FakeStream:
        def __enter__(self):
            return self

        def __exit__(self, *_args):
            return False

        def __iter__(self):
            yield SimpleNamespace(type="response.output_text.delta", delta="Hello")
            yield SimpleNamespace(type="response.output_text.delta", delta=" world")

        def get_final_response(self):
            return SimpleNamespace(id="response_test")

    class FakeResponses:
        def stream(self, **kwargs):
            captured.update(kwargs)
            return FakeStream()

    class FakeOpenAI:
        def __init__(self, **kwargs):
            captured["client"] = kwargs
            self.responses = FakeResponses()

    monkeypatch.setattr("backend.app.openai_chat.OpenAI", FakeOpenAI)
    settings = Settings(
        openai_api_key="test-openai-key",
        openai_model="test-model",
        sdr_prompt_path=prompt_path,
        _env_file=None,
    )

    chunks = list(stream_openai_text(settings, [], "Hi"))

    assert chunks == ["Hello", " world"]
    assert captured["model"] == "test-model"
    assert captured["store"] is False
    assert captured["instructions"] == "Prompt without secrets"
    assert captured["input"] == [{"role": "user", "content": "Hi"}]
    assert captured["client"]["api_key"] == "test-openai-key"


def test_stream_openai_text_supports_explicit_test_mock() -> None:
    settings = Settings(openai_mock_response="mock response", _env_file=None)

    assert "".join(stream_openai_text(settings, [], "Hi")).strip() == "mock response"
