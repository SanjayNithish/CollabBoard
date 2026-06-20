from sanic import Blueprint, json
from app.models import Activity, Task
from app.auth import protected

activity_bp = Blueprint("activity", url_prefix="/api/tasks")

@activity_bp.get("/<task_id:int>/activity")
@protected()
async def get_task_activity(request, task_id):
    task = await Task.get_or_none(id=task_id)
    if not task:
        return json({"error": "Not Found", "message": "Task not found"}, status=404)

    activities = await Activity.filter(task=task).order_by("-created_at")
    data = [await a.to_dict() for a in activities]
    return json(data)
