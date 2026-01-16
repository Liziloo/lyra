# backend/routes/model.py
from fastapi import APIRouter, HTTPException
from provider_client import ProviderClient # Changed
from pydantic import BaseModel

router = APIRouter()

class ModelSwitchRequest(BaseModel):
    modelName: str

@router.get("/")
async def list_available_models():
    try:
        # Use the updated client
        ollama_models = await ProviderClient.list_models()
        return {"success": True, "ollama_tags": ollama_models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/switch")
async def switch_model(request: ModelSwitchRequest):
    all_models = await ProviderClient.list_models()
    model_names = [m.get("name") for m in all_models]
    
    if any(request.modelName in name for name in model_names):
        return {"success": True, "message": f"Switched to {request.modelName}"}
    
    # If not in Ollama, we assume it's a cloud model from OpenRouter
    return {"success": True, "message": f"Using cloud model {request.modelName}"}