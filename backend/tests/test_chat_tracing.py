from pathlib import Path

from backend.app.chat_tracing import ChatTraceContext, build_chat_tracing_status, create_chat_trace_sink, is_chat_tracing_enabled, set_chat_tracing_enabled
from backend.app.config import Settings


def make_settings(tmp_path: Path) -> Settings:
    return Settings(
        chat_tracing_log_path=tmp_path / "chat-tracing-log.txt",
        chat_tracing_state_path=tmp_path / "chat-tracing-enabled.txt",
        _env_file=None,
    )


def test_chat_tracing_defaults_to_enabled_and_can_toggle(tmp_path: Path) -> None:
    settings = make_settings(tmp_path)

    assert is_chat_tracing_enabled(settings) is True
    status = build_chat_tracing_status(settings)
    assert status.enabled is True
    assert status.log_exists is False

    set_chat_tracing_enabled(False, settings=settings)
    assert is_chat_tracing_enabled(settings) is False

    set_chat_tracing_enabled(True, settings=settings)
    assert is_chat_tracing_enabled(settings) is True


def test_chat_trace_sink_appends_incremental_json_lines(tmp_path: Path) -> None:
    settings = make_settings(tmp_path)
    sink = create_chat_trace_sink(
        settings,
        ChatTraceContext(
            request_id="req_1234567890",
            conversation_id=7,
            session_id="session_1234567890abcdef",
            turn_id="turn_1234567890abcdef",
            mode="calendar",
        ),
    )

    sink.log("turn_start", user_message="Hello", history_count=3)
    sink.log("calendar_tool_call", name="calendar_check_availability", arguments={"visitor_timezone": "America/Sao_Paulo"})

    lines = settings.chat_tracing_log_path.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 2
    assert '"event":"turn_start"' in lines[0]
    assert '"event":"calendar_tool_call"' in lines[1]
    assert "session_1234567890abcdef" not in lines[0]
    assert "session_1234567890abcdef" not in lines[1]
    assert "sess...cdef" in lines[0]
