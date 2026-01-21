# backend/provider_client.py
import httpx
import json
import os

# Use environment variable for LAN support (e.g., http://192.168.1.50:11434)
# .rstrip("/") prevents double slashes in URLs if the env var has a trailing slash
OLLAMA_BASE_URL = os.getenv("OLLAMA_URL", "http://localhost:11434").rstrip("/")
OPENROUTER_URL = "https://openrouter.ai/api/v1"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

class ProviderClient:
    @staticmethod
    async def invoke_model(model: str):
        """
        Explicitly tells the remote Ollama server to load the model into VRAM.
        Sending a request to /api/generate with only the model name triggers this.
        """
        async with httpx.AsyncClient(timeout=None) as client:
            try:
                # This call will hang until the model is loaded into GPU memory on the LAN server
                resp = await client.post(
                    f"{OLLAMA_BASE_URL}/api/generate", 
                    json={"model": model},
                    timeout=120.0 
                )
                return resp.status_code == 200
            except Exception as e:
                print(f"Failed to invoke model {model} on {OLLAMA_BASE_URL}: {e}")
                return False

    @staticmethod
    async def get_response_stream(model: str, prompt: str, provider: str = "ollama", context: list = []):
        if provider == "openrouter":
            async for chunk in ProviderClient._stream_openrouter(model, prompt):
                yield chunk
        else:
            async for chunk in ProviderClient._stream_ollama(model, prompt, context):
                yield chunk

    @staticmethod
    async def _stream_ollama(model: str, prompt: str, context: list):
        payload = {"model": model, "prompt": prompt, "context": context, "stream": True}
        async with httpx.AsyncClient(timeout=None) as client:
            # Correct endpoint for the Ollama API
            async with client.stream("POST", f"{OLLAMA_BASE_URL}/api/generate", json=payload) as response:
                async for line in response.aiter_lines():
                    if line:
                        yield f"data: {line}\n\n"

    @staticmethod
    async def _stream_openrouter(model: str, prompt: str):
        """Streaming logic for OpenRouter (Cloud models)"""
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": True
        }
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", f"{OPENROUTER_URL}/chat/completions", json=payload, headers=headers) as resp:
                async for line in resp.aiter_lines():
                    if line.startswith("data: "):
                        yield f"{line}\n\n"

    @staticmethod
    async def list_models():
        """Fetches available local models from the LAN Ollama server."""
        async with httpx.AsyncClient() as client:
            try:
                # Correct LAN path: http://<IP>:11434/api/tags
                url = f"{OLLAMA_BASE_URL}/api/tags"
                resp = await client.get(url, timeout=5.0)
                
                if resp.status_code == 200:
                    return resp.json().get("models", [])
                return []
            except Exception as e:
                print(f"Error connecting to LAN Ollama at {OLLAMA_BASE_URL}: {e}")
                return []