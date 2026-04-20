from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.audit_log import AuditLog
from app.models.alert import Alert
from app.schemas.user import UserOut, RoleUpdateRequest
from app.schemas.audit_log import AuditLogOut
from app.schemas.alert import AlertWithUser
from app.core.security import require_admin, get_current_user
from app.core.audit import log_event
from app.core.threat import calculate_risk_score

router = APIRouter(tags=["admin"])


@router.get("/users", response_model=list[UserOut])
def list_all_users(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: str,
    payload: RoleUpdateRequest,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if target.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change your own role")

    old_role = target.role
    target.role = payload.role
    db.commit()
    db.refresh(target)

    ip = request.client.host if request.client else None
    log_event(
        db,
        "role_change",
        f"Admin changed role of {target.email} from {old_role} to {payload.role}",
        user=current_user,
        ip_address=ip,
        severity="warning",
    )
    return target


@router.get("/audit", response_model=list[AuditLogOut])
def get_all_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    severity: str | None = Query(None),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(AuditLog).order_by(AuditLog.created_at.desc())
    if severity:
        q = q.filter(AuditLog.severity == severity)
    return q.offset(offset).limit(limit).all()


@router.get("/alerts", response_model=list[AlertWithUser])
def get_all_alerts(
    unresolved_only: bool = Query(False),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(Alert).order_by(Alert.created_at.desc())
    if unresolved_only:
        q = q.filter(Alert.is_resolved == False)  # noqa: E712
    alerts = q.limit(200).all()

    # Enrich with user emails
    result = []
    for a in alerts:
        user = db.query(User).filter(User.id == a.user_id).first()
        result.append(
            AlertWithUser(
                id=a.id,
                user_id=a.user_id,
                alert_type=a.alert_type,
                description=a.description,
                severity=a.severity,
                is_resolved=a.is_resolved,
                created_at=a.created_at,
                resolved_at=a.resolved_at,
                user_email=user.email if user else None,
            )
        )
    return result


@router.get("/stats")
def get_platform_stats(
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from app.models.vault import VaultItem
    return {
        "total_users": db.query(User).count(),
        "active_users": db.query(User).filter(User.is_active == True).count(),  # noqa: E712
        "total_vault_items": db.query(VaultItem).count(),
        "total_audit_events": db.query(AuditLog).count(),
        "open_alerts": db.query(Alert).filter(Alert.is_resolved == False).count(),  # noqa: E712
        "critical_alerts": db.query(Alert).filter(Alert.severity == "critical", Alert.is_resolved == False).count(),  # noqa: E712
    }
