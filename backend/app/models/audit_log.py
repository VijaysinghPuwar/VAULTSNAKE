import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    user_email: Mapped[str] = mapped_column(String(255), nullable=False)
    event_type: Mapped[str] = mapped_column(
        SAEnum(
            "login",
            "logout",
            "vault_create",
            "vault_read",
            "vault_update",
            "vault_delete",
            "admin_access",
            "unauthorized_access",
            "role_change",
            "suspicious_activity",
            name="audit_event_type",
        ),
        nullable=False,
        index=True,
    )
    description: Mapped[str] = mapped_column(Text, nullable=False)
    ip_address: Mapped[str] = mapped_column(String(64), nullable=True)
    severity: Mapped[str] = mapped_column(
        SAEnum("info", "warning", "critical", name="audit_severity"),
        nullable=False,
        default="info",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, index=True)
