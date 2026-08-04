"""project briefings

Revision ID: 0007_project_briefings
Revises: 0006_conversation_temporal_context
Create Date: 2026-08-02
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0007_project_briefings"
down_revision: str | None = "0006_conversation_temporal_context"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "project_briefings" not in existing_tables:
        op.create_table(
            "project_briefings",
            sa.Column("briefing_id", sa.Integer(), primary_key=True),
            sa.Column("conversation_id", sa.Integer(), sa.ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False),
            sa.Column("briefing_title", sa.String(length=220), nullable=False),
            sa.Column("briefing_markdown", sa.Text(), nullable=False),
            sa.Column("briefing_status", sa.String(length=32), nullable=False, server_default="created"),
            sa.Column("idempotency_key", sa.String(length=128), nullable=False),
            sa.Column("owner_email_status", sa.String(length=32), nullable=False, server_default="pending"),
            sa.Column("client_email_status", sa.String(length=32), nullable=False, server_default="pending"),
            sa.Column("email_error", sa.Text(), nullable=True),
            sa.Column("briefing_created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.Column("briefing_sent_at", sa.DateTime(timezone=True), nullable=True),
            sa.Column("briefing_updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")),
            sa.UniqueConstraint("idempotency_key", name="uq_project_briefings_idempotency_key"),
        )

    existing_indexes = {index["name"] for index in inspector.get_indexes("project_briefings")}
    if "ix_project_briefings_conversation_id" not in existing_indexes:
        op.create_index("ix_project_briefings_conversation_id", "project_briefings", ["conversation_id"])


def downgrade() -> None:
    op.drop_index("ix_project_briefings_conversation_id", table_name="project_briefings")
    op.drop_table("project_briefings")
