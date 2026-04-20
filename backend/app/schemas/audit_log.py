from datetime import datetime
from pydantic import BaseModel
from typing import Literal


class AuditLogOut(BaseModel):
    id: str
    user_email: str
    event_type: str
    description: str
    ip_address: str | None
    severity: Literal["info", "warning", "critical"]
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditSummary(BaseModel):
    total_events: int
    logins: int
    vault_operations: int
    warnings: int
    critical_events: int
    last_activity: datetime | None
