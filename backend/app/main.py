from sanic import Sanic, json
from sanic_cors import CORS
from tortoise import Tortoise
from app.config import TORTOISE_ORM
from app.routes import api_bp
from app.auth import auth_middleware

def create_app() -> Sanic:
    app = Sanic("JiraCloneBackend")
    
    import os
    frontend_url = os.environ.get("FRONTEND_URL", "*")
    
    # Enable CORS. In production, set FRONTEND_URL to your Vercel domain.
    CORS(app, resources={r"/api/*": {"origins": frontend_url}}, supports_credentials=True)
    
    # Register blueprints
    app.blueprint(api_bp)
    
    # Register authentication middleware
    app.register_middleware(auth_middleware, "request")
    
    # Database hooks
    @app.before_server_start
    async def init_db(app, loop):
        await Tortoise.init(config=TORTOISE_ORM, _enable_global_fallback=True)
        # Automatically generate schemas
        await Tortoise.generate_schemas()
        print("Database schema generated and connected successfully.")
        
    @app.after_server_stop
    async def close_db(app, loop):
        await Tortoise.close_connections()
        print("Database connections closed.")
        
    # Global exception handler for safety
    @app.exception(Exception)
    async def handle_exception(request, exception):
        # Log the exception (could be printed or logged)
        import traceback
        traceback.print_exc()
        return json({
            "error": "Internal Server Error",
            "message": str(exception)
        }, status=500)
        
    return app
