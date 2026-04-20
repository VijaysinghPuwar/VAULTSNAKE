from datetime import datetime
from pydantic import BaseModel, field_validator
from typing import Literal


ITEM_TYPES = Literal["note", "credential", "api_key", "other"]


class VaultItemCreate(BaseModel):
    title: str
    content: str
    item_type: ITEM_TYPES = "note"

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title cannot be empty")
        if len(v) > 255:
            raise ValueError("Title must be 255 characters or fewer")
        return v

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Content cannot be empty")
        if len(v) > 10_000:
            raise ValueError("Content must be 10,000 characters or fewer")
        return v


class VaultItemUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    item_type: ITEM_TYPES | None = None


class VaultItemOut(BaseModel):
    id: str
    title: str
    item_type: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VaultItemDetail(VaultItemOut):
    content: str  # Decrypted content, only returned on explicit GET /{id}
