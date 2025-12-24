from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import httpx
import os

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5-coder:7b")

app = FastAPI()

@app.post("/v1/chat/completions")
async def chat_completions(request: Request):
    body = await request.json()
    messages = body.get("messages", [])
    prompt = "\n".join(m["content"] for m in messages if m["role"] in ["user", "system"])

    async with httpx.AsyncClient() as client:
        r = await client.post(
            f"{OLLAMA_URL}/api/chat",
            json={"model": MODEL, "messages": [{"role": "user", "content": prompt}]},
            timeout=None,
        )
    data = r.json()
    text = data["message"]["content"]

    return JSONResponse({
        "id": "chatcmpl-local",
        "object": "chat.completion",
        "choices": [{
            "index": 0,
            "message": {"role": "assistant", "content": text},
            "finish_reason": "stop"
        }],
        "usage": {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    })
