"""chat turn security

Revision ID: 0002_chat_turn_security
Revises: 0001_initial
Create Date: 2026-07-23
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0002_chat_turn_security"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("conversations", sa.Column("booking_state", sa.String(length=64), nullable=True))
    op.add_column("conversations", sa.Column("last_activity_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("messages", sa.Column("status", sa.String(length=32), nullable=False, server_default="completed"))
    op.add_column("messages", sa.Column("turn_id", sa.String(length=96), nullable=True))
    op.create_index("ix_conversations_last_activity_at", "conversations", ["last_activity_at"])
    op.create_index("ix_messages_turn_id", "messages", ["turn_id"])
    with op.batch_alter_table("messages") as batch_op:
        batch_op.create_unique_constraint("uq_messages_conversation_turn_role", ["conversation_id", "turn_id", "role"])


def downgrade() -> None:
    with op.batch_alter_table("messages") as batch_op:
        batch_op.drop_constraint("uq_messages_conversation_turn_role", type_="unique")
    op.drop_index("ix_messages_turn_id", table_name="messages")
    op.drop_index("ix_conversations_last_activity_at", table_name="conversations")
    op.drop_column("messages", "turn_id")
    op.drop_column("messages", "status")
    op.drop_column("conversations", "last_activity_at")
    op.drop_column("conversations", "booking_state")
