from sanic import Blueprint, json
from app.models import Task, Project, User, Activity, Subtask
from app.auth import protected
from datetime import date

tasks_bp = Blueprint("tasks", url_prefix="/api/tasks")

ALLOWED_STATUSES = [
    "todo", "in_progress", "blocked", "dev_done", "code_review",
    "ready_for_qa", "in_qa", "ready_for_release", "done"
]

@tasks_bp.get("")
@protected()
async def list_tasks(request):
    project_id = request.args.get("project_id")
    if not project_id:
        return json({"error": "Bad Request", "message": "project_id is required"}, status=400)

    query = Task.filter(project_id=project_id)

    # Filtering
    search = request.args.get("search")
    if search:
        query = query.filter(title__icontains=search)
    
    assignee_id = request.args.get("assignee_id")
    if assignee_id:
        if assignee_id == "unassigned":
            query = query.filter(assignee_id__isnull=True)
        else:
            query = query.filter(assignee_id=assignee_id)

    priority = request.args.get("priority")
    if priority:
        query = query.filter(priority=priority)

    tasks = await query.order_by("created_at")
    data = []
    for t in tasks:
        task_dict = await t.to_dict()
        # Fetch subtasks count
        subtasks = await Subtask.filter(task=t)
        task_dict["subtasks"] = [st.to_dict() for st in subtasks]
        data.append(task_dict)
    return json(data)

@tasks_bp.post("")
@protected()
async def create_task(request):
    data = request.json or {}
    project_id = data.get("project_id")
    title = data.get("title")
    description = data.get("description")
    status = data.get("status", "todo")
    priority = data.get("priority", "medium")
    assignee_id = data.get("assignee_id")
    due_date_str = data.get("due_date")
    labels = data.get("labels", [])

    if not project_id or not title:
        return json({"error": "Bad Request", "message": "project_id and title are required"}, status=400)

    if status not in ALLOWED_STATUSES:
        return json({"error": "Bad Request", "message": "Invalid status value"}, status=400)

    project = await Project.get_or_none(id=project_id)
    if not project:
        return json({"error": "Not Found", "message": "Project not found"}, status=404)

    assignee = None
    if assignee_id:
        assignee = await User.get_or_none(id=assignee_id)

    due_date = None
    if due_date_str:
        try:
            due_date = date.fromisoformat(due_date_str)
        except ValueError:
            return json({"error": "Bad Request", "message": "Invalid due_date format"}, status=400)

    last_tasks = await Task.filter(project=project).order_by("-id").limit(1)
    next_num = 1
    if last_tasks:
        try:
            next_num = int(last_tasks[0].key.split("-")[-1]) + 1
        except:
            pass
    key = f"{project.key}-{next_num}"

    try:
        task = await Task.create(
            key=key,
            title=title,
            description=description,
            status=status,
            priority=priority,
            project=project,
            assignee=assignee,
            due_date=due_date,
            labels=labels,
            reporter=request.ctx.user
        )
        await Activity.create(task=task, user=request.ctx.user, action="created task")
        return json(await task.to_dict(), status=201)
    except Exception as e:
        return json({"error": "Internal Server Error", "message": str(e)}, status=500)

@tasks_bp.get("/<task_id:int>")
@protected()
async def get_task(request, task_id):
    task = await Task.get_or_none(id=task_id)
    if not task:
        return json({"error": "Not Found", "message": "Task not found"}, status=404)
    task_dict = await task.to_dict()
    subtasks = await Subtask.filter(task=task).order_by("created_at")
    task_dict["subtasks"] = [st.to_dict() for st in subtasks]
    return json(task_dict)

@tasks_bp.put("/<task_id:int>")
@protected()
async def update_task(request, task_id):
    task = await Task.get_or_none(id=task_id)
    if not task:
        return json({"error": "Not Found", "message": "Task not found"}, status=404)

    data = request.json or {}
    
    # Track changes for Activity
    changes = []

    if "title" in data and data["title"] != task.title:
        changes.append(("changed title", task.title, data["title"]))
        task.title = data["title"]

    if "description" in data and data["description"] != task.description:
        changes.append(("updated description", None, None))
        task.description = data["description"]

    if "status" in data and data["status"] != task.status:
        if data["status"] not in ALLOWED_STATUSES:
            return json({"error": "Bad Request", "message": "Invalid status value"}, status=400)
        changes.append(("changed status", task.status, data["status"]))
        task.status = data["status"]

    if "priority" in data and data["priority"] != task.priority:
        if data["priority"] not in ["low", "medium", "high"]:
            return json({"error": "Bad Request", "message": "Invalid priority value"}, status=400)
        changes.append(("changed priority", task.priority, data["priority"]))
        task.priority = data["priority"]
        
    if "assignee_id" in data:
        assignee_id = data["assignee_id"]
        old_assignee = await task.assignee
        if assignee_id == "" or assignee_id is None:
            if old_assignee:
                changes.append(("unassigned task", old_assignee.username, "Unassigned"))
            task.assignee = None
        else:
            if not old_assignee or str(old_assignee.id) != str(assignee_id):
                new_assignee = await User.get_or_none(id=assignee_id)
                if new_assignee:
                    changes.append(("assigned to", old_assignee.username if old_assignee else "Unassigned", new_assignee.username))
                    task.assignee = new_assignee

    if "due_date" in data:
        due_date_str = data["due_date"]
        if due_date_str == "" or due_date_str is None:
            if task.due_date:
                changes.append(("removed due date", str(task.due_date), None))
            task.due_date = None
        else:
            try:
                new_date = date.fromisoformat(due_date_str)
                if task.due_date != new_date:
                    changes.append(("changed due date", str(task.due_date) if task.due_date else None, str(new_date)))
                    task.due_date = new_date
            except ValueError:
                return json({"error": "Bad Request", "message": "Invalid due_date format"}, status=400)

    if "labels" in data:
        # We don't track detailed label diffs for simplicity, just record it changed
        if data["labels"] != task.labels:
            changes.append(("updated labels", None, None))
            task.labels = data["labels"]

    try:
        await task.save()
        for action, old_v, new_v in changes:
            await Activity.create(task=task, user=request.ctx.user, action=action, old_value=old_v, new_value=new_v)
        
        task_dict = await task.to_dict()
        subtasks = await Subtask.filter(task=task).order_by("created_at")
        task_dict["subtasks"] = [st.to_dict() for st in subtasks]
        return json(task_dict)
    except Exception as e:
        return json({"error": "Internal Server Error", "message": str(e)}, status=500)

@tasks_bp.patch("/<task_id:int>/status")
@protected()
async def update_task_status(request, task_id):
    task = await Task.get_or_none(id=task_id)
    if not task:
        return json({"error": "Not Found", "message": "Task not found"}, status=404)

    data = request.json or {}
    status = data.get("status")
    assignee_id = data.get("assignee_id")

    changes = []

    if status and status != task.status:
        if status not in ALLOWED_STATUSES:
            return json({"error": "Bad Request", "message": "Invalid status value"}, status=400)
        changes.append(("changed status", task.status, status))
        task.status = status

    if assignee_id is not None:
        old_assignee = await task.assignee
        if assignee_id == "" or assignee_id == "unassigned":
            if old_assignee:
                changes.append(("unassigned task", old_assignee.username, "Unassigned"))
            task.assignee = None
        else:
            if not old_assignee or str(old_assignee.id) != str(assignee_id):
                new_assignee = await User.get_or_none(id=assignee_id)
                if new_assignee:
                    changes.append(("assigned to", old_assignee.username if old_assignee else "Unassigned", new_assignee.username))
                    task.assignee = new_assignee

    try:
        if changes:
            await task.save()
            for action, old_v, new_v in changes:
                await Activity.create(task=task, user=request.ctx.user, action=action, old_value=old_v, new_value=new_v)
        return json(await task.to_dict())
    except Exception as e:
        return json({"error": "Internal Server Error", "message": str(e)}, status=500)

@tasks_bp.delete("/<task_id:int>")
@protected()
async def delete_task(request, task_id):
    task = await Task.get_or_none(id=task_id)
    if not task:
        return json({"error": "Not Found", "message": "Task not found"}, status=404)
    try:
        await task.delete()
        return json({"message": "Task deleted successfully"})
    except Exception as e:
        return json({"error": "Internal Server Error", "message": str(e)}, status=500)

# ----------------------------------------------------
# Subtask Routes
# ----------------------------------------------------
@tasks_bp.post("/<task_id:int>/subtasks")
@protected()
async def create_subtask(request, task_id):
    task = await Task.get_or_none(id=task_id)
    if not task:
        return json({"error": "Not Found", "message": "Task not found"}, status=404)
    
    data = request.json or {}
    title = data.get("title")
    if not title:
        return json({"error": "Bad Request", "message": "title is required"}, status=400)

    subtask = await Subtask.create(task=task, title=title)
    await Activity.create(task=task, user=request.ctx.user, action="added subtask", new_value=title)
    return json(subtask.to_dict(), status=201)

@tasks_bp.patch("/subtasks/<subtask_id:int>")
@protected()
async def update_subtask(request, subtask_id):
    subtask = await Subtask.get_or_none(id=subtask_id).prefetch_related("task")
    if not subtask:
        return json({"error": "Not Found", "message": "Subtask not found"}, status=404)
    
    data = request.json or {}
    if "is_completed" in data:
        old_val = subtask.is_completed
        subtask.is_completed = data["is_completed"]
        await subtask.save()
        if old_val != subtask.is_completed:
            status_text = "completed" if subtask.is_completed else "uncompleted"
            await Activity.create(task=subtask.task, user=request.ctx.user, action=f"{status_text} subtask", new_value=subtask.title)
            
    if "title" in data and data["title"] != subtask.title:
        subtask.title = data["title"]
        await subtask.save()

    return json(subtask.to_dict())

@tasks_bp.delete("/subtasks/<subtask_id:int>")
@protected()
async def delete_subtask(request, subtask_id):
    subtask = await Subtask.get_or_none(id=subtask_id).prefetch_related("task")
    if not subtask:
        return json({"error": "Not Found", "message": "Subtask not found"}, status=404)
    
    task = subtask.task
    title = subtask.title
    await subtask.delete()
    await Activity.create(task=task, user=request.ctx.user, action="deleted subtask", old_value=title)
    return json({"message": "Subtask deleted successfully"})
