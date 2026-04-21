"""Smart allocation: match a volunteer to a task by skills, location, availability."""
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase


def _score(volunteer: dict, task: dict) -> float:
    """Compute a simple match score for a volunteer/task pair."""
    score = 0.0

    # Skill overlap (most important)
    v_skills = {s.lower() for s in volunteer.get("skills", [])}
    t_skills = {s.lower() for s in task.get("required_skills", [])}
    if t_skills:
        overlap = len(v_skills & t_skills)
        score += (overlap / len(t_skills)) * 60.0
    else:
        score += 30.0

    # Location match
    v_loc = (volunteer.get("location") or "").strip().lower()
    t_loc = (task.get("location") or "").strip().lower()
    if v_loc and t_loc:
        if v_loc == t_loc:
            score += 30.0
        elif v_loc in t_loc or t_loc in v_loc:
            score += 15.0

    # Availability
    if volunteer.get("available", True):
        score += 10.0

    return score


async def auto_assign(db: AsyncIOMotorDatabase, task_id: str) -> tuple[dict, dict] | None:
    """Find best volunteer for a task and assign. Returns (task, volunteer) or None."""
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        return None

    cursor = db.users.find({"role": "volunteer", "available": True, "flagged": {"$ne": True}})
    best: tuple[float, dict] | None = None
    async for v in cursor:
        s = _score(v, task)
        if best is None or s > best[0]:
            best = (s, v)

    if not best or best[0] <= 0:
        return None

    volunteer = best[1]
    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"assigned_to": str(volunteer["_id"]), "status": "active"}},
    )
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    return task, volunteer
