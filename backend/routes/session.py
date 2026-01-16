from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from session_manager import SessionManager
from typing import Dict, Any

router = APIRouter()

class SessionSaveRequest(BaseModel):
    model_name: str
    session_data: Dict[str, Any]

@router.get("/")
async def get_current_session(model_name: str = Query(..., alias="modelName")):
    """Retrieves the current active session for a specific model."""
    try:
        manager = SessionManager(model_name)
        data = manager.load_session()
        return {"success": True, "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load session: {str(e)}")

@router.post("/save")
async def save_session(request: SessionSaveRequest):
    """Saves the current conversation state."""
    try:
        manager = SessionManager(request.model_name)
        manager.save_session(request.session_data)
        return {"success": True, "message": "Session saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/archive")
async def archive_session(model_name: str = Query(...)):
    """Archives the current session and starts a fresh one."""
    try:
        manager = SessionManager(model_name)
        manager.archive_session()
        return {"success": True, "message": "Session archived and cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))