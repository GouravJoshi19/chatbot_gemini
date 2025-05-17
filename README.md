# 🧠 FastAPI Chatbot with MongoDB & LLM Integration

This is a lightweight chatbot backend powered by **FastAPI**, **MongoDB**, and a Language Learning Model (LLM). The frontend is a simple HTML/JS app powered by **Gemini-generated UI**, and uses REST APIs to interact with the backend.

---

## 📁 Project Structure  
├── app/  
│ ├── api/   # FastAPI route handlers 

│ ├── config/ # Database and LLM configuration 

│ ├── models/ # Pydantic schemas 

│ ├── services/ # Core logic (chat, history, etc.) 

│ ├── utils/ # Helpers (title generation) 

│ └── main.py # Entry point for FastAPI app 

│
├── frontend/ # HTML/JS Gemini-based frontend 

│ └── index.html 

│
├── .env # (NOT COMMITTED) MongoDB URI, LLM/Google API Key 

├── requirements.txt # Python dependencies 

└── run.py # Uvicorn launcher

---

## 🚀 Features

- 🧠 Chat with an LLM (e.g., OpenAI, Gemini, or local model)
- 💬 Stores chat history in MongoDB
- 📚 Fetch previous conversations with titles and timestamps
- 🌐 Simple frontend using `index.html` — no build step required
- 🔒 Clean project architecture ready for production & extension

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/fastapi-chatbot.git
cd fastapi-chatbot
```
### 2. Install Backend Dependencies
Use a virtual environment if possible. 
```bash 
pip install -r requirements.txt
```
### 3. Configure Environment Variables
Create a .env file in the root directory:
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/chatdb?retryWrites=true&w=majority
GOOGLE_API_KEY=your_gemini_or_llm_api_key
```
⚠️ Do not commit your .env file. It is excluded in .gitignore.

### 4. Run the FastAPI Backend
```bash
python run.py
```
Backend will be available at:
📍 http://127.0.0.1:8000

### 5. Run the Frontend
You can simply open frontend/index.html in your browser.

If your browser blocks local files, use Live Server in VS Code or run a simple local server:
```bash 
cd frontend
python -m http.server 8080
```
Then open:
📍 http://127.0.0.1:8080

### 🔐 Notes
Ensure your MongoDB Atlas cluster is accessible from your IP.

This project assumes a Gemini-style or OpenAI-compatible ainvoke() method for LLMs.

Streaming support is planned — you can uncomment the provided stream_response() logic.

### 🛠️ To-Do / Improvements

⏳ Add streaming output support

🖼️ Add better frontend UI

✅ LLM Memory / Context Awareness.


📦 Dockerize for full-stack deployment

### 🤝 Contributing
Pull requests and improvements are welcome! 

If you spot bugs or have ideas for improvement, feel free to open an issue.