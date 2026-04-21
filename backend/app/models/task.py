"""Task document shape."""
from datetime import datetime, timezone


TASK_STATUSES = ("pending", "active", "in_progress", "completed")


def new_task_doc(
    *,
    title: str,
    description: str,
    location: str,
    required_skills: list[str],
    deadline: datetime | None,
    priority: str,
    ngo_id: str,
    issue_id: str | None = None,
) -> dict:
    return {
        "title": title,
        "description": description,
        "location": location,
        "required_skills": required_skills,
        "deadline": deadline,
        "priority": priority,
        "status": "pending",
        "ngo_id": ngo_id,
        "issue_id": issue_id,
        "assigned_to": None,
        "flagged": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
