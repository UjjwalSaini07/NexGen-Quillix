from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from linkedin.linkedin_generator import LinkedInPostGenerator
from typing import Optional
import redis
import hashlib
import json
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis client with decoding enabled
redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

# Request body schema
class LinkedInGenerateRequest(BaseModel):
    prompt: str
    words: int = 200
    tone: str = "formal"
    template: str = "professional"
    add_hashtags: bool = False
    add_emojis: bool = False
    variations: int = 1
    language: str = "en"
    call_to_action: Optional[str] = None
    audience: Optional[str] = None

# LinkedIn post generation endpoint
@app.post("/generate/linkedin")
async def generate_linkedin_post(request: LinkedInGenerateRequest):
    try:
        cache_key = hashlib.sha256(json.dumps(request.dict(), sort_keys=True).encode()).hexdigest()

        # Return from cache if available
        if redis_client.exists(cache_key):
            cached = redis_client.get(cache_key)
            return json.loads(cached)

        # Generate LinkedIn post
        generator = LinkedInPostGenerator(api_key=os.getenv("GROQ_API_KEY"))
        results = generator.generate_post(**request.dict())
        response = {"success": True, "results": results}

        # Cache for 1 hour
        redis_client.setex(cache_key, 3600, json.dumps(response))
        return response

    except Exception as e:
        logger.error(f"LinkedIn generation error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
