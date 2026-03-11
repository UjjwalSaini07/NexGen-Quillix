"""
Enhanced Posts Routes for NexGen-Quillix Automation Platform
Complete post management functionality
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
import logging

from app.database import db
from app.core.security import get_current_user
from app.models import serialize_doc
from app.services.platform.factory import PlatformFactory
from app.services.platform.token_refresh import token_refresh_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ==================== Pydantic Models ====================

class PostCreateRequest(BaseModel):
    """Create post request"""
    content: str = Field(..., min_length=1, max_length=5000)
    platforms: List[str] = Field(..., min_items=1)
    media_urls: List[str] = Field(default_factory=list)
    media_type: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    is_draft: bool = False
    enable_analytics: bool = True


class PostUpdateRequest(BaseModel):
    """Update post request"""
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None
    scheduled_time: Optional[datetime] = None


class PostResponse(BaseModel):
    """Post response"""
    id: str
    content: str
    platforms: List[str]
    media_urls: List[str]
    media_type: Optional[str]
    status: str
    is_draft: bool
    scheduled_time: Optional[datetime]
    published_at: Optional[datetime]
    created_at: datetime


# ==================== Post Endpoints ====================

@router.post("/create")
async def create_post(
    post_data: PostCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new post"""
    user_id = str(currentUser["_id"])
    
    # Validate platforms
    supported_platforms = ["facebook", "instagram", "linkedin", "x", "youtube", "whatsapp"]
    for platform in post_data.platforms:
        if platform not in supported_platforms:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported platform: {platform}"
            )
    
    # Check if platforms are connected
    for platform in post_data.platforms:
        account = await db.social_accounts.find_one({
            "user_id": user_id,
            "platform": platform,
            "is_active": True
        })
        
        if not account:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{platform} account not connected"
            )
    
    # Determine status
    if post_data.is_draft:
        status_value = "draft"
    elif post_data.scheduled_time:
        if post_data.scheduled_time <= datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scheduled time must be in the future"
            )
        status_value = "scheduled"
    else:
        status_value = "pending"  # Ready to publish
    
    # Create post document
    post_doc = {
        "user_id": user_id,
        "content": post_data.content,
        "platforms": post_data.platforms,
        "media_urls": post_data.media_urls,
        "media_type": post_data.media_type,
        "scheduled_time": post_data.scheduled_time,
        "status": status_value,
        "is_draft": post_data.is_draft,
        "enable_analytics": post_data.enable_analytics,
        "publish_results": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.posts.insert_one(post_doc)
    post_id = str(result.inserted_id)
    
    logger.info(f"Post created: {post_id} by user {user_id}")
    
    return {
        "message": "Post created successfully",
        "post_id": post_id,
        "status": status_value,
        "scheduled_time": post_data.scheduled_time
    }


@router.get("/")
async def get_posts(
    current_user: dict = Depends(get_current_user),
    status_filter: Optional[str] = None,
    platform: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get all posts for the current user"""
    user_id = str(currentUser["_id"])
    
    query = {"user_id": user_id}
    
    if status_filter:
        query["status"] = status_filter
    if platform:
        query["platforms"] = platform
    
    # Pagination
    skip = (page - 1) * limit
    total = await db.posts.count_documents(query)
    
    posts = await db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return {
        "posts": serialize_doc(posts),
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }


@router.get("/{post_id}")
async def get_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific post"""
    from bson import ObjectId
    
    user_id = str(currentUser["_id"])
    
    try:
        post = await db.posts.find_one({
            "_id": ObjectId(post_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    return serialize_doc(post)


@router.put("/{post_id}")
async def update_post(
    post_id: str,
    post_update: PostUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update a post"""
    from bson import ObjectId
    
    user_id = str(currentUser["_id"])
    
    try:
        post = await db.posts.find_one({
            "_id": ObjectId(post_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if post["status"] == "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot edit published posts"
        )
    
    # Build update document
    update_data = {k: v for k, v in post_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": update_data}
    )
    
    return {"message": "Post updated successfully"}


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a post"""
    from bson import ObjectId
    
    user_id = str(currentUser["_id"])
    
    try:
        post = await db.posts.find_one({
            "_id": ObjectId(post_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if post["status"] == "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete published posts"
        )
    
    await db.posts.delete_one({"_id": ObjectId(post_id)})
    
    return {"message": "Post deleted successfully"}


@router.post("/{post_id}/publish")
async def publish_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Publish a post immediately"""
    from bson import ObjectId
    
    user_id = str(currentUser["_id"])
    
    try:
        post = await db.posts.find_one({
            "_id": ObjectId(post_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if post["status"] == "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Post already published"
        )
    
    # Publish to each platform
    results = []
    for platform in post["platforms"]:
        # Get account
        account = await db.social_accounts.find_one({
            "user_id": user_id,
            "platform": platform,
            "is_active": True
        })
        
        if not account:
            results.append({
                "platform": platform,
                "status": "error",
                "message": f"{platform} account not connected"
            })
            continue
        
        try:
            # Check if token needs refresh
            if account.get("expires_at") and account["expires_at"] < datetime.utcnow():
                # Refresh token
                await token_refresh_service.refresh_token(account)
            
            # Get service
            service = PlatformFactory.get_service(
                platform,
                account.get("access_token_encrypted")
            )
            
            # Publish
            publish_result = service.publish({
                "content": post["content"],
                "media_urls": post.get("media_urls", [])
            })
            
            results.append({
                "platform": platform,
                "status": "success",
                "result": publish_result
            })
            
        except Exception as e:
            logger.error(f"Publish error for {platform}: {e}")
            results.append({
                "platform": platform,
                "status": "error",
                "message": str(e)
            })
    
    # Update post status
    all_success = all(r["status"] == "success" for r in results)
    new_status = "published" if all_success else "partial_failure"
    
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$set": {
                "status": new_status,
                "publish_results": results,
                "published_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "Post published",
        "results": results,
        "overall_status": new_status
    }


@router.post("/{post_id}/schedule")
async def schedule_post(
    post_id: str,
    scheduled_time: datetime,
    current_user: dict = Depends(get_current_user)
):
    """Schedule a post for future publishing"""
    from bson import ObjectId
    
    user_id = str(currentUser["_id"])
    
    if scheduled_time <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scheduled time must be in the future"
        )
    
    try:
        post = await db.posts.find_one({
            "_id": ObjectId(post_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$set": {
                "scheduled_time": scheduled_time,
                "status": "scheduled",
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "Post scheduled",
        "scheduled_time": scheduled_time
    }


# ==================== Health Check ====================

@router.get("/health")
async def posts_health():
    """Posts service health check"""
    return {
        "status": "healthy",
        "service": "posts"
    }
