from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import GoogleSyncRequest, AuthResponse, UserOut
from app.core.security import create_access_token, get_current_user
from app.core.audit import log_event
from app.config import get_settings

router = APIRouter(tags=["auth"])
settings = get_settings()


@router.post("/sync", response_model=AuthResponse)
def sync_google_user(payload: GoogleSyncRequest, request: Request, db: Session = Depends(get_db)):
    """
    Called by the frontend after Google OAuth completes.
    Creates or updates the user record and returns a backend JWT.
    """
    ip = request.client.host if request.client else None

    user = db.query(User).filter(User.google_sub == payload.google_sub).first()

    if not user:
        # Determine role: first user with admin email or first user overall
        is_first_user = db.query(User).count() == 0
        role = "admin" if (is_first_user or payload.email == settings.admin_email) else "user"

        user = User(
            email=payload.email,
            name=payload.name,
            picture=payload.picture,
            google_sub=payload.google_sub,
            role=role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    user.last_login = datetime.utcnow()
    db.commit()

    log_event(db, "login", f"User signed in via Google OAuth", user=user, ip_address=ip)

    token = create_access_token(user.id, user.email, user.role)
    return AuthResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
