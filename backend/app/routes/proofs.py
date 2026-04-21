"""Proof upload routes (Volunteer)."""
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.auth.dependencies import require_roles
from app.database import get_db
from app.models.proof import new_proof_doc
from app.schemas.proof import ProofOut, serialize_proof
from app.services.file_upload import save_upload

router = APIRouter()


def _oid(id_: str) -> ObjectId:
    try:
        return ObjectId(id_)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid id")


@router.post("/upload", response_model=ProofOut)
async def upload_proof(
    task_id: str = Form(...),
    note: str | None = Form(None),
    file: UploadFile = File(...),
    user: dict = Depends(require_roles("volunteer")),
):
    db = get_db()
    task = await db.tasks.find_one({"_id": _oid(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.get("assigned_to") != user["_id"]:
        raise HTTPException(status_code=403, detail="Task not assigned to you")

    file_url = await save_upload(file, subdir="proofs")
    doc = new_proof_doc(
        task_id=task_id,
        volunteer_id=user["_id"],
        file_url=file_url,
        note=note,
    )
    res = await db.proofs.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_proof(doc)
