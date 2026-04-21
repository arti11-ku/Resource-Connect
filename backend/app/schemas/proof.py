"""Proof schemas."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class ProofOut(BaseModel):
    id: str
    task_id: str
    volunteer_id: str
    file_url: str
    note: str | None = None
    status: Literal["pending", "approved", "rejected"]
    created_at: datetime | None = None


class ProofVerifyIn(BaseModel):
    status: Literal["approved", "rejected"]


def serialize_proof(doc: dict) -> ProofOut:
    return ProofOut(
        id=str(doc["_id"]),
        task_id=str(doc.get("task_id", "")),
        volunteer_id=str(doc.get("volunteer_id", "")),
        file_url=doc.get("file_url", ""),
        note=doc.get("note"),
        status=doc.get("status", "pending"),
        created_at=doc.get("created_at"),
    )
