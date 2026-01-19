# backend/routes/chat.py
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from provider_client import ProviderClient
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    input: str
    model: str
    projectName: str | None = None
    fileContext: str | None = None  # Add this field
    provider: str = "ollama"

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    # Combine the file content with the user's question
    full_prompt = request.input
    if request.fileContext:
        full_prompt = f"Context from file:\n{request.fileContext}\n\nUser Question: {request.input}"

    return StreamingResponse(
        ProviderClient.get_response_stream(
            request.model, 
            full_prompt,  # Pass the combined prompt
            provider=request.provider
        ),
        media_type="text/event-stream"
    )