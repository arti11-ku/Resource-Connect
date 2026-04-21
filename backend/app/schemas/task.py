"""Task schemas."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Priority = Literal["low", "medium", "high"]
Status = Literal["pending", "active", "in_progress", "completed"]


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = ""
    location: str = ""
    required_skills: list[str] = []
    deadline: datetime | None = None
    priority: Priority = "medium"


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    location: str | None = None
    required_skills: list[str] | None = None
    deadline: datetime | None = None
    priority: Priority | None = None
    status: Status | None = None


class TaskStatusUpdate(BaseModel):
    status: Status


class TaskOut(BaseModel):
    id: str
    title: str
    description: str
    location: str
    required_skills: list[str]
    deadline: datetime | None
    priority: Priority
    status: Status
    ngo_id: str
    issue_id: str | None = None
    assigned_to: str | None = None
    flagged: bool = False
    created_at: datetime | None = None
    updated_at: datetime | None = None


def serialize_task(doc: dict) -> TaskOut:
    return TaskOut(
        id=str(doc["_id"]),
        title=doc.get("title", ""),
        description=doc.get("description", ""),
        location=doc.get("location", ""),
        required_skills=doc.get("required_skills", []),
        deadline=doc.get("deadline"),
        priority=doc.get("priority", "medium"),
        status=doc.get("status", "pending"),
        ngo_id=str(doc.get("ngo_id", "")),
        issue_id=str(doc["issue_id"]) if doc.get("issue_id") else None,
        assigned_to=str(doc["assigned_to"]) if doc.get("assigned_to") else None,
        flagged=doc.get("flagged", False),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )
