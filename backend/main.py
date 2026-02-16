"""
FastAPI backend: POST /api/chat for the RAG agent.
Run from project root: uvicorn backend.main:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.rag import chat

app = FastAPI(title="Agent RAG API", version="0.1.0")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3003",
        "http://127.0.0.1:3003",
        # لو لديك واجهات أخرى مثلاً:
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    conversationId: str | None = None


class ChatResponse(BaseModel):
    reply: str


@app.get("/")
def root():
    return {
        "message": "Agent RAG API",
        "chat_ui": "Open http://localhost:3000 in your browser for the chat interface.",
        "health": "/health",
        "chat": "POST /api/chat",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


import traceback

@app.post("/api/chat", response_model=ChatResponse)
def api_chat(body: ChatRequest):
    if not body.message or not body.message.strip():
        raise HTTPException(status_code=400, detail="message is required")

    try:
        reply = chat(body.message.strip(), body.conversationId)
        return ChatResponse(reply=reply)

    except Exception as e:
        print("\n--- Backend Traceback ---")
        traceback.print_exc()
        print("-------------------------\n")
        raise HTTPException(status_code=500, detail="Internal Server Error")