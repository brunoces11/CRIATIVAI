"""form submissions

Revision ID: 0003_form_submissions
Revises: 0002_chat_turn_security
Create Date: 2026-07-23
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0003_form_submissions"
down_revision: str | None = "0002_chat_turn_security"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "talent_preview_requests",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("requester_name", sa.String(length=160), nullable=False),
        sa.Column("requester_email", sa.String(length=320), nullable=False),
        sa.Column("job_title", sa.String(length=200), nullable=False),
        sa.Column("search_criteria_1", sa.String(length=220), nullable=False),
        sa.Column("search_criteria_2", sa.String(length=220), nullable=False),
        sa.Column("search_criteria_3", sa.String(length=220), nullable=False),
        sa.Column("search_criteria_4", sa.String(length=220), nullable=False),
        sa.Column("exclusion_criteria", sa.String(length=220), nullable=False),
        sa.Column("differentiator", sa.String(length=220), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="new"),
        sa.Column("notification_email_status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("confirmation_email_status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("email_error", sa.Text(), nullable=True),
        sa.Column("source_ip", sa.String(length=80), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("notification_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("confirmation_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.current_timestamp(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.current_timestamp(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_talent_preview_requests_requester_email", "talent_preview_requests", ["requester_email"])

    op.create_table(
        "contact_submissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("subject", sa.String(length=220), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="new"),
        sa.Column("notification_email_status", sa.String(length=32), nullable=False, server_default="pending"),
        sa.Column("email_error", sa.Text(), nullable=True),
        sa.Column("source_ip", sa.String(length=80), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("notification_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.current_timestamp(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.current_timestamp(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_contact_submissions_email", "contact_submissions", ["email"])


def downgrade() -> None:
    op.drop_index("ix_contact_submissions_email", table_name="contact_submissions")
    op.drop_table("contact_submissions")
    op.drop_index("ix_talent_preview_requests_requester_email", table_name="talent_preview_requests")
    op.drop_table("talent_preview_requests")
