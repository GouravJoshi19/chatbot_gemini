from fastapi import APIRouter, HTTPException
from app.models.schemas import *
from app.services.chatbot_service import (
    start_new_chat,
    handle_chat_query,
    fetch_conversation,
    fetch_conversation_history
)

router = APIRouter()

@router.post("/chat/{user_id}", response_model=NewChatResponse)
async def new_chat(user_id: int):
    return await start_new_chat(user_id)

@router.post("/chat/{user_id}/conversation/{conversation_id}", response_model=ChatResponse)
async def chat(user_id: int, conversation_id: str, chat_query: ChatQuery):
    return await handle_chat_query(user_id, conversation_id, chat_query)

@router.get("/chat/{user_id}/conversation/{conversation_id}", response_model=ConversationResponse)
def get_conversation(user_id: int, conversation_id: str):
    return fetch_conversation(user_id, conversation_id)

@router.get("/chat/{user_id}/conversations", response_model=HistoryResponse)
def get_conversation_history(user_id: int):
    return fetch_conversation_history(user_id)
