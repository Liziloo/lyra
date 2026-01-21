# backend/routes/model.py
from fastapi import APIRouter, HTTPException
from provider_client import ProviderClient
from pydantic import BaseModel

router = APIRouter()

class ModelSwitchRequest(BaseModel):
    modelName: str

@router.get("/")
async def list_available_models():
    """Fetches the list of models from the local Ollama server."""
    try:
        models = await ProviderClient.list_models()
        # The frontend expects the key 'ollama_tags'
        return {"success": True, "ollama_tags": models}
    except Exception as e:
        print(f"Error listing models: {e}")
        return {"success": False, "ollama_tags": []}

@router.post("/switch")
async def switch_model(request: ModelSwitchRequest):
    # Check if it's a local model
    all_models = await ProviderClient.list_models()
    model_names = [m.get("name") for m in all_models]
    
    # Check for exact match or 'tagless' match (e.g., 'codestral' vs 'codestral:latest')
    is_local = any(request.modelName in name for name in model_names)

    if is_local:
        # INVOKE: This forces the LAN server to load the model into VRAM now
        success = await ProviderClient.invoke_model(request.modelName)
        if not success:
            raise HTTPException(status_code=503, detail="LAN Ollama server failed to load the model.")
        return {"success": True, "message": f"Model {request.modelName} is warmed up and ready."}
    
    return {"success": True, "message": f"Using cloud model {request.modelName}"}