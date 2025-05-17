from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.chatbot_routes import router as chatbot_router

app = FastAPI()

# CORS setup
origins = [
    "http://localhost", "http://localhost:8080",
    "http://127.0.0.1", "http://127.0.0.1:8080",
    "http://127.0.0.1:5500", "null"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot_router)

@app.get("/")
def home():
    return {"message": "Welcome to the Chat API"}