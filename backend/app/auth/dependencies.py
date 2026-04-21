"""FastAPI auth dependencies and role-based access control."""
from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.auth.utils import decode_token
from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=True)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = decode_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    db = get_db()
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid user id in token")

    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user["_id"] = str(user["_id"])
    return user


def require_roles(*roles: str):
    async def _check(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {', '.join(roles)}",
            )
        return user

    return _check
