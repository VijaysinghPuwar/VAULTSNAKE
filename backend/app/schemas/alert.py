from datetime import datetime
from pydantic import BaseModel
from typing import Literal


class AlertOut(BaseModel):
    id: str
    user_id: str
    alert_type: str
    description: str
    severity: Literal["low", "medium", "high", "critical"]
    is_resolved: bool
    created_at: datetime
    resolved_at: datetime | None

    model_config = {"from_attributes": True}


class AlertWithUser(AlertOut):
    user_email: str | None = None
