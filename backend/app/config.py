import os
from dotenv import load_dotenv

# Load env variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/jira_clone")
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# Tortoise ORM Configuration
TORTOISE_ORM = {
    "connections": {
        "default": DATABASE_URL,
    },
    "apps": {
        "models": {
            "models": ["app.models"],
            "default_connection": "default",
        }
    },
    "use_tz": False,
    "timezone": "UTC"
}
