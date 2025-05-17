from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
import os


load_dotenv()
api_key=os.getenv("GOOGLE_API_KEY")

def get_llm():
    try:
        llm=ChatGoogleGenerativeAI(model="gemini-2.0-flash")
        print("successfully intialized LLM")
        return llm
    except Exception as e:
        print("Error initializing LLM:",e)
def main():
    llm=get_llm()
if __name__ == "__main__":
   main()