"""Admin routes."""
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException

from app.auth.dependencies import require_roles
from app.database import get_db
from app.schemas.proof import ProofOut, ProofVerifyIn, serialize_proof
from app.schemas.task import TaskOut, serialize_task
from app.schemas.user import UserOut, serialize_user

router = APIRouter()


def _oid(id_: str) -> ObjectId:
    try:
        return ObjectId(id_)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=400, detail="Invalid id")


@router.get("/users", response_model=list[UserOut])
async def list_users(_: dict = Depends(require_roles("admin"))):
    db = get_db()
    cursor = db.users.find().sort("created_at", -1)
    return [serialize_user(d) async for d in cursor]


@router.get("/tasks", response_model=list[TaskOut])
async def list_all_tasks(_: dict = Depends(require_roles("admin"))):
    db = get_db()
    cursor = db.tasks.find().sort("created_at", -1)
    return [serialize_task(d) async for d in cursor]


@router.get("/proofs", response_model=list[ProofOut])
async def list_proofs(_: dict = Depends(require_roles("admin"))):
    db = get_db()
    cursor = db.proofs.find().sort("created_at", -1)
    return [serialize_proof(d) async for d in cursor]


@router.put("/verify-proof/{proof_id}", response_model=ProofOut)
async def verify_proof(
    proof_id: str,
    payload: ProofVerifyIn,
    _: dict = Depends(require_roles("admin")),
):
    db = get_db()
    proof = await db.proofs.find_one({"_id": _oid(proof_id)})
    if not proof:
        raise HTTPException(status_code=404, detail="Proof not found")

    await db.proofs.update_one(
        {"_id": _oid(proof_id)}, {"$set": {"status": payload.status}}
    )
    # If approved, mark related task completed
    if payload.status == "approved" and proof.get("task_id"):
        try:
            await db.tasks.update_one(
                {"_id": _oid(proof["task_id"])}, {"$set": {"status": "completed"}}
            )
        except HTTPException:
            pass

    proof = await db.proofs.find_one({"_id": _oid(proof_id)})
    return serialize_proof(proof)


@router.put("/flag/{id}")
async def flag_entity(id: str, _: dict = Depends(require_roles("admin"))):
    """Toggle flag on a task, issue, or user (whichever has this id)."""
    db = get_db()
    oid = _oid(id)
    for coll in ("tasks", "issues", "users"):
        doc = await db[coll].find_one({"_id": oid})
        if doc:
            new_val = not doc.get("flagged", False)
            await db[coll].update_one({"_id": oid}, {"$set": {"flagged": new_val}})
            return {"collection": coll, "id": id, "flagged": new_val}
    raise HTTPException(status_code=404, detail="Entity not found")
