"""Issue schemas."""
from datetime import datetime

from pydantic import BaseModel, Field


class IssueOut(BaseModel):
    id: str
    description: str
    location: str
    image_url: str | None
    reporter_id: str
    status: str
    task_id: str | None = None
    flagged: bool = False
    created_at: datetime | None = None


class IssueConvertIn(BaseModel):
    title: str = Field(..., min_length=1)
    required_skills: list[str] = []
    priority: str = "medium"
    deadline: datetime | None = None


def serialize_issue(doc: dict) -> IssueOut:
    return IssueOut(
        id=str(doc["_id"]),
        description=doc.get("description", ""),
        location=doc.get("location", ""),
        image_url=doc.get("image_url"),
        reporter_id=str(doc.get("reporter_id", "")),
        status=doc.get("status", "open"),
        task_id=str(doc["task_id"]) if doc.get("task_id") else None,
        flagged=doc.get("flagged", False),
        created_at=doc.get("created_at"),
    )
