from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Literal


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    picture: str | None
    role: Literal["user", "admin"]
    is_active: bool
    created_at: datetime
    last_login: datetime | None

    model_config = {"from_attributes": True}


class GoogleSyncRequest(BaseModel):
    google_sub: str
    email: str
    name: str
    picture: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RoleUpdateRequest(BaseModel):
    role: Literal["user", "admin"]
