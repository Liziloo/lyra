from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import chat, session, model

app = FastAPI(title="Lyra API", version="2.0.0")

# CORS configuration for Vite (usually port 5173 or 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local dev, restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(session.router, prefix="/session", tags=["Session"])
app.include_router(model.router, prefix="/model", tags=["Model"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)