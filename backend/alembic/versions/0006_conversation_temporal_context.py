"""conversation temporal context

Revision ID: 0006_conversation_temporal_context
Revises: 0005_booking_participant_details
Create Date: 2026-07-24
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0006_conversation_temporal_context"
down_revision: str | None = "0005_booking_participant_details"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("conversations", sa.Column("visitor_locale", sa.String(length=40), nullable=True))
    op.add_column("conversations", sa.Column("visitor_timezone_source", sa.String(length=32), nullable=True))


def downgrade() -> None:
    op.drop_column("conversations", "visitor_timezone_source")
    op.drop_column("conversations", "visitor_locale")
