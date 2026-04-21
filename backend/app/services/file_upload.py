"""Local file upload service."""
import secrets
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.config import settings

ALLOWED_EXT = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".pdf", ".mp4", ".mov"}
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


async def save_upload(file: UploadFile, subdir: str = "") -> str:
    """Save an UploadFile to disk and return the public URL path."""
    ext = Path(file.filename or "").suffix.lower()
    if ext and ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")

    base = Path(settings.UPLOAD_DIR) / subdir
    base.mkdir(parents=True, exist_ok=True)
    name = f"{secrets.token_hex(12)}{ext}"
    target = base / name

    size = 0
    with target.open("wb") as out:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_BYTES:
                out.close()
                target.unlink(missing_ok=True)
                raise HTTPException(status_code=400, detail="File too large (max 10MB)")
            out.write(chunk)

    rel = f"{subdir}/{name}" if subdir else name
    return f"/uploads/{rel}"
