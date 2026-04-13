"""add conversation_summary to sessions

Revision ID: 20260413_0002
Revises: 20260411_0001
Create Date: 2026-04-13 14:00:00
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260413_0002"
down_revision: Union[str, None] = "20260411_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("sessions", sa.Column("conversation_summary", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("sessions", "conversation_summary")
