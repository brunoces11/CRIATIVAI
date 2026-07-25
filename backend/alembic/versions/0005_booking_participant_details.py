"""booking participant details

Revision ID: 0005_booking_participant_details
Revises: 0004_oauth_pkce_code_verifier
Create Date: 2026-07-24
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0005_booking_participant_details"
down_revision: str | None = "0004_oauth_pkce_code_verifier"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("bookings", sa.Column("participant_name", sa.String(length=200), nullable=True))
    op.add_column("bookings", sa.Column("conversation_summary", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("bookings", "conversation_summary")
    op.drop_column("bookings", "participant_name")
