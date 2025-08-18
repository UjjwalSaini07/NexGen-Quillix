from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List
from utils.device_detector import detect_and_store
from linkedin.linkedin_generator import LinkedInPostGenerator
from instagram.instagram_generator import InstagramPostGenerator
from x.x_generator import XPostGenerator
from facebook.facebook_generator import FacebookPostGenerator
from youtube.youtube_generator import YouTubePostGenerator
import redis
import hashlib
import orjson
from dotenv import load_dotenv
import os
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("QuillixPostAPI")
app = FastAPI(title="Quillix Post Generator API", version="1.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://nexgenquillix.vercel.app/"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis connection
# redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def set_value(key: str, value: str):
    redis_client.set(key, value)

def get_value(key: str):
    return redis_client.get(key)

# Pydantic model
class LinkedInGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=5)
    words: int = Field(200, gt=10, le=1000)
    tone: str = Field("formal")
    template: str = Field("professional")
    add_hashtags: bool = False
    add_emojis: bool = False
    variations: int = Field(1, ge=1, le=5)
    language: str = Field("en", description="Language code like 'en', 'fr', etc.")
    call_to_action: Optional[str] = None
    audience: Optional[str] = None

class InstagramGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=5)
    words: int = Field(200, gt=10, le=300)
    tone: str = Field("humorous")
    template: str = Field("aesthetic")
    add_hashtags: bool = False
    add_emojis: bool = False
    add_music: bool = Field(False)
    add_event: bool = False
    post_type: Optional[str] = None
    postgoal: Optional[str] = None
    variations: int = Field(1, ge=1, le=10)
    call_to_action: Optional[str] = None
    language: str = Field("en", description="Language code like 'en', 'fr', etc.")
    audience: Optional[str] = None
    eventDetails: Optional[str] = None
    music_preference: Optional[str] = Field(None, description="Music preference for the post")

class XGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=5)
    words: int = Field(200, gt=10, le=300)
    tone: str = Field("optimistic")
    template: str = Field("professional")
    add_hashtags: bool = False
    add_emojis: bool = False
    add_mentions: bool = False
    add_event: bool = False
    postTweetTypeOptions: Optional[str] = None
    postgoal: Optional[str] = None
    variations: int = Field(1, ge=1, le=10)
    language: str = Field("en", description="Language code like 'en', 'fr', etc.")
    audience: Optional[str] = None
    eventDetails: Optional[str] = None

class FacebookGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=5)
    words: int = Field(80, gt=10, le=500)
    tone: str = Field("trendy")
    template: str = Field("storytelling")
    add_hashtags: bool = Field(False)
    add_emojis: bool = Field(False)
    add_music: bool = Field(False)
    variations: int = Field(1, ge=1, le=10)
    language: str = Field("en", description="Language code like 'en', 'fr', etc.")
    call_to_action: Optional[str] = None
    audience: Optional[str] = None
    post_type: Optional[str] = Field(None, description="Type of the post")
    music_preference: Optional[str] = Field(None, description="Music preference for the post")
    music_language: Optional[str] = Field(None, description="Music language for the post")

class YouTubeGenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=5)
    words: int = Field(80, gt=10, le=500)
    template: str = Field("default")
    tone: str = Field("friendly")
    postTypeOptions: str = Field("Video Description")
    add_hashtags: bool = True
    add_emojis: bool = False
    variations: int = Field(3, ge=1, le=10)
    language: str = Field("en", description="Language code like 'en', 'fr', etc.")
    call_to_action: Optional[str] = None
    audience: Optional[str] = None

# Utility: Cache key generator
def generate_cache_key(data: dict) -> str:
    json_data = orjson.dumps(data, option=orjson.OPT_SORT_KEYS)
    return hashlib.sha256(json_data).hexdigest()

# Utility: Get from Redis safely
def get_cached_response(key: str):
    try:
        cached = redis_client.get(key)
        return orjson.loads(cached) if cached else None
    except Exception as e:
        logger.warning(f"Redis read failed: {e}")
        return None

# POST endpoint
# ======= LINKEDIN ENDPOINT =======
@app.post("/generate/linkedin")
async def generate_linkedin_post(request: Request, body: LinkedInGenerateRequest):
    try:
        req_data = body.dict()
        cache_key = generate_cache_key(req_data)
        cached_response = get_cached_response(cache_key)
        if cached_response:
            return cached_response

        generator = LinkedInPostGenerator(api_key=os.getenv("GROQ_API_KEY"))
        results = generator.generate_post(**req_data)

        response = {"success": True, "results": results}
        redis_client.setex(cache_key, 3600, orjson.dumps(response).decode())

        if cache_key:
            await detect_and_store(request, cache_key)
            print("[DeviceDetector] Device detection triggered from - LinkedIn post generation.")

        return response

    except Exception as e:
        logger.exception("Error generating post")
        raise HTTPException(status_code=500, detail="Error generating post")

# ======= INSTAGRAM ENDPOINT =======
@app.post("/generate/instagram")
async def generate_instagram_post(request: Request, body: InstagramGenerateRequest):
    try:
        req_data = body.dict()
        cache_key = generate_cache_key(req_data)
        cached_response = get_cached_response(cache_key)
        if cached_response:
            return cached_response

        generator = InstagramPostGenerator(api_key=os.getenv("GROQ_API_KEY"))
        results = generator.generate_post(**req_data)

        response = {"success": True, "results": results}
        redis_client.setex(cache_key, 3600, orjson.dumps(response).decode())

        if cache_key:
            await detect_and_store(request, cache_key)
            print("[DeviceDetector] Device detection triggered from - Instagram post generation.")

        return response

    except Exception as e:
        logger.exception("Error generating post")
        raise HTTPException(status_code=500, detail="Error generating post")

# ======= X ENDPOINT =======
@app.post("/generate/x")
async def generate_x_post(request: Request, body: XGenerateRequest):
    try:
        req_data = body.dict()
        cache_key = generate_cache_key(req_data)
        cached_response = get_cached_response(cache_key)
        if cached_response:
            return cached_response

        generator = XPostGenerator(api_key=os.getenv("GROQ_API_KEY"))
        results = generator.generate_post(**req_data)

        response = {"success": True, "results": results}
        redis_client.setex(cache_key, 3600, orjson.dumps(response).decode())

        if cache_key:
            await detect_and_store(request, cache_key)
            print("[DeviceDetector] Device detection triggered from - X post generation.")
        
        return response

    except Exception as e:
        logger.exception("Error generating X post")
        raise HTTPException(status_code=500, detail="Error generating X post")

# ======= FACEBOOK ENDPOINT =======
@app.post("/generate/facebook")
async def generate_facebook_post(request: Request, body: FacebookGenerateRequest):
    try:
        req_data = body.dict()
        cache_key = generate_cache_key(req_data)
        cached_response = get_cached_response(cache_key)
        if cached_response:
            return cached_response

        generator = FacebookPostGenerator(api_key=os.getenv("GROQ_API_KEY"))
        results = generator.generate_post(**req_data)

        response = {"success": True, "results": results}
        redis_client.setex(cache_key, 3600, orjson.dumps(response).decode())

        if cache_key:
            await detect_and_store(request, cache_key)
            print("[DeviceDetector] Device detection triggered from - Facebook post generation.")

        return response

    except Exception as e:
        logger.exception("Error generating Facebook post")
        raise HTTPException(status_code=500, detail="Error generating Facebook post")

# ======= YOUTUBE ENDPOINT =======
@app.post("/generate/youtube")
async def generate_youtube_post(request: Request, body: YouTubeGenerateRequest):
    try:
        req_data = body.dict()
        cache_key = generate_cache_key(req_data)
        cached_response = get_cached_response(cache_key)
        if cached_response:
            return cached_response

        generator = YouTubePostGenerator(api_key=os.getenv("GROQ_API_KEY"))
        results = generator.generate_post(**req_data)

        response = {"success": True, "results": results}
        redis_client.setex(cache_key, 3600, orjson.dumps(response).decode())

        if cache_key:
            await detect_and_store(request, cache_key)
            print("[DeviceDetector] Device detection triggered from - YouTube post generation.")

        return response

    except Exception as e:
        logger.exception("Error generating YouTube post")
        raise HTTPException(status_code=500, detail="Error generating YouTube post")

# GET: health check
@app.get("/health", response_class=JSONResponse)
async def health_check():
    health_report = {
        "status": "ok",
        "redis": False,
        "env_ready": False,
        "version": "0.1.0",
    }

    # Redis connectivity
    try:
        redis_client.ping()
        health_report["redis"] = True
    except Exception as e:
        logger.warning(f"Redis health check failed: {e}")

    if os.getenv("GROQ_API_KEY"):
        health_report["env_ready"] = True

    overall_status = (
        "ok" if all(health_report.values()) else "degraded" if health_report["redis"] else "fail"
    )
    health_report["status"] = overall_status

    status_code = 200 if overall_status == "ok" else 503
    return JSONResponse(status_code=status_code, content=health_report)

# NEW FEATURE: Get last N generations (simulated history feature)
@app.get("/history/recent")
def get_recent_history(limit: int = 5):
    try:
        keys = redis_client.keys("*")[-limit:]
        posts = [get_cached_response(k) for k in keys]
        return {"recent": [p for p in posts if p]}
    except Exception as e:
        logger.error(f"Failed to fetch history: {e}")
        raise HTTPException(status_code=500, detail="Error fetching history")

@app.get("/detect/device")
def detect_device():
    try:
        result = detect_and_store()
        return {"success": True, "data": result}
    except Exception as e:
        logger.error(f"Device detection failed: {e}")
        raise HTTPException(status_code=500, detail="Error detecting device")

@app.get("/meta")
def get_site_metadata():
    cache_key = "site_metadata"
    try:
        cached = redis_client.get(cache_key)
        if cached:
            return orjson.loads(cached)
    except Exception as e:
        logger.warning(f"Redis cache read failed: {e}")

    # Internal metadata
    metadata = {
        "viewport": "width=device-width, initial-scale=1.0",
        "httpEquiv": "IE=edge",
        "description": (
            "NexGen-Quillix is an AI-powered content creation platform that crafts tailored, "
            "high-impact posts for LinkedIn, Instagram, X (Twitter), and more in seconds. "
            "Leveraging real-time trend analysis and customizable tone adaptation, it empowers "
            "marketers, entrepreneurs, and creators to boost engagement and streamline content workflows."
        ),
        "author": "UjjwalS",
        "authorUrl": "https://www.ujjwalsaini.dev/",
        "keywords": (
            "NexGen-Quillix, AI content creation, social media posts, LinkedIn, Instagram, X, "
            "Twitter, trend analysis, content automation, Next.js, React.js, TypeScript, Python, "
            "TailwindCSS, Redis, Docker, GitHub Actions"
        ),
        "og": {
            "title": "NexGen-Quillix: AI-Powered Content Creation",
            "author": "UjjwalS",
            "description": (
                "Create platform-ready social media content instantly with NexGen-Quillix, an AI-driven "
                "tool tailored for marketers and creators, enhancing digital presence through smart automation "
                "and creative flexibility."
            ),
            "image": "/NexGenQuillixLogo.png",
            "url": "http://localhost:3000/",
            "type": "website",
            "locale": "en_US",
            "site_name": "NexGen-Quillix"
        },
        "twitter": {
            "card": "summary_large_image",
            "title": "NexGen-Quillix: AI-Powered Content Creation",
            "description": (
                "Generate high-impact, trend-aware social media posts in seconds with NexGen-Quillix, "
                "combining intelligent AI automation with creative control for marketers and creators."
            ),
            "image": "/NexGenQuillixLogo.png",
            "site": "@NexGenQuillix",
            "creator": "@UjjwalSaini0007"
        },
        "canonical": "http://localhost:3000/",
        "robots": "index, follow",
        "themeColor": "#",
        "rating": "General",
        "distribution": "Global",
        "copyright": "NexGen-Quillix ©2025",
        "applicationName": "NexGen-Quillix",
        "appleMobileWebAppTitle": "NexGen-Quillix",
        "appleMobileWebAppCapable": "yes"
    }

    # Cache in Redis for 24 hours
    try:
        redis_client.setex(cache_key, 86400, orjson.dumps(metadata).decode())
    except Exception as e:
        logger.warning(f"Redis cache write failed: {e}")

    return metadata
