from sanic import Blueprint
from .auth import auth_bp
from .projects import projects_bp
from .tasks import tasks_bp
from .comments import comments_bp
from .activity import activity_bp

api_bp = Blueprint.group(auth_bp, projects_bp, tasks_bp, comments_bp, activity_bp)
