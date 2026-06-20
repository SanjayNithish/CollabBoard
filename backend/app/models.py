from tortoise import fields
from tortoise.models import Model

class User(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True, index=True)
    email = fields.CharField(max_length=255, unique=True, index=True)
    password_hash = fields.CharField(max_length=255)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "users"

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Project(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=100)
    key = fields.CharField(max_length=10, unique=True, index=True)
    description = fields.TextField(null=True)
    owner = fields.ForeignKeyField("models.User", related_name="owned_projects")
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "projects"

    async def to_dict(self, include_owner=True):
        data = {
            "id": self.id,
            "name": self.name,
            "key": self.key,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "owner_id": self.owner_id
        }
        if include_owner:
            owner = await self.owner
            data["owner"] = owner.to_dict()
        return data

class Task(Model):
    id = fields.IntField(pk=True)
    key = fields.CharField(max_length=20, unique=True, index=True)
    title = fields.CharField(max_length=255)
    description = fields.TextField(null=True)
    status = fields.CharField(max_length=20, default="todo")  # "todo", "in_progress", "done" etc
    priority = fields.CharField(max_length=20, default="medium")  # "low", "medium", "high"
    project = fields.ForeignKeyField("models.Project", related_name="tasks")
    assignee = fields.ForeignKeyField("models.User", related_name="assigned_tasks", null=True)
    reporter = fields.ForeignKeyField("models.User", related_name="reported_tasks")
    due_date = fields.DateField(null=True)
    labels = fields.JSONField(default=list)
    created_at = fields.DatetimeField(auto_now_add=True)
    updated_at = fields.DatetimeField(auto_now=True)

    class Meta:
        table = "tasks"

    async def to_dict(self):
        assignee_val = None
        if self.assignee_id:
            assignee = await self.assignee
            assignee_val = assignee.to_dict()
            
        reporter = await self.reporter
        
        return {
            "id": self.id,
            "key": self.key,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "project_id": self.project_id,
            "assignee": assignee_val,
            "reporter": reporter.to_dict(),
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "labels": self.labels,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Comment(Model):
    id = fields.IntField(pk=True)
    task = fields.ForeignKeyField("models.Task", related_name="comments")
    author = fields.ForeignKeyField("models.User", related_name="comments")
    content = fields.TextField()
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "comments"

    async def to_dict(self):
        author = await self.author
        return {
            "id": self.id,
            "task_id": self.task_id,
            "content": self.content,
            "author": author.to_dict(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Activity(Model):
    id = fields.IntField(pk=True)
    task = fields.ForeignKeyField("models.Task", related_name="activities")
    user = fields.ForeignKeyField("models.User", related_name="activities", null=True)
    action = fields.CharField(max_length=255) # e.g. 'changed status'
    old_value = fields.CharField(max_length=255, null=True)
    new_value = fields.CharField(max_length=255, null=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "activities"

    async def to_dict(self):
        user_val = None
        if self.user_id:
            user = await self.user
            user_val = user.to_dict()
        return {
            "id": self.id,
            "task_id": self.task_id,
            "user": user_val,
            "action": self.action,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Subtask(Model):
    id = fields.IntField(pk=True)
    task = fields.ForeignKeyField("models.Task", related_name="subtasks")
    title = fields.CharField(max_length=255)
    is_completed = fields.BooleanField(default=False)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "subtasks"

    def to_dict(self):
        return {
            "id": self.id,
            "task_id": self.task_id,
            "title": self.title,
            "is_completed": self.is_completed,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
