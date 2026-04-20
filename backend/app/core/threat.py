"""
Threat detection and risk scoring module.

Analyzes recent audit log entries to detect suspicious patterns
and auto-generate security alerts.
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.audit_log import AuditLog
from app.models.alert import Alert
from app.models.user import User


# ── Thresholds ────────────────────────────────────────────────────────────────
UNAUTHORIZED_ACCESS_THRESHOLD = 3      # hits within window
RAPID_VAULT_OPS_THRESHOLD = 10         # operations within window
WINDOW_MINUTES = 5


def _recent_count(db: Session, user_id: str, event_type: str, minutes: int) -> int:
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    return (
        db.query(func.count(AuditLog.id))
        .filter(
            AuditLog.user_id == user_id,
            AuditLog.event_type == event_type,
            AuditLog.created_at >= cutoff,
        )
        .scalar()
        or 0
    )


def _alert_exists(db: Session, user_id: str, alert_type: str, minutes: int) -> bool:
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    return (
        db.query(Alert)
        .filter(
            Alert.user_id == user_id,
            Alert.alert_type == alert_type,
            Alert.created_at >= cutoff,
            Alert.is_resolved == False,  # noqa: E712
        )
        .first()
    ) is not None


def _create_alert(db: Session, user_id: str, alert_type: str, description: str, severity: str) -> Alert:
    alert = Alert(
        user_id=user_id,
        alert_type=alert_type,
        description=description,
        severity=severity,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def check_after_event(db: Session, user: User, event_type: str) -> Alert | None:
    """
    Called after each auditable event. Checks if the new event
    triggers any threat detection rules. Returns an Alert if one
    was generated, otherwise None.
    """
    # Rule 1: Repeated unauthorized access attempts
    if event_type == "unauthorized_access":
        count = _recent_count(db, user.id, "unauthorized_access", WINDOW_MINUTES)
        if count >= UNAUTHORIZED_ACCESS_THRESHOLD and not _alert_exists(
            db, user.id, "repeated_unauthorized_access", WINDOW_MINUTES
        ):
            return _create_alert(
                db,
                user.id,
                "repeated_unauthorized_access",
                f"{count} unauthorized access attempts in the last {WINDOW_MINUTES} minutes.",
                "high",
            )

    # Rule 2: Rapid vault operations
    if event_type in ("vault_create", "vault_update", "vault_delete", "vault_read"):
        vault_ops = (
            db.query(func.count(AuditLog.id))
            .filter(
                AuditLog.user_id == user.id,
                AuditLog.event_type.in_(["vault_create", "vault_update", "vault_delete", "vault_read"]),
                AuditLog.created_at >= datetime.utcnow() - timedelta(minutes=WINDOW_MINUTES),
            )
            .scalar()
            or 0
        )
        if vault_ops >= RAPID_VAULT_OPS_THRESHOLD and not _alert_exists(
            db, user.id, "rapid_vault_operations", WINDOW_MINUTES
        ):
            return _create_alert(
                db,
                user.id,
                "rapid_vault_operations",
                f"{vault_ops} vault operations detected in {WINDOW_MINUTES} minutes — possible bulk data exfiltration.",
                "medium",
            )

    # Rule 3: Admin escalation attempt (non-admin hitting admin endpoints repeatedly)
    if event_type == "unauthorized_access" and user.role == "user":
        admin_hits = (
            db.query(func.count(AuditLog.id))
            .filter(
                AuditLog.user_id == user.id,
                AuditLog.event_type == "unauthorized_access",
                AuditLog.description.contains("admin"),
                AuditLog.created_at >= datetime.utcnow() - timedelta(minutes=30),
            )
            .scalar()
            or 0
        )
        if admin_hits >= 5 and not _alert_exists(db, user.id, "admin_escalation_attempt", 30):
            return _create_alert(
                db,
                user.id,
                "admin_escalation_attempt",
                f"User has attempted to access admin resources {admin_hits} times in the last 30 minutes.",
                "critical",
            )

    return None


def calculate_risk_score(user_id: str, db: Session) -> dict:
    """
    Returns a risk score and label for a user based on audit events
    in the last 24 hours.

    Scoring:
      info events     = 0 pts
      warning events  = 2 pts
      critical events = 5 pts

    Risk levels:
      0–10:   Low
      11–25:  Medium
      26–50:  High
      50+:    Critical
    """
    cutoff = datetime.utcnow() - timedelta(hours=24)
    rows = (
        db.query(AuditLog.severity, func.count(AuditLog.id).label("cnt"))
        .filter(AuditLog.user_id == user_id, AuditLog.created_at >= cutoff)
        .group_by(AuditLog.severity)
        .all()
    )
    weights = {"info": 0, "warning": 2, "critical": 5}
    score = sum(weights.get(row.severity, 0) * row.cnt for row in rows)

    if score <= 10:
        label = "Low"
    elif score <= 25:
        label = "Medium"
    elif score <= 50:
        label = "High"
    else:
        label = "Critical"

    return {"score": score, "label": label}
