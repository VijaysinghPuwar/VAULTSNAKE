from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.schemas.audit_log import AuditLogOut, AuditSummary
from app.core.security import get_current_user

router = APIRouter(tags=["audit"])


@router.get("/", response_model=list[AuditLogOut])
def get_my_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(AuditLog)
        .filter(AuditLog.user_id == current_user.id)
        .order_by(AuditLog.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/summary", response_model=AuditSummary)
def get_audit_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    base = db.query(AuditLog).filter(AuditLog.user_id == current_user.id)

    total = base.count()
    logins = base.filter(AuditLog.event_type == "login").count()
    vault_ops = base.filter(AuditLog.event_type.in_(["vault_create", "vault_read", "vault_update", "vault_delete"])).count()
    warnings = base.filter(AuditLog.severity == "warning").count()
    critical = base.filter(AuditLog.severity == "critical").count()
    last = base.order_by(AuditLog.created_at.desc()).first()

    return AuditSummary(
        total_events=total,
        logins=logins,
        vault_operations=vault_ops,
        warnings=warnings,
        critical_events=critical,
        last_activity=last.created_at if last else None,
    )
