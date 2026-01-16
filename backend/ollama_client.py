import httpx
import json

OLLAMA_URL = "http://localhost:11434/api"

class OllamaClient:
    @staticmethod
    async def get_response_stream(model: str, prompt: str, context: list = []):
        payload = {
            "model": model,
            "prompt": prompt,
            "context": context,
            "stream": True
        }
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream("POST", f"{OLLAMA_URL}/generate", json=payload) as response:
                async for line in response.aiter_lines():
                    if line:
                        data = json.loads(line)
                        yield f"data: {json.dumps(data)}\n\n"
                        if data.get("done"):
                            break

    @staticmethod
    async def list_models():
        async with httpx.AsyncClient() as client:
            try:
                resp = await client.get(f"{OLLAMA_URL}/tags", timeout=5.0)
                resp.raise_for_status()
                return resp.json().get("models", [])
            except httpx.RequestError:
                return [] # Return empty list if Ollama is offline