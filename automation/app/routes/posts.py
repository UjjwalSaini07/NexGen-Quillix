"""
Enhanced Posts Routes for NexGen-Quillix Automation Platform
Complete post management functionality
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
import logging
import os

from app.database import db
from app.core.security import get_current_user
from app.models import serialize_doc
from app.services.platform.factory import PlatformFactory
from app.services.platform.token_refresh import token_refresh_service
from app.services.platform.base import TokenExpiredError, PlatformError

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
    user_id = str(current_user["_id"])
    
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
    user_id = str(current_user["_id"])
    
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
    
    user_id = str(current_user["_id"])
    
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
    
    user_id = str(current_user["_id"])
    
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
    
    user_id = str(current_user["_id"])
    
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
    
    logger.info(f"=== PUBLISH ENDPOINT CALLED for post_id: {post_id} ===")
    user_id = str(current_user["_id"])
    
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
        logger.info(f"Publishing to platform: {platform} for post {post_id}")
        
        # Get account
        account = await db.social_accounts.find_one({
            "user_id": user_id,
            "platform": platform,
            "is_active": True
        })
        
        logger.info(f"Account for {platform}: {account is not None}")
        if account:
            logger.info(f"Account has extra_credentials: {account.get('extra_credentials') is not None}")
        
        if not account:
            results.append({
                "platform": platform,
                "status": "error",
                "message": f"{platform} account not connected"
            })
            continue
        
        try:
            # Check if token needs refresh
            access_token_for_service = account.get("access_token_encrypted")
            
            if account.get("expires_at") and account["expires_at"] < datetime.utcnow():
                # Refresh token
                refresh_result = await token_refresh_service.refresh_token(account)
                if refresh_result and refresh_result.get("access_token"):
                    access_token_for_service = refresh_result["access_token"]
                    # Update account with new token
                    await db.social_accounts.update_one(
                        {"_id": account["_id"]},
                        {"$set": {
                            "access_token_encrypted": access_token_for_service,
                            "expires_at": datetime.utcnow() if platform != "facebook" else None
                        }}
                    )
                    logger.info(f"Proactively refreshed token for {platform}")
            
            # Get service
            # For X platform, we need to pass extra credentials
            service_kwargs = {}
            logger.info(f"Checking X credentials - account has extra_credentials: {account.get('extra_credentials') is not None}")
            
            if platform == "x":
                extra_creds = account.get("extra_credentials", {})
                
                # Use .env credentials as PRIMARY (more reliable), not user-stored ones
                from app.config import settings
                
                # Try to get from settings first, then os.getenv as fallback
                api_key = getattr(settings, 'TWITTER_API_KEY', None) or os.getenv("TWITTER_API_KEY")
                api_secret = getattr(settings, 'TWITTER_API_SECRET', None) or os.getenv("TWITTER_API_SECRET")
                access_token_secret = getattr(settings, 'TWITTER_ACCESS_SECRET', None) or os.getenv("TWITTER_ACCESS_SECRET")
                bearer_token = getattr(settings, 'TWITTER_BEARER_TOKEN', None) or os.getenv("TWITTER_BEARER_TOKEN")
                
                # For X/OAuth, we need the access token. Use refreshed token if available.
                # Try settings first, then use the (potentially refreshed) access_token_for_service
                access_token = getattr(settings, 'TWITTER_ACCESS_TOKEN', None) or os.getenv("TWITTER_ACCESS_TOKEN")
                if not access_token:
                    # Use the potentially refreshed token
                    access_token = access_token_for_service
                
                # If .env credentials don't work, try user-stored credentials
                if not api_key:
                    api_key = extra_creds.get("api_key")
                if not api_secret:
                    api_secret = extra_creds.get("api_secret")
                if not access_token_secret:
                    access_token_secret = extra_creds.get("access_token_secret")
                if not bearer_token:
                    bearer_token = extra_creds.get("bearer_token")
                
                service_kwargs = {
                    "bearer_token": bearer_token,
                    "api_key": api_key,
                    "api_secret": api_secret,
                    "access_token_secret": access_token_secret,
                    "access_token": access_token,
                }
                logger.info(f"X service kwargs: bearer={'yes' if service_kwargs.get('bearer_token') else 'no'}, api_key={'yes' if service_kwargs.get('api_key') else 'no'}, api_secret={'yes' if service_kwargs.get('api_secret') else 'no'}, access_token_secret={'yes' if service_kwargs.get('access_token_secret') else 'no'}, access_token={'yes' if service_kwargs.get('access_token') else 'no'}")
            
            # Get the access token to use (use refreshed token if available)
            # For X platform, the access token is in service_kwargs
            if platform == "x":
                # X uses OAuth 1.0a or OAuth 2.0 - use the token we already set up
                access_token_final = service_kwargs.get("access_token") or account.get("access_token_encrypted")
            elif platform == "facebook":
                # For Facebook, check if there's a page access token
                extra_params = account.get("extra_params", {})
                extra_creds = account.get("extra_credentials", {})
                
                # First try extra_params, then fall back to extra_credentials
                page_access_token = extra_params.get("page_access_token") or extra_creds.get("selected_page_access_token")
                page_id = extra_params.get("page_id") or extra_creds.get("selected_page_id")
                
                logger.info(f"Facebook account check - extra_params: {extra_params}, extra_creds keys: {list(extra_creds.keys()) if extra_creds else 'None'}, page_access_token exists: {bool(page_access_token)}, page_id: {page_id}")
                
                if page_access_token and page_id:
                    access_token_final = page_access_token
                    # Pass page_id to the service
                    service_kwargs["page_id"] = page_id
                    logger.info(f"Using Facebook page access token for page: {page_id}")
                else:
                    logger.warning(f"No page access token found. Using user token. Extra params: {extra_params}, Extra creds keys: {list(extra_creds.keys()) if extra_creds else 'None'}")
                    # Try to fetch pages now if not found
                    try:
                        import requests as req
                        user_token = account.get("access_token_encrypted")
                        if user_token:
                            page_params = {
                                "access_token": user_token,
                                "fields": "id,name,access_token"
                            }
                            pages_response = req.get(
                                "https://graph.facebook.com/v19.0/me/accounts",
                                params=page_params,
                                timeout=30
                            )
                            pages_data = pages_response.json()
                            logger.info(f"Dynamic page fetch result: {pages_data}")
                            
                            if "data" in pages_data and len(pages_data["data"]) > 0:
                                page_access_token = pages_data["data"][0]["access_token"]
                                page_id = pages_data["data"][0]["id"]
                                access_token_final = page_access_token
                                service_kwargs["page_id"] = page_id
                                
                                # Update account with page info
                                await db.social_accounts.update_one(
                                    {"_id": account["_id"]},
                                    {"$set": {
                                        "extra_params": {"page_id": page_id, "page_access_token": page_access_token},
                                        "updated_at": datetime.utcnow()
                                    }}
                                )
                                logger.info(f"Dynamically fetched and stored page token for page: {page_id}")
                            else:
                                access_token_final = access_token_for_service
                    except Exception as fetch_error:
                        logger.error(f"Error dynamically fetching pages: {fetch_error}")
                        access_token_final = access_token_for_service
            else:
                # For other platforms
                access_token_final = access_token_for_service
            
            service = PlatformFactory.get_service(
                platform,
                access_token_final,
                **service_kwargs
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
            
        except TokenExpiredError as e:
            # Token expired - try to refresh and retry
            logger.warning(f"Token expired for {platform}, attempting refresh...")
            try:
                refresh_result = await token_refresh_service.refresh_token(account)
                if refresh_result and refresh_result.get("access_token"):
                    # Update account with new token
                    new_access_token = refresh_result["access_token"]
                    await db.social_accounts.update_one(
                        {"_id": account["_id"]},
                        {"$set": {
                            "access_token_encrypted": new_access_token,
                            "expires_at": datetime.utcnow() if platform != "facebook" else None
                        }}
                    )
                    
                    # Retry with new token
                    service = PlatformFactory.get_service(
                        platform,
                        new_access_token,
                        **service_kwargs
                    )
                    publish_result = service.publish({
                        "content": post["content"],
                        "media_urls": post.get("media_urls", [])
                    })
                    
                    results.append({
                        "platform": platform,
                        "status": "success",
                        "result": publish_result
                    })
                    logger.info(f"Token refresh and retry successful for {platform}")
                else:
                    raise Exception(f"Token refresh failed for {platform}")
            except Exception as refresh_error:
                logger.error(f"Token refresh failed for {platform}: {refresh_error}")
                results.append({
                    "platform": platform,
                    "status": "error",
                    "message": f"Token expired. Please reconnect your {platform} account."
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
    
    user_id = str(current_user["_id"])
    
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
