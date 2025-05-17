from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ChatQuery(BaseModel):
    query: str

class ConversationMeta(BaseModel):
    conversation_id: str
    title: str
    last_updated: datetime

class ConversationHistoryItem(BaseModel):
    query: str
    response: str
    timestamp: datetime

class ConversationResponse(BaseModel):
    conversation: List[ConversationHistoryItem]

class NewChatResponse(BaseModel):
    conversation_id: str

class ChatResponse(BaseModel):
    response: str
    conversation_id: str

class HistoryResponse(BaseModel):
    history: List[ConversationMeta]
