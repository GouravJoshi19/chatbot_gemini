async def create_title(query: str) -> str:
    from app.config.llm_config import get_llm
    llm = get_llm()
    try:
        prompt = f"Create a short, concise chat title (max 5 words) for: '{query}'"
        title_response = await llm.ainvoke(prompt)
        title = title_response.content.strip().strip('"').strip("'")
        return title if title else "New Chat"
    except Exception as e:
        print(f"Title generation error: {e}")
        return "New Chat"
