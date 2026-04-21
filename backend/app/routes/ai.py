"""AI smart-allocation routes."""
from fastapi import APIRouter, Depends, HTTPException

from app.auth.dependencies import require_roles
from app.database import get_db
from app.schemas.task import TaskOut, serialize_task
from app.schemas.user import UserOut, serialize_user
from app.services.allocation import auto_assign

router = APIRouter()


@router.post("/auto-assign/{task_id}")
async def auto_assign_task(
    task_id: str,
    _: dict = Depends(require_roles("ngo", "admin")),
):
    db = get_db()
    result = await auto_assign(db, task_id)
    if not result:
        raise HTTPException(status_code=404, detail="No suitable volunteer found")
    task, volunteer = result
    return {
        "task": serialize_task(task).model_dump(),
        "assigned_volunteer": serialize_user(volunteer).model_dump(),
    }
