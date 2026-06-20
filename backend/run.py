from app.main import create_app
from app.config import HOST, PORT

app = create_app()

if __name__ == "__main__":
    # Start the Sanic server
    app.run(host=HOST, port=PORT, debug=True, auto_reload=True)
