# backend/routes/project.py
from fastapi import APIRouter, HTTPException
from pathlib import Path
import os

router = APIRouter()

# Default to a 'projects' folder in the user's home dir
PROJECTS_ROOT = Path.home() / ".lyra_app" / "projects"
PROJECTS_ROOT.mkdir(parents=True, exist_ok=True)

@router.get("/{project_name}")
async def list_project_files(project_name: str):
    path = PROJECTS_ROOT / project_name
    # Search for files recursively or in a 'code' subfolder
    if not path.exists():
        return []
    
    files = []
    for root, dirs, filenames in os.walk(path):
        for f in filenames:
            # Get relative path for the UI
            rel_path = os.path.relpath(os.path.join(root, f), path)
            files.append(rel_path)
    return files