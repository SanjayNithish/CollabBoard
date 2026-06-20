from sanic import Blueprint, json
from app.models import User
from app.auth import hash_password, verify_password, generate_token, protected

auth_bp = Blueprint("auth", url_prefix="/api/auth")

@auth_bp.post("/signup")
async def signup(request):
    data = request.json or {}
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return json({"error": "Bad Request", "message": "All fields (username, email, password) are required"}, status=400)

    # Check if username or email already exists
    if await User.filter(username=username).exists():
        return json({"error": "Conflict", "message": "Username is already taken"}, status=409)

    if await User.filter(email=email).exists():
        return json({"error": "Conflict", "message": "Email is already registered"}, status=409)

    # Hash password and create user
    hashed = hash_password(password)
    try:
        user = await User.create(
            username=username,
            email=email,
            password_hash=hashed
        )
        token = generate_token(user.id)
        return json({
            "token": token,
            "user": user.to_dict()
        }, status=201)
    except Exception as e:
        return json({"error": "Internal Server Error", "message": str(e)}, status=500)

@auth_bp.post("/login")
async def login(request):
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return json({"error": "Bad Request", "message": "Email and password are required"}, status=400)

    user = await User.get_or_none(email=email)
    if not user or not verify_password(password, user.password_hash):
        return json({"error": "Unauthorized", "message": "Invalid email or password"}, status=401)

    token = generate_token(user.id)
    return json({
        "token": token,
        "user": user.to_dict()
    })

@auth_bp.get("/me")
@protected()
async def get_me(request):
    return json(request.ctx.user.to_dict())

@auth_bp.get("/users")
@protected()
async def list_users(request):
    users = await User.all()
    return json([u.to_dict() for u in users])
