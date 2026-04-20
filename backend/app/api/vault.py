from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.vault import VaultItem
from app.schemas.vault import VaultItemCreate, VaultItemUpdate, VaultItemOut, VaultItemDetail
from app.core.security import get_current_user
from app.core.encryption import encrypt_content, decrypt_content
from app.core.audit import log_event
from app.core.threat import check_after_event

router = APIRouter(tags=["vault"])


@router.get("/", response_model=list[VaultItemOut])
def list_vault_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(VaultItem).filter(VaultItem.user_id == current_user.id).all()


@router.post("/", response_model=VaultItemOut, status_code=status.HTTP_201_CREATED)
def create_vault_item(
    payload: VaultItemCreate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = VaultItem(
        user_id=current_user.id,
        title=payload.title,
        encrypted_content=encrypt_content(payload.content),
        item_type=payload.item_type,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    ip = request.client.host if request.client else None
    log_event(db, "vault_create", f"Created vault item: {item.title}", user=current_user, ip_address=ip)
    check_after_event(db, current_user, "vault_create")

    return item


@router.get("/{item_id}", response_model=VaultItemDetail)
def get_vault_item(
    item_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(VaultItem).filter(VaultItem.id == item_id, VaultItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault item not found")

    ip = request.client.host if request.client else None
    log_event(db, "vault_read", f"Accessed vault item: {item.title}", user=current_user, ip_address=ip)
    check_after_event(db, current_user, "vault_read")

    return VaultItemDetail(
        id=item.id,
        title=item.title,
        item_type=item.item_type,
        created_at=item.created_at,
        updated_at=item.updated_at,
        content=decrypt_content(item.encrypted_content),
    )


@router.put("/{item_id}", response_model=VaultItemOut)
def update_vault_item(
    item_id: str,
    payload: VaultItemUpdate,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(VaultItem).filter(VaultItem.id == item_id, VaultItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault item not found")

    if payload.title is not None:
        item.title = payload.title.strip()
    if payload.content is not None:
        item.encrypted_content = encrypt_content(payload.content)
    if payload.item_type is not None:
        item.item_type = payload.item_type

    db.commit()
    db.refresh(item)

    ip = request.client.host if request.client else None
    log_event(db, "vault_update", f"Updated vault item: {item.title}", user=current_user, ip_address=ip)
    check_after_event(db, current_user, "vault_update")

    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vault_item(
    item_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.query(VaultItem).filter(VaultItem.id == item_id, VaultItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault item not found")

    title = item.title
    db.delete(item)
    db.commit()

    ip = request.client.host if request.client else None
    log_event(db, "vault_delete", f"Deleted vault item: {title}", user=current_user, ip_address=ip, severity="warning")
    check_after_event(db, current_user, "vault_delete")
