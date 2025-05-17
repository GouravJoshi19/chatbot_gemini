from datetime import datetime
import uuid
from fastapi import HTTPException
from pymongo import DESCENDING
from app.config.llm_config import get_llm
from app.config.db_config import get_db
from app.utils.helpers import create_title
from app.models.schemas import ChatQuery

llm = get_llm()
db = get_db()
collection = db["db_collection"]

async def start_new_chat(user_id: int):
    conversation_id = str(uuid.uuid4())
    return {"conversation_id": conversation_id}

async def handle_chat_query(user_id: int, conversation_id: str, chat_query: ChatQuery):
    query = chat_query.query
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    first_message = collection.find_one(
        {"user_id": user_id, "conversation_id": conversation_id},
        sort=[("timestamp", 1)]
    )

    title = await create_title(query) if not first_message or first_message["title"] == "New Chat" else first_message["title"]

    try:
        response = await llm.ainvoke(query)
        ai_response_content = response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")  

    collection.insert_one({
        "user_id": user_id,
        "conversation_id": conversation_id,
        "query": query,
        "response": ai_response_content,
        "timestamp": datetime.now(),
        "title": title
    })

    return {"response": ai_response_content, "conversation_id": conversation_id}

def fetch_conversation(user_id: int, conversation_id: str):
    messages_cursor = collection.find(
        {"user_id": user_id, "conversation_id": conversation_id},
        {"query": 1, "response": 1, "timestamp": 1, "_id": 0}
    ).sort("timestamp", 1)

    messages = list(messages_cursor)
    if not messages:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {"conversation": messages}

def fetch_conversation_history(user_id: int):
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$sort": {"timestamp": DESCENDING}},
        {"$group": {
            "_id": "$conversation_id",
            "title": {"$first": "$title"},
            "last_updated": {"$first": "$timestamp"}
        }},
        {"$sort": {"last_updated": DESCENDING}},
        {"$project": {
            "_id": 0,
            "conversation_id": "$_id",
            "title": 1,
            "last_updated": 1
        }}
    ]

    history_data = list(collection.aggregate(pipeline))
    for item in history_data:
        if not item.get("title"):
            item["title"] = "Untitled Chat"
    return {"history": history_data}
