from sanic import Blueprint, json
from app.models import Project
from app.auth import protected

projects_bp = Blueprint("projects", url_prefix="/api/projects")

@projects_bp.get("")
@protected()
async def list_projects(request):
    projects = await Project.all().order_by("-created_at")
    data = []
    for proj in projects:
        data.append(await proj.to_dict(include_owner=True))
    return json(data)

@projects_bp.post("")
@protected()
async def create_project(request):
    data = request.json or {}
    name = data.get("name")
    key = data.get("key")
    description = data.get("description")

    if not name or not key:
        return json({"error": "Bad Request", "message": "Project name and key are required"}, status=400)

    # Sanitize key (uppercase, alphanumeric, no spaces, max 10 chars)
    key = "".join(c for c in key if c.isalnum()).upper()[:10]
    
    if not key:
        return json({"error": "Bad Request", "message": "Invalid key format"}, status=400)

    # Check if key exists
    if await Project.filter(key=key).exists():
        return json({"error": "Conflict", "message": f"Project key '{key}' is already in use"}, status=409)

    try:
        project = await Project.create(
            name=name,
            key=key,
            description=description,
            owner=request.ctx.user
        )
        return json(await project.to_dict(include_owner=True), status=201)
    except Exception as e:
        return json({"error": "Internal Server Error", "message": str(e)}, status=500)

@projects_bp.get("/<project_id:int>")
@protected()
async def get_project(request, project_id):
    project = await Project.get_or_none(id=project_id)
    if not project:
        return json({"error": "Not Found", "message": "Project not found"}, status=404)
    return json(await project.to_dict(include_owner=True))
