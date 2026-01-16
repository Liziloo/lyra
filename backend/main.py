# backend/main.py
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, session, model, project # New project route
from provider_client import ProviderClient

app = FastAPI(title="Lyra API v2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/chat")
app.include_router(session.router, prefix="/session")
app.include_router(model.router, prefix="/model")
app.include_router(project.router, prefix="/project")

# SPEC SECTION 3: VS Code Compatibility (OpenAI Format)
@app.post("/v1/chat/completions")
async def vscode_compatibility(request: Request):
    body = await request.json()
    model_name = body.get("model", "codestral")
    # Extract last message
    prompt = body.get("messages", [])[-1].get("content", "")
    return StreamingResponse(
        ProviderClient.get_response_stream(model_name, prompt),
        media_type="text/event-stream"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)