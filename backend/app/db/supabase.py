from __future__ import annotations

import os
from typing import Optional


def create_supabase_client() -> Optional[object]:
    url = os.getenv("SUPABASE_URL", "").strip()
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not (url and service_key):
        return None

    from supabase import create_client

    return create_client(url, service_key)
