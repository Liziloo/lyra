import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ollama_client import OllamaClient

router = APIRouter()

# Path to your models registry
REGISTRY_PATH = Path(__file__).parent.parent.parent / "models" / "registry.json"

class ModelSwitchRequest(BaseModel):
    modelName: str

@router.get("/")
async def list_available_models():
    """Fetches both Ollama's installed models and Lyra's registry."""
    try:
        # Get installed models from local Ollama service
        ollama_models = await OllamaClient.list_models()
        
        # Load local registry if it exists
        registry = {}
        if REGISTRY_PATH.exists():
            registry = json.loads(REGISTRY_PATH.read_text())

        return {
            "success": True, 
            "ollama_tags": ollama_models,
            "registry": registry
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/switch")
async def switch_model(request: ModelSwitchRequest):
    """
    In a more advanced setup, this would trigger model pre-loading
    or session archiving. For now, it validates the request.
    """
    # Logic: Verify model exists in Ollama
    all_models = await OllamaClient.list_models()
    model_names = [m.get("name") for m in all_models]
    
    # Check if the requested model (or its base) is available
    if any(request.modelName in name for name in model_names):
        return {"success": True, "message": f"Switched to {request.modelName}"}
    
    raise HTTPException(status_code=400, detail="Model not found in local Ollama instance")