"""Task routes for NGO and Volunteer."""
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException

from app.auth.dependencies import get_current_user, require_roles
from app.database import get_db
from app.models.task import new_task_doc
from app.schemas.task import (
    TaskCreate,
    TaskOut,
    TaskStatusUpdate,
    TaskUpdate,
    serialize_task,
)

router = APIRouter()


def _oid(id_: str) -> ObjectId:
    try:
        return ObjectId(id_)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid id")


@router.post("/create", response_model=TaskOut)
async def create_task(payload: TaskCreate, user: dict = Depends(require_roles("ngo"))):
    db = get_db()
    doc = new_task_doc(
        title=payload.title,
        description=payload.description,
        location=payload.location,
        required_skills=payload.required_skills,
        deadline=payload.deadline,
        priority=payload.priority,
        ngo_id=user["_id"],
    )
    res = await db.tasks.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_task(doc)


@router.get("/ngo", response_model=list[TaskOut])
async def list_ngo_tasks(user: dict = Depends(require_roles("ngo"))):
    db = get_db()
    cursor = db.tasks.find({"ngo_id": user["_id"]}).sort("created_at", -1)
    return [serialize_task(d) async for d in cursor]


@router.put("/update/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    user: dict = Depends(require_roles("ngo")),
):
    db = get_db()
    task = await db.tasks.find_one({"_id": _oid(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.get("ngo_id") != user["_id"]:
        raise HTTPException(status_code=403, detail="Not your task")

    update = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if update:
        from datetime import datetime, timezone

        update["updated_at"] = datetime.now(timezone.utc)
        await db.tasks.update_one({"_id": _oid(task_id)}, {"$set": update})
    task = await db.tasks.find_one({"_id": _oid(task_id)})
    return serialize_task(task)


@router.get("/mine", response_model=list[TaskOut])
async def list_my_tasks(user: dict = Depends(require_roles("volunteer"))):
    db = get_db()
    cursor = db.tasks.find({"assigned_to": user["_id"]}).sort("created_at", -1)
    return [serialize_task(d) async for d in cursor]


@router.get("/available", response_model=list[TaskOut])
async def list_available(user: dict = Depends(require_roles("volunteer"))):
    db = get_db()
    cursor = db.tasks.find(
        {"status": {"$in": ["pending", "active"]}, "assigned_to": None}
    ).sort("created_at", -1)
    return [serialize_task(d) async for d in cursor]


@router.post("/accept/{task_id}", response_model=TaskOut)
async def accept_task(task_id: str, user: dict = Depends(require_roles("volunteer"))):
    db = get_db()
    task = await db.tasks.find_one({"_id": _oid(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.get("assigned_to"):
        raise HTTPException(status_code=400, detail="Task already assigned")
    await db.tasks.update_one(
        {"_id": _oid(task_id)},
        {"$set": {"assigned_to": user["_id"], "status": "active"}},
    )
    task = await db.tasks.find_one({"_id": _oid(task_id)})
    return serialize_task(task)


@router.put("/status/{task_id}", response_model=TaskOut)
async def update_status(
    task_id: str,
    payload: TaskStatusUpdate,
    user: dict = Depends(require_roles("volunteer")),
):
    db = get_db()
    task = await db.tasks.find_one({"_id": _oid(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.get("assigned_to") != user["_id"]:
        raise HTTPException(status_code=403, detail="Not assigned to you")
    from datetime import datetime, timezone

    await db.tasks.update_one(
        {"_id": _oid(task_id)},
        {"$set": {"status": payload.status, "updated_at": datetime.now(timezone.utc)}},
    )
    task = await db.tasks.find_one({"_id": _oid(task_id)})
    return serialize_task(task)


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(task_id: str, _: dict = Depends(get_current_user)):
    db = get_db()
    task = await db.tasks.find_one({"_id": _oid(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return serialize_task(task)
