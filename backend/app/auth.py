import datetime
from functools import wraps
import jwt
import bcrypt
from sanic import json
from app.config import JWT_SECRET
from app.models import User

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def generate_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7),
        "iat": datetime.datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

async def auth_middleware(request):
    request.ctx.user = None
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload:
            try:
                user = await User.get_or_none(id=payload.get("user_id"))
                if user:
                    request.ctx.user = user
            except Exception:
                pass

def protected():
    def decorator(f):
        @wraps(f)
        async def decorated_function(request, *args, **kwargs):
            if not getattr(request.ctx, "user", None):
                return json({"error": "Unauthorized", "message": "Authentication required"}, status=401)
            return await f(request, *args, **kwargs)
        return decorated_function
    return decorator
