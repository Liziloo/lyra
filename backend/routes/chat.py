# backend/routes/chat.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from provider_client import ProviderClient # Changed
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    input: str
    model: str
    projectName: str | None = None
    provider: str = "ollama" # Added support for provider toggle

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        ProviderClient.get_response_stream(
            request.model, 
            request.input, 
            provider=request.provider
        ),
        media_type="text/event-stream"
    )