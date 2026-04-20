import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Boolean, Enum as SAEnum, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    alert_type: Mapped[str] = mapped_column(
        SAEnum(
            "repeated_unauthorized_access",
            "rapid_vault_operations",
            "suspicious_login_pattern",
            "bulk_data_access",
            "admin_escalation_attempt",
            name="alert_type",
        ),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(
        SAEnum("low", "medium", "high", "critical", name="alert_severity"),
        nullable=False,
        default="medium",
    )
    is_resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    resolved_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
