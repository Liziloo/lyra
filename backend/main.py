# backend/main.py
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from dotenv import load_dotenv

from routes import chat, session, model, project 

load_dotenv()

app = FastAPI(title="Lyra AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(chat.router, prefix="/chat")
app.include_router(session.router, prefix="/session")
app.include_router(model.router, prefix="/model")
app.include_router(project.router, prefix="/project")

# --- FRONTEND SERVING ---
# Get the absolute path to the 'frontend/dist' folder
current_dir = Path(__file__).parent
frontend_dist = current_dir.parent / "frontend" / "dist"

if frontend_dist.exists():
    # Serve static files (CSS, JS, Images)
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")

    # Catch-all route to serve index.html for the React SPA
    @app.get("/{rest_of_path:path}")
    async def serve_frontend(rest_of_path: str):
        # If the request is for an API route that doesn't exist, this might catch it,
        # but because routers are included above, they take priority.
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    async def root():
        return {"message": "Frontend not built. Run 'npm run build' in the frontend folder."}