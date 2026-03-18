"""
Enhanced AI Routes for NexGen-Quillix Automation Platform
AI-powered content generation and assistance
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
from pydantic import BaseModel, Field
import logging

from app.core.security import get_current_user
from app.services.ai.groq_service import GroqService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize AI service
ai_service = GroqService()


# ==================== Pydantic Models ====================

class GeneratePostRequest(BaseModel):
    """Request to generate a post"""
    prompt: Optional[str] = Field(None, description="Short prompt/topic for the post")
    niche: Optional[str] = Field(None, min_length=1, max_length=100)
    tone: str = Field("professional", pattern="^(professional|friendly|humorous|inspirational|educational)$")
    platform: Optional[str] = None
    include_emoji: bool = True
    include_cta: bool = True
    include_hashtags: bool = True
    length: str = Field("medium", pattern="^(short|medium|long)$")


class GenerateReplyRequest(BaseModel):
    """Request to generate a reply"""
    comment: str = Field(..., min_length=1, max_length=500)
    tone: str = Field("friendly", pattern="^(professional|friendly|humorous)$")
    platform: Optional[str] = None


class GenerateHashtagsRequest(BaseModel):
    """Request to generate hashtags"""
    content: str = Field(..., min_length=1, max_length=1000)
    niche: str = Field(..., min_length=1, max_length=50)
    count: int = Field(5, ge=3, le=30)


class GenerateCaptionsRequest(BaseModel):
    """Request to generate image captions"""
    image_description: Optional[str] = None
    tone: str = "creative"
    platform: Optional[str] = None


class ContentOptimizationRequest(BaseModel):
    """Request to optimize content for a platform"""
    content: str = Field(..., min_length=1, max_length=5000)
    target_platform: str
    improve_engagement: bool = True
    shorten: bool = False


# ==================== AI Endpoints ====================

@router.post("/generate-post")
async def generate_post(
    request: GeneratePostRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate a social media post using AI"""
    try:
        # If prompt is provided, use it; otherwise use niche
        topic = request.prompt or request.niche
        
        result = ai_service.generate_post(
            niche=topic,
            tone=request.tone,
            platform=request.platform,
            include_emoji=request.include_emoji,
            include_cta=request.include_cta,
            include_hashtags=request.include_hashtags,
            length=request.length
        )
        
        return {
            "success": True,
            "content": result.get("content"),
            "niche": topic,
            "tone": request.tone
        }
        
    except Exception as e:
        logger.error(f"Post generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate post"
        )


@router.post("/generate-reply")
async def generate_reply(
    request: GenerateReplyRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate a reply to a comment"""
    try:
        result = ai_service.generate_reply(
            comment=request.comment,
            tone=request.tone,
            platform=request.platform
        )
        
        return {
            "success": True,
            "reply": result.get("reply"),
            "original_comment": request.comment
        }
        
    except Exception as e:
        logger.error(f"Reply generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate reply"
        )


@router.post("/generate-hashtags")
async def generate_hashtags(
    request: GenerateHashtagsRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate relevant hashtags"""
    try:
        result = ai_service.generate_hashtags(
            content=request.content,
            niche=request.niche,
            count=request.count
        )
        
        return {
            "success": True,
            "hashtags": result.get("hashtags", [])
        }
        
    except Exception as e:
        logger.error(f"Hashtag generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate hashtags"
        )


@router.post("/optimize-content")
async def optimize_content(
    request: ContentOptimizationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Optimize content for a specific platform"""
    try:
        result = ai_service.optimize_content(
            content=request.content,
            target_platform=request.target_platform,
            improve_engagement=request.improve_engagement,
            shorten=request.shorten
        )
        
        return {
            "success": True,
            "original_content": request.content,
            "optimized_content": result.get("content"),
            "suggestions": result.get("suggestions", [])
        }
        
    except Exception as e:
        logger.error(f"Content optimization error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to optimize content"
        )


@router.post("/generate-captions")
async def generate_captions(
    request: GenerateCaptionsRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate captions for images"""
    try:
        result = ai_service.generate_caption(
            description=request.image_description,
            tone=request.tone,
            platform=request.platform
        )
        
        return {
            "success": True,
            "captions": result.get("captions", [])
        }
        
    except Exception as e:
        logger.error(f"Caption generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate captions"
        )


@router.post("/analyze-sentiment")
async def analyze_sentiment(
    text: str,
    current_user: dict = Depends(get_current_user)
):
    """Analyze sentiment of text"""
    try:
        result = ai_service.analyze_sentiment(text)
        
        return {
            "success": True,
            "sentiment": result.get("sentiment"),
            "score": result.get("score")
        }
        
    except Exception as e:
        logger.error(f"Sentiment analysis error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze sentiment"
        )


@router.post("/translate")
async def translate_content(
    content: str,
    target_language: str,
    current_user: dict = Depends(get_current_user)
):
    """Translate content to another language"""
    try:
        result = ai_service.translate(content, target_language)
        
        return {
            "success": True,
            "original": content,
            "translated": result.get("translation"),
            "language": target_language
        }
        
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to translate content"
        )


# ==================== Health Check ====================

@router.get("/health")
async def ai_health():
    """AI service health check"""
    return {
        "status": "healthy",
        "service": "ai",
        "available": ai_service.is_available()
    }
