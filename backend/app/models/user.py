"""User document shape (MongoDB).

Roles: ngo, volunteer, reporter, admin, donor
"""
from datetime import datetime, timezone


def new_user_doc(
    *,
    name: str,
    email: str,
    phone: str | None,
    role: str,
    location: str | None,
    password_hash: str,
    skills: list[str] | None = None,
    available: bool = True,
) -> dict:
    return {
        "name": name,
        "email": email.lower(),
        "phone": phone,
        "role": role,
        "location": location,
        "password_hash": password_hash,
        "skills": skills or [],
        "available": available,
        "flagged": False,
        "created_at": datetime.now(timezone.utc),
    }
