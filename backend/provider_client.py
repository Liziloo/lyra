# backend/provider_client.py
import httpx
import json
import os

OLLAMA_URL = "http://localhost:11434/api"
OPENROUTER_URL = "https://openrouter.ai/api/v1"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")

class ProviderClient:
    @staticmethod
    async def get_response_stream(model: str, prompt: str, provider: str = "ollama", context: list = []):
        # FIX: "yield from" is not allowed in async functions. 
        # We must use "async for" to delegate to the sub-generators.
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
            async with client.stream("POST", f"{OLLAMA_URL}/generate", json=payload) as response:
                async for line in response.aiter_lines():
                    if line:
                        # Standardize the data format for the frontend
                        yield f"data: {line}\n\n"

    @staticmethod
    async def _stream_openrouter(model: str, prompt: str):
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
        """Used by the model route to fetch local tags."""
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{OLLAMA_URL}/tags", timeout=5.0)
                return resp.json().get("models", [])
            except:
                return []