import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MONGO_URL = os.getenv("MONGO_URL")
    REDIS_URL = os.getenv("REDIS_URL")
    JWT_SECRET = os.getenv("JWT_SECRET")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

settings = Settings()