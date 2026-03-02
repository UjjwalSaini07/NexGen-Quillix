from fastapi import APIRouter
from app.services.ai.groq_service import GroqService

router = APIRouter()
ai_service = GroqService()

@router.post("/generate-post")
async def generate_post(data: dict):
    content = ai_service.generate_post(data["niche"], data["tone"])
    return {"content": content}

@router.post("/generate-reply")
async def generate_reply(data: dict):
    reply = ai_service.generate_reply(data["comment"])
    return {"reply": reply}