from pydantic import BaseModel


class AnalyticsSummary(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    active_tasks: int
    in_progress_tasks: int
    total_users: int
    user_distribution: dict[str, int]
    total_issues: int
    open_issues: int
