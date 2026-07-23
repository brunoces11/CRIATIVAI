from collections.abc import Iterator, Sequence
import logging
from pathlib import Path

from openai import APIConnectionError, APIStatusError, APITimeoutError, AuthenticationError, OpenAI, RateLimitError

from backend.app.config import Settings
from backend.app.models import Message

logger = logging.getLogger(__name__)

PUBLIC_OPENAI_ERROR = "The assistant is temporarily unavailable. Please try again in a moment."


class OpenAIChatUnavailable(RuntimeError):
    pass


def stream_openai_text(
    settings: Settings,
    history: Sequence[Message],
    user_message: str,
    summary: str | None = None,
) -> Iterator[str]:
    if settings.openai_mock_response is not None:
        for token in settings.openai_mock_response.split(" "):
            yield f"{token} "
        return

    if settings.openai_api_key is None:
        raise OpenAIChatUnavailable("OpenAI API key is not configured.")

    client = OpenAI(
        api_key=settings.openai_api_key.get_secret_value(),
        timeout=settings.openai_timeout_seconds,
    )

    try:
        with client.responses.stream(
            model=settings.openai_model,
            instructions=build_instructions(settings.sdr_prompt_path, summary),
            input=build_response_input(history, user_message, settings.chat_context_recent_messages),
            store=False,
        ) as stream:
            for event in stream:
                if event.type == "response.output_text.delta":
                    yield event.delta
                elif event.type == "response.error":
                    raise OpenAIChatUnavailable(PUBLIC_OPENAI_ERROR)
            stream.get_final_response()
    except (AuthenticationError, RateLimitError, APITimeoutError, APIConnectionError, APIStatusError) as exc:
        logger.warning("OpenAI request failed: %s", exc.__class__.__name__)
        raise OpenAIChatUnavailable(PUBLIC_OPENAI_ERROR) from exc


def build_response_input(history: Sequence[Message], user_message: str, recent_limit: int = 12) -> list[dict[str, str]]:
    items: list[dict[str, str]] = []
    for message in history[-recent_limit:]:
        if message.role not in {"user", "assistant"}:
            continue
        items.append({"role": message.role, "content": message.content})
    items.append({"role": "user", "content": user_message})
    return items


def build_instructions(path: Path, summary: str | None) -> str:
    prompt = load_sdr_prompt(path)
    if not summary:
        return prompt
    return f"{prompt}\n\nCurrent conversation summary for continuity:\n{summary}"


def load_sdr_prompt(path: Path) -> str:
    prompt = path.read_text(encoding="utf-8").strip()
    if not prompt:
        raise OpenAIChatUnavailable("SDR prompt is empty.")
    return prompt
