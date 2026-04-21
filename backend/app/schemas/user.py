"""Pydantic schemas for user/auth."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

Role = Literal["ngo", "volunteer", "reporter", "admin", "donor"]


class SignupIn(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str | None = None
    role: Role
    location: str | None = None
    password: str = Field(..., min_length=6)
    skills: list[str] = []


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str | None = None
    role: Role
    location: str | None = None
    skills: list[str] = []
    available: bool = True
    flagged: bool = False
    created_at: datetime | None = None


TokenOut.model_rebuild()


def serialize_user(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        name=doc.get("name", ""),
        email=doc["email"],
        phone=doc.get("phone"),
        role=doc["role"],
        location=doc.get("location"),
        skills=doc.get("skills", []),
        available=doc.get("available", True),
        flagged=doc.get("flagged", False),
        created_at=doc.get("created_at"),
    )
