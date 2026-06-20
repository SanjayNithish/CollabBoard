from sanic import Blueprint, json
from app.models import Comment, Task
from app.auth import protected

comments_bp = Blueprint("comments", url_prefix="/api/comments")

@comments_bp.get("")
@protected()
async def list_comments(request):
    task_id = request.args.get("task_id")
    if not task_id:
        return json({"error": "Bad Request", "message": "task_id is required"}, status=400)

    comments = await Comment.filter(task_id=task_id).order_by("created_at")
    data = []
    for c in comments:
        data.append(await c.to_dict())
    return json(data)

@comments_bp.post("")
@protected()
async def create_comment(request):
    data = request.json or {}
    task_id = data.get("task_id")
    content = data.get("content")

    if not task_id or not content:
        return json({"error": "Bad Request", "message": "task_id and content are required"}, status=400)

    task = await Task.get_or_none(id=task_id)
    if not task:
        return json({"error": "Not Found", "message": "Task not found"}, status=404)

    try:
        comment = await Comment.create(
            task=task,
            author=request.ctx.user,
            content=content
        )
        return json(await comment.to_dict(), status=201)
    except Exception as e:
        return json({"error": "Internal Server Error", "message": str(e)}, status=500)
