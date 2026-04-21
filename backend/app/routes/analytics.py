"""Analytics / dashboard summary."""
from fastapi import APIRouter, Depends

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.schemas.analytics import AnalyticsSummary

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
async def summary(_: dict = Depends(get_current_user)):
    db = get_db()
    total_tasks = await db.tasks.count_documents({})
    completed = await db.tasks.count_documents({"status": "completed"})
    pending = await db.tasks.count_documents({"status": "pending"})
    active = await db.tasks.count_documents({"status": "active"})
    in_progress = await db.tasks.count_documents({"status": "in_progress"})

    total_users = await db.users.count_documents({})
    distribution: dict[str, int] = {}
    pipeline = [{"$group": {"_id": "$role", "count": {"$sum": 1}}}]
    async for row in db.users.aggregate(pipeline):
        distribution[row["_id"] or "unknown"] = row["count"]

    total_issues = await db.issues.count_documents({})
    open_issues = await db.issues.count_documents({"status": "open"})

    return AnalyticsSummary(
        total_tasks=total_tasks,
        completed_tasks=completed,
        pending_tasks=pending,
        active_tasks=active,
        in_progress_tasks=in_progress,
        total_users=total_users,
        user_distribution=distribution,
        total_issues=total_issues,
        open_issues=open_issues,
    )
