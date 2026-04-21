"""Issue (Reporter) routes."""
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.auth.dependencies import get_current_user, require_roles
from app.database import get_db
from app.models.issue import new_issue_doc
from app.models.task import new_task_doc
from app.schemas.issue import IssueConvertIn, IssueOut, serialize_issue
from app.schemas.task import TaskOut, serialize_task
from app.services.file_upload import save_upload

router = APIRouter()


def _oid(id_: str) -> ObjectId:
    try:
        return ObjectId(id_)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid id")


@router.post("/report", response_model=IssueOut)
async def report_issue(
    description: str = Form(...),
    location: str = Form(""),
    image: UploadFile | None = File(None),
    user: dict = Depends(require_roles("reporter")),
):
    db = get_db()
    image_url = None
    if image is not None and image.filename:
        image_url = await save_upload(image, subdir="issues")

    doc = new_issue_doc(
        description=description,
        location=location,
        image_url=image_url,
        reporter_id=user["_id"],
    )
    res = await db.issues.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_issue(doc)


@router.get("", response_model=list[IssueOut])
@router.get("/", response_model=list[IssueOut])
async def list_issues(user: dict = Depends(get_current_user)):
    db = get_db()
    query: dict = {}
    # Reporters see their own; others see all
    if user.get("role") == "reporter":
        query["reporter_id"] = user["_id"]
    cursor = db.issues.find(query).sort("created_at", -1)
    return [serialize_issue(d) async for d in cursor]


@router.post("/convert-to-task/{issue_id}", response_model=TaskOut)
async def convert_to_task(
    issue_id: str,
    payload: IssueConvertIn,
    user: dict = Depends(require_roles("ngo", "admin")),
):
    db = get_db()
    issue = await db.issues.find_one({"_id": _oid(issue_id)})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if issue.get("status") == "converted":
        raise HTTPException(status_code=400, detail="Already converted")

    task_doc = new_task_doc(
        title=payload.title,
        description=issue.get("description", ""),
        location=issue.get("location", ""),
        required_skills=payload.required_skills,
        deadline=payload.deadline,
        priority=payload.priority,
        ngo_id=user["_id"],
        issue_id=str(issue["_id"]),
    )
    res = await db.tasks.insert_one(task_doc)
    task_doc["_id"] = res.inserted_id

    await db.issues.update_one(
        {"_id": _oid(issue_id)},
        {"$set": {"status": "converted", "task_id": str(res.inserted_id)}},
    )
    return serialize_task(task_doc)
