from fastapi import APIRouter, Body
from fastapi.responses import StreamingResponse
from ollama_client import OllamaClient
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    input: str
    model: str
    projectName: str | None = None

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    # This returns a real-time stream of tokens to the frontend
    return StreamingResponse(
        OllamaClient.get_response_stream(request.model, request.input),
        media_type="text/event-stream"
    )