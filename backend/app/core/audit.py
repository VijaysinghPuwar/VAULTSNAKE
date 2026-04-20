from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
from app.models.user import User


def log_event(
    db: Session,
    event_type: str,
    description: str,
    user: User | None = None,
    ip_address: str | None = None,
    severity: str = "info",
) -> AuditLog:
    entry = AuditLog(
        user_id=user.id if user else None,
        user_email=user.email if user else "anonymous",
        event_type=event_type,
        description=description,
        ip_address=ip_address,
        severity=severity,
        created_at=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
