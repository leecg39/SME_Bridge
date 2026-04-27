from __future__ import annotations

import os
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine


def create_engine_from_env() -> Optional[AsyncEngine]:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        return None
    return create_async_engine(database_url, pool_pre_ping=True)
