from pathlib import Path
from types import SimpleNamespace

import pytest

from backend.app.config import Settings
from backend.app.models import Message
from backend.app.openai_chat import build_response_input, load_sdr_prompt, stream_openai_text


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


def test_load_sdr_prompt_reads_editable_file(tmp_path: Path) -> None:
    prompt_path = tmp_path / "prompt.md"
    prompt_path.write_text("Default SDR prompt", encoding="utf-8")

    assert load_sdr_prompt(prompt_path) == "Default SDR prompt"


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
