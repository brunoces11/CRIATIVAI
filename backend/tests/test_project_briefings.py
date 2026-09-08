import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker

from backend.app.config import Settings
from backend.app.emailer import EmailDeliveryResult
from backend.app.models import Base, AdminRecord, Conversation, ProjectBriefing
from backend.app.project_briefings import build_briefing_idempotency_key, chat_capture_contact, project_briefing_send_email


def make_session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    return session_factory()


def briefing_settings() -> Settings:
    return Settings(forms_notification_email="bruno@criativai.site", _env_file=None)


def capture_email(email_calls: list[dict], status: str = "sent"):
    def _capture(**kwargs):
        email_calls.append(kwargs)
        return EmailDeliveryResult(status=status)

    return _capture


def make_conversation(session: Session, **kwargs) -> Conversation:
    conversation = Conversation(session_id="session_1234567890abcdef", **kwargs)
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


def build_key(conversation_id: int, turn_id: str, briefing_title: str, briefing_markdown: str) -> str:
    return build_briefing_idempotency_key(
        conversation_id=conversation_id,
        turn_id=turn_id,
        briefing_title=briefing_title,
        briefing_markdown=briefing_markdown,
    )


def test_new_conversation_starts_without_visitor_contact() -> None:
    session = make_session()
    conversation = make_conversation(session)

    assert conversation.visitor_name is None
    assert conversation.visitor_email is None


def test_chat_capture_contact_saves_contact_on_conversation() -> None:
    session = make_session()
    conversation = make_conversation(session)

    result = chat_capture_contact(
        session,
        conversation_id=conversation.id,
        name=" Bruno Cliente ",
        email=" CLIENTE@EXAMPLE.COM ",
        company=" CriativAI Buyer ",
        confirmed=True,
    )
    session.refresh(conversation)

    assert result.visitor_name == "Bruno Cliente"
    assert result.visitor_email == "cliente@example.com"
    assert result.visitor_company == "CriativAI Buyer"
    assert conversation.visitor_name == "Bruno Cliente"
    assert conversation.visitor_email == "cliente@example.com"
    assert conversation.visitor_company == "CriativAI Buyer"


def test_chat_capture_contact_rejects_invalid_email() -> None:
    session = make_session()
    conversation = make_conversation(session)

    with pytest.raises(HTTPException) as exc_info:
        chat_capture_contact(
            session,
            conversation_id=conversation.id,
            name="Cliente",
            email="invalid-email",
            company=None,
            confirmed=True,
        )

    assert exc_info.value.status_code == 400


def test_project_briefing_send_email_requires_contact() -> None:
    session = make_session()
    conversation = make_conversation(session)
    briefing_title = "CRM com IA"
    content = "Briefing completo do projeto."

    with pytest.raises(HTTPException) as exc_info:
        project_briefing_send_email(
            session,
            conversation_id=conversation.id,
            briefing_title=briefing_title,
            briefing_markdown=content,
            idempotency_key=build_key(conversation.id, "turn_1234567890abcdef", briefing_title, content),
            confirmed=True,
            settings=briefing_settings(),
        )

    assert exc_info.value.status_code == 400


def test_project_briefing_send_email_requires_title() -> None:
    session = make_session()
    conversation = make_conversation(session, visitor_name="Cliente", visitor_email="cliente@example.com")
    content = "Briefing completo do projeto."

    with pytest.raises(HTTPException) as exc_info:
        project_briefing_send_email(
            session,
            conversation_id=conversation.id,
            briefing_title=" ",
            briefing_markdown=content,
            idempotency_key=build_key(conversation.id, "turn_1234567890abcdef", " ", content),
            confirmed=True,
            settings=briefing_settings(),
        )

    assert exc_info.value.status_code == 400


def test_project_briefing_send_email_creates_briefing_and_sends_both_emails(monkeypatch: pytest.MonkeyPatch) -> None:
    session = make_session()
    conversation = make_conversation(
        session,
        visitor_name="Cliente",
        visitor_email="cliente@example.com",
        visitor_company="ACME",
    )
    email_calls: list[dict] = []
    monkeypatch.setattr("backend.app.project_briefings.send_email", capture_email(email_calls))

    briefing_title = "CRM com IA"
    content = "# Briefing\n\nAutomatizar qualificacao comercial."
    result = project_briefing_send_email(
        session,
        conversation_id=conversation.id,
        briefing_title=briefing_title,
        briefing_markdown=content,
        idempotency_key=build_key(conversation.id, "turn_1234567890abcdef", briefing_title, content),
        confirmed=True,
        settings=briefing_settings(),
    )

    briefing = session.scalar(select(ProjectBriefing).where(ProjectBriefing.briefing_id == result.briefing_id))
    assert briefing is not None
    assert briefing.conversation_id == conversation.id
    assert briefing.briefing_title == briefing_title
    assert briefing.briefing_markdown == content
    assert briefing.briefing_status == "sent"
    assert briefing.owner_email_status == "sent"
    assert briefing.client_email_status == "sent"
    assert briefing.briefing_sent_at is not None
    assert session.query(AdminRecord).count() == 1
    assert len(email_calls) == 2
    assert email_calls[0]["to_email"] == "bruno@criativai.site"
    assert email_calls[0]["reply_to"] == "cliente@example.com"
    assert email_calls[1]["to_email"] == "cliente@example.com"


def test_project_briefing_send_email_records_pending_config_without_smtp() -> None:
    session = make_session()
    conversation = make_conversation(session, visitor_name="Cliente", visitor_email="cliente@example.com")
    briefing_title = "CRM com IA"
    content = "Briefing completo do projeto."

    result = project_briefing_send_email(
        session,
        conversation_id=conversation.id,
        briefing_title=briefing_title,
        briefing_markdown=content,
        idempotency_key=build_key(conversation.id, "turn_1234567890abcdef", briefing_title, content),
        confirmed=True,
        settings=briefing_settings(),
    )

    assert result.briefing_status == "created"
    assert result.owner_email_status == "pending_config"
    assert result.client_email_status == "pending_config"


def test_project_briefing_send_email_is_idempotent_for_same_turn_and_same_content(monkeypatch: pytest.MonkeyPatch) -> None:
    session = make_session()
    conversation = make_conversation(session, visitor_name="Cliente", visitor_email="cliente@example.com")
    email_calls: list[dict] = []
    monkeypatch.setattr("backend.app.project_briefings.send_email", capture_email(email_calls))

    briefing_title = "CRM com IA"
    content = "Briefing completo do projeto."
    key = build_key(conversation.id, "turn_1234567890abcdef", briefing_title, content)

    first = project_briefing_send_email(
        session,
        conversation_id=conversation.id,
        briefing_title=briefing_title,
        briefing_markdown=content,
        idempotency_key=key,
        confirmed=True,
        settings=briefing_settings(),
    )
    second = project_briefing_send_email(
        session,
        conversation_id=conversation.id,
        briefing_title="CRM com IA duplicado",
        briefing_markdown="Nao deve criar outro briefing.",
        idempotency_key=key,
        confirmed=True,
        settings=briefing_settings(),
    )

    assert second.briefing_id == first.briefing_id
    assert session.query(ProjectBriefing).count() == 1
    assert len(email_calls) == 2


def test_project_briefing_send_email_allows_new_briefing_for_new_turn(monkeypatch: pytest.MonkeyPatch) -> None:
    session = make_session()
    conversation = make_conversation(session, visitor_name="Cliente", visitor_email="cliente@example.com")
    monkeypatch.setattr("backend.app.project_briefings.send_email", capture_email([]))

    first_briefing_title = "CRM com IA"
    first_content = "Primeiro briefing."
    first = project_briefing_send_email(
        session,
        conversation_id=conversation.id,
        briefing_title=first_briefing_title,
        briefing_markdown=first_content,
        idempotency_key=build_key(conversation.id, "turn_1234567890abcdef", first_briefing_title, first_content),
        confirmed=True,
        settings=briefing_settings(),
    )

    second_briefing_title = "Portal de atendimento"
    second_content = "Segundo briefing."
    second = project_briefing_send_email(
        session,
        conversation_id=conversation.id,
        briefing_title=second_briefing_title,
        briefing_markdown=second_content,
        idempotency_key=build_key(conversation.id, "turn_abcdef1234567890", second_briefing_title, second_content),
        confirmed=True,
        settings=briefing_settings(),
    )

    assert second.briefing_id != first.briefing_id
    assert session.query(ProjectBriefing).count() == 2


def test_build_briefing_idempotency_key_is_stable_for_same_turn_and_content() -> None:
    first = build_key(7, "turn_1234567890abcdef", "CRM com IA", "Mesmo briefing.")
    second = build_key(7, "turn_1234567890abcdef", "CRM com IA", "Mesmo briefing.")

    assert first == second
    assert first.startswith("briefing_")
