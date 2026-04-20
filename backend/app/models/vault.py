import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class VaultItem(Base):
    __tablename__ = "vault_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    # Content is always stored Fernet-encrypted — never plaintext
    encrypted_content: Mapped[str] = mapped_column(String(4096), nullable=False)
    item_type: Mapped[str] = mapped_column(
        SAEnum("note", "credential", "api_key", "other", name="vault_item_type"),
        nullable=False,
        default="note",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
