"""Authentication routes."""
from fastapi import APIRouter, Depends, HTTPException

from app.auth.dependencies import get_current_user
from app.auth.utils import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models.user import new_user_doc
from app.schemas.user import LoginIn, SignupIn, TokenOut, UserOut, serialize_user

router = APIRouter()


@router.post("/signup", response_model=TokenOut)
async def signup(payload: SignupIn):
    db = get_db()
    if await db.users.find_one({"email": payload.email.lower()}):
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = new_user_doc(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        role=payload.role,
        location=payload.location,
        password_hash=hash_password(payload.password),
        skills=payload.skills,
    )
    res = await db.users.insert_one(doc)
    doc["_id"] = res.inserted_id
    user_out = serialize_user(doc)
    token = create_access_token(subject=user_out.id, role=user_out.role)
    return TokenOut(access_token=token, user=user_out)


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn):
    db = get_db()
    user = await db.users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_out = serialize_user(user)
    token = create_access_token(subject=user_out.id, role=user_out.role)
    return TokenOut(access_token=token, user=user_out)


@router.get("/profile", response_model=UserOut)
async def profile(user: dict = Depends(get_current_user)):
    return serialize_user({**user, "_id": user["_id"]})
