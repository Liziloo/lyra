# backend/routes/project.py
from fastapi import APIRouter, HTTPException
from pathlib import Path
import os

router = APIRouter()
PROJECTS_ROOT = Path(__file__).parent.parent.parent / "projects"

@router.get("/{project_name}")
async def list_project_files(project_name: str):
    path = PROJECTS_ROOT / project_name / "code"
    if not path.exists():
        return []
    return [f for f in os.listdir(path) if os.path.isfile(path / f)]

@router.get("/{project_name}/{file_name}")
async def get_file_content(project_name: str, file_name: str):
    path = PROJECTS_ROOT / project_name / "code" / file_name
    if not path.exists():
        raise HTTPException(status_code=404)
    return {"content": path.read_text(), "fileName": file_name}