"""admin records

Revision ID: 0008_admin_records
Revises: 0007_project_briefings
Create Date: 2026-08-03
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0008_admin_records"
down_revision: str | None = "0007_project_briefings"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_tables = set(inspector.get_table_names())

    if "admin_records" not in existing_tables:
        op.create_table(
            "admin_records",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("user_from", sa.String(length=64), nullable=False),
            sa.Column("source_record_id", sa.Integer(), nullable=False),
            sa.Column("conversation_id", sa.Integer(), nullable=True),
            sa.Column("name", sa.String(length=200), nullable=True),
            sa.Column("email", sa.String(length=320), nullable=True),
            sa.Column("company", sa.String(length=200), nullable=True),
            sa.Column("timezone", sa.String(length=80), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("user_from", "source_record_id", name="uq_admin_records_user_from_source_record_id"),
        )

    existing_indexes = {index["name"] for index in inspector.get_indexes("admin_records")}
    if "ix_admin_records_user_from" not in existing_indexes:
        op.create_index("ix_admin_records_user_from", "admin_records", ["user_from"])
    if "ix_admin_records_created_at" not in existing_indexes:
        op.create_index("ix_admin_records_created_at", "admin_records", ["created_at"])

    op.execute(
        """
        INSERT OR IGNORE INTO admin_records (user_from, source_record_id, conversation_id, name, email, company, timezone, created_at)
        SELECT
            'briefing' AS user_from,
            pb.briefing_id AS source_record_id,
            pb.conversation_id AS conversation_id,
            c.visitor_name AS name,
            c.visitor_email AS email,
            c.visitor_company AS company,
            c.visitor_timezone AS timezone,
            pb.briefing_created_at AS created_at
        FROM project_briefings pb
        JOIN conversations c ON c.id = pb.conversation_id
        """
    )
    op.execute(
        """
        INSERT OR IGNORE INTO admin_records (user_from, source_record_id, conversation_id, name, email, company, timezone, created_at)
        SELECT
            'contact_form' AS user_from,
            cs.id AS source_record_id,
            NULL AS conversation_id,
            cs.name AS name,
            cs.email AS email,
            NULL AS company,
            NULL AS timezone,
            cs.created_at AS created_at
        FROM contact_submissions cs
        """
    )
    op.execute(
        """
        INSERT OR IGNORE INTO admin_records (user_from, source_record_id, conversation_id, name, email, company, timezone, created_at)
        SELECT
            'talent_preview' AS user_from,
            tp.id AS source_record_id,
            NULL AS conversation_id,
            tp.requester_name AS name,
            tp.requester_email AS email,
            NULL AS company,
            NULL AS timezone,
            tp.created_at AS created_at
        FROM talent_preview_requests tp
        """
    )
    op.execute(
        """
        INSERT OR IGNORE INTO admin_records (user_from, source_record_id, conversation_id, name, email, company, timezone, created_at)
        SELECT
            'booking' AS user_from,
            b.id AS source_record_id,
            b.conversation_id AS conversation_id,
            COALESCE(b.participant_name, c.visitor_name) AS name,
            b.participant_email AS email,
            c.visitor_company AS company,
            b.timezone AS timezone,
            b.created_at AS created_at
        FROM bookings b
        LEFT JOIN conversations c ON c.id = b.conversation_id
        """
    )


def downgrade() -> None:
    op.drop_index("ix_admin_records_created_at", table_name="admin_records")
    op.drop_index("ix_admin_records_user_from", table_name="admin_records")
    op.drop_table("admin_records")
