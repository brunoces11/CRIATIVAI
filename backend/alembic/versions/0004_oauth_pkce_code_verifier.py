"""oauth pkce code verifier

Revision ID: 0004_oauth_pkce_code_verifier
Revises: 0003_form_submissions
Create Date: 2026-07-24
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0004_oauth_pkce_code_verifier"
down_revision: str | None = "0003_form_submissions"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("oauth_states", sa.Column("code_verifier", sa.String(length=128), nullable=True))


def downgrade() -> None:
    op.drop_column("oauth_states", "code_verifier")
