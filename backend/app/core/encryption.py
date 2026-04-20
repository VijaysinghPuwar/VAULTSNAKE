"""
Fernet symmetric encryption for vault content.

The encryption key is loaded from the VAULT_ENCRYPTION_KEY environment
variable and never stored in the database or source code.

This pattern is carried forward from the original VAULTSNAKE desktop app
and upgraded to operate as a service rather than a file-based key.
"""

from cryptography.fernet import Fernet, InvalidToken
from fastapi import HTTPException, status
from app.config import get_settings

_fernet: Fernet | None = None


def _get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        key = get_settings().vault_encryption_key
        if not key:
            raise RuntimeError("VAULT_ENCRYPTION_KEY is not set. Run: python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\"")
        _fernet = Fernet(key.encode())
    return _fernet


def encrypt_content(plaintext: str) -> str:
    """Encrypt plaintext string, return base64-encoded ciphertext."""
    return _get_fernet().encrypt(plaintext.encode()).decode()


def decrypt_content(ciphertext: str) -> str:
    """Decrypt ciphertext string, return plaintext."""
    try:
        return _get_fernet().decrypt(ciphertext.encode()).decode()
    except InvalidToken:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Vault decryption failed — content may be corrupted",
        )
