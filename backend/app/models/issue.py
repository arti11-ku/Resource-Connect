"""Issue document shape (reported by Reporter)."""
from datetime import datetime, timezone


def new_issue_doc(
    *,
    description: str,
    location: str,
    image_url: str | None,
    reporter_id: str,
) -> dict:
    return {
        "description": description,
        "location": location,
        "image_url": image_url,
        "reporter_id": reporter_id,
        "status": "open",  # open | converted | flagged
        "task_id": None,
        "flagged": False,
        "created_at": datetime.now(timezone.utc),
    }
