from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv
import os
import asyncio
load_dotenv()

uri = os.getenv("MONGODB_URI")


def get_db():
    try:
        client = MongoClient(uri, server_api=ServerApi('1'))
        client.admin.command("ping")
        print("successfully Connected to MongoDB")
        return client["chatbot-database"]
    
    except Exception as e:
        print("error connecting to database",e)

def main():
    db=get_db()
    collection = db["db_collection"]
    # if collection:
    #     print("Collection exists")  
if __name__ == "__main__":
    main()