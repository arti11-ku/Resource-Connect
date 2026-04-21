"""Proof document shape (uploaded by Volunteer)."""
from datetime import datetime, timezone


def new_proof_doc(
    *,
    task_id: str,
    volunteer_id: str,
    file_url: str,
    note: str | None = None,
) -> dict:
    return {
        "task_id": task_id,
        "volunteer_id": volunteer_id,
        "file_url": file_url,
        "note": note,
        "status": "pending",  # pending | approved | rejected
        "created_at": datetime.now(timezone.utc),
    }
