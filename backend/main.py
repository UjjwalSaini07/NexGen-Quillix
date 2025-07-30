from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from linkedin.linkedin_generator import LinkedInPostGenerator
import redis
import hashlib
import json
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI()

# CORS (allow access from frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis cache
redis_client = redis.Redis(host="localhost", port=6379, db=0)

class GenerateRequest(BaseModel):
    prompt: str
    words: int = 200
    tone: str = "professional"
    template: str = "informative"
    add_hashtags: bool = False
    add_emojis: bool = False
    variations: int = 1

@app.post("/generate")
async def generate_post(request: GenerateRequest):
    try:
        cache_key = hashlib.sha256(json.dumps(request.dict(), sort_keys=True).encode()).hexdigest()
        if redis_client.exists(cache_key):
            cached = redis_client.get(cache_key)
            return json.loads(cached)

        generator = LinkedInPostGenerator(api_key=os.getenv("GROQ_API_KEY"))
        results = generator.generate_post(**request.dict())
        response = {"success": True, "results": results}

        redis_client.setex(cache_key, 3600, json.dumps(response))
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
