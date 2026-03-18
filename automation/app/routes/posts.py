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
    # Accept both string and datetime for scheduled_time
    scheduled_time: Optional[str] = None
    is_draft: bool = False
    enable_analytics: bool = True

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Hello world!",
                "platforms": ["facebook", "twitter"],
                "media_urls": [],
                "media_type": None,
                "scheduled_time": "2024-03-18T15:30:00",
                "is_draft": False
            }
        }


class PostUpdateRequest(BaseModel):
    """Update post request"""
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None
    # Accept both string and datetime for scheduled_time
    scheduled_time: Optional[str] = None


class PostResponse(BaseModel):
    """Post response"""
    id: str
    content: str
    platforms: List[str]
    media_urls: List[str]
    media_type: Optional[str]
    status: str
    is_draft: bool
    # Accept both string and datetime for scheduled_time
    scheduled_time: Optional[str] = None
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
        # Handle string format from frontend (local time without timezone)
        scheduled_time_utc = post_data.scheduled_time
        
        # Parse the string to datetime
        if isinstance(scheduled_time_utc, str):
            logger.info(f"Parsing scheduled_time string: {scheduled_time_utc}")
            # Try to parse as ISO format (with or without timezone)
            try:
                # Handle Z suffix
                scheduled_time_str = scheduled_time_utc.replace('Z', '+00:00')
                scheduled_time_utc = datetime.fromisoformat(scheduled_time_str)
                logger.info(f"Parsed with fromisoformat: {scheduled_time_utc}")
            except Exception as e:
                logger.warning(f"Failed to parse with fromisoformat: {e}")
                try:
                    scheduled_time_utc = datetime.strptime(scheduled_time_utc, '%Y-%m-%dT%H:%M:%S')
                    logger.info(f"Parsed with strptime: {scheduled_time_utc}")
                except Exception as e2:
                    logger.error(f"Failed to parse scheduled_time: {e2}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Invalid scheduled_time format: {scheduled_time_utc}. Use YYYY-MM-DDTHH:MM:SS format"
                    )
        
        # Convert to UTC for comparison (treat as local time)
        if scheduled_time_utc.tzinfo is not None:
            scheduled_time_utc = scheduled_time_utc.replace(tzinfo=None)
        
        # Treat the time as local time and convert to UTC for comparison
        # This is a simplification - in production you'd want proper timezone handling
        local_now = datetime.now()
        utc_now = datetime.utcnow()
        
        # Use the scheduled time as-is (local time) and compare
        if scheduled_time_utc <= local_now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scheduled time must be in the future"
            )
        status_value = "scheduled"
        logger.info(f"Post will be scheduled with status: {status_value}, time: {scheduled_time_utc}")
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
    
    logger.info(f"Creating post with status: {status_value}, scheduled_time: {post_data.scheduled_time}")
    
    result = await db.posts.insert_one(post_doc)
    post_id = str(result.inserted_id)
    
    logger.info(f"Post created: {post_id} by user {user_id} with status {status_value}")
    
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
        logger.info(f"Filtering posts by status: {status_filter}, query: {query}")
    if platform:
        query["platforms"] = platform
    
    # Pagination
    skip = (page - 1) * limit
    total = await db.posts.count_documents(query)
    
    posts = await db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    # Log post statuses for debugging
    if posts:
        statuses = [p.get("status") for p in posts]
        logger.info(f"Found {len(posts)} posts with statuses: {statuses}")
    
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
            
            # Handle timezone-aware vs naive datetime comparison
            expires_at = account.get("expires_at")
            if expires_at:
                if expires_at.tzinfo is not None:
                    expires_at = expires_at.replace(tzinfo=None)
                if expires_at < datetime.utcnow():
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
    scheduled_time: str,  # Accept string format from frontend
    current_user: dict = Depends(get_current_user)
):
    """Schedule a post for future publishing"""
    from bson import ObjectId
    
    user_id = str(current_user["_id"])
    
    # Parse the scheduled_time string
    try:
        # Handle Z suffix
        scheduled_time_str = scheduled_time.replace('Z', '+00:00')
        scheduled_time_dt = datetime.fromisoformat(scheduled_time_str)
    except:
        try:
            scheduled_time_dt = datetime.strptime(scheduled_time, '%Y-%m-%dT%H:%M:%S')
        except:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid scheduled_time format: {scheduled_time}. Use YYYY-MM-DDTHH:MM:SS format"
            )
    
    # Convert to UTC for comparison
    scheduled_time_check = scheduled_time_dt
    if scheduled_time_check.tzinfo is not None:
        scheduled_time_check = scheduled_time_check.replace(tzinfo=None)
    
    # Compare with local time (for consistency with frontend)
    if scheduled_time_check <= datetime.now():
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
            status_code=status.HTTP_404_NOT_REQUEST,
            detail="Post not found"
        )
    
    # Store the original string format for consistency
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$set": {
                "scheduled_time": scheduled_time,  # Store original string
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


@router.post("/trigger-scheduled")
async def trigger_scheduled_posts(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Trigger publishing of all scheduled posts that are due"""
    user_id = str(current_user["_id"])
    
    # Find all scheduled posts for current user that are due
    # Use local timezone-aware comparison
    import pytz
    
    # Get server's local timezone or default to UTC
    try:
        local_tz = pytz.timezone('Asia/Calcutta')  # Default to India timezone
    except:
        local_tz = pytz.UTC
    
    # Get current time as UTC with timezone info
    now_utc = datetime.utcnow().replace(tzinfo=pytz.UTC)
    
    logger.info(f"Triggering scheduled posts - Current UTC time: {now_utc}, Timezone: {local_tz}")
    
    # Get all scheduled posts for this user - handle both datetime and string formats
    due_posts = []
    all_scheduled_posts = await db.posts.find({
        "user_id": user_id,
        "status": "scheduled"
    }).to_list(length=100)
    
    logger.info(f"Found {len(all_scheduled_posts)} scheduled posts for user {user_id}")
    
    for post in all_scheduled_posts:
        scheduled_time = post.get("scheduled_time")
        if not scheduled_time:
            continue
            
        # Convert scheduled_time to datetime for comparison
        if isinstance(scheduled_time, str):
            # Try parsing as ISO format with timezone first
            if 'Z' in scheduled_time or '+' in scheduled_time or scheduled_time.endswith('+00:00'):
                try:
                    scheduled_time = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
                except:
                    continue
            else:
                # Parse as naive datetime (local time from frontend)
                try:
                    scheduled_time_naive = datetime.strptime(scheduled_time, '%Y-%m-%dT%H:%M:%S')
                    # Treat as local time and convert to UTC for comparison
                    scheduled_time = local_tz.localize(scheduled_time_naive).astimezone(pytz.UTC)
                except:
                    continue
        elif scheduled_time.tzinfo is not None:
            # Already timezone-aware, convert to UTC
            scheduled_time = scheduled_time.astimezone(pytz.UTC)
        else:
            # Naive datetime, treat as local time
            scheduled_time = local_tz.localize(scheduled_time).astimezone(pytz.UTC)
        
        # Compare with UTC time
        if scheduled_time <= now_utc:
            due_posts.append(post)
    
    logger.info(f"Found {len(due_posts)} posts due for publishing")
    
    results = []
    for post in due_posts:
        try:
            post_id = str(post["_id"])
            post_user_id = post["user_id"]
            platforms = post.get("platforms", [])
            content = post.get("content", "")
            media_urls = post.get("media_urls", [])
            
            logger.info(f"Processing post {post_id} for platforms: {platforms}")
            
            publish_results = []
            all_success = True
            
            for platform in platforms:
                try:
                    # Get the social account
                    account = await db.social_accounts.find_one({
                        "user_id": post_user_id,
                        "platform": platform,
                        "is_active": True
                    })
                    
                    if not account:
                        logger.warning(f"No account found for {platform}")
                        publish_results.append({
                            "platform": platform,
                            "status": "error",
                            "message": f"{platform} account not connected"
                        })
                        all_success = False
                        continue
                    
                    logger.info(f"Found account for {platform}: {account.get('platform_username')}")
                    
                    # Get access token - check all possible sources
                    access_token = (
                        account.get("access_token_encrypted") or
                        account.get("access_token") or
                        account.get("extra_credentials", {}).get("access_token")
                    )
                    
                    if not access_token:
                        logger.warning(f"No access token for {platform}")
                        publish_results.append({
                            "platform": platform,
                            "status": "error",
                            "message": f"No access token for {platform}"
                        })
                        all_success = False
                        continue
                    
                    logger.info(f"Got access token for {platform}")
                    
                    
                    # Build service kwargs (like regular posts do)
                    service_kwargs = {}
                    
                    # For Facebook, handle page access tokens (same logic as regular posts)
                    if platform == "facebook":
                        # First check extra_params and extra_credentials
                        extra_params = account.get("extra_params", {})
                        extra_creds = account.get("extra_credentials", {})
                        
                        page_access_token = extra_params.get("page_access_token") or extra_creds.get("selected_page_access_token")
                        page_id = extra_params.get("page_id") or extra_creds.get("selected_page_id")
                        
                        if page_access_token and page_id:
                            access_token = page_access_token
                            service_kwargs["page_id"] = page_id
                        else:
                            # Try to fetch pages dynamically
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
                                    
                                    if "data" in pages_data and len(pages_data["data"]) > 0:
                                        page_access_token = pages_data["data"][0]["access_token"]
                                        page_id = pages_data["data"][0]["id"]
                                        access_token = page_access_token
                                        service_kwargs["page_id"] = page_id
                                        
                                        # Update account with page info
                                        await db.social_accounts.update_one(
                                            {"_id": account["_id"]},
                                            {"$set": {
                                                "extra_params": {"page_id": page_id, "page_access_token": page_access_token},
                                                "updated_at": datetime.utcnow()
                                            }}
                                        )
                            except Exception as fetch_error:
                                logger.error(f"Error fetching Facebook pages: {fetch_error}")
                    
                    # For X/Twitter, handle extra credentials
                    elif platform == "x" or platform == "twitter":
                        extra = account.get("extra_credentials", {})
                        if extra:
                            bearer_token = extra.get("bearer_token")
                            api_key = extra.get("api_key")
                            api_secret = extra.get("api_secret")
                            access_token_secret = extra.get("access_token_secret")
                            
                            if bearer_token:
                                service_kwargs["bearer_token"] = bearer_token
                            if api_key:
                                service_kwargs["api_key"] = api_key
                            if api_secret:
                                service_kwargs["api_secret"] = api_secret
                            if access_token_secret:
                                service_kwargs["access_token_secret"] = access_token_secret
                            if access_token:
                                service_kwargs["access_token"] = access_token
                    
                    # Get service with access token and page_id if applicable
                    service = PlatformFactory.get_service(platform, access_token, **service_kwargs)
                    
                    # Publish
                    logger.info(f"Publishing to {platform}...")
                    result = service.publish({
                        "content": content,
                        "media_urls": media_urls
                    })
                    
                    logger.info(f"Published to {platform}: {result}")
                    
                    publish_results.append({
                        "platform": platform,
                        "status": "success",
                        "result": result
                    })
                    
                except Exception as e:
                    logger.error(f"Error publishing to {platform}: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    publish_results.append({
                        "platform": platform,
                        "status": "error",
                        "message": str(e)
                    })
                    all_success = False
            
            # Update post status
            new_status = "published" if all_success else "partial_failure"
            logger.info(f"Scheduled post {post_id} status updated to: {new_status}")
            
            await db.posts.update_one(
                {"_id": post["_id"]},
                {"$set": {
                    "status": new_status,
                    "publish_results": publish_results,
                    "published_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }}
            )
            
            results.append({
                "post_id": post_id,
                "status": new_status,
                "success": True,
                "publish_results": publish_results
            })
            
        except Exception as e:
            results.append({
                "post_id": str(post["_id"]),
                "status": "error",
                "success": False,
                "message": str(e)
            })
    
    return {
        "message": f"Processed {len(results)} scheduled posts",
        "results": results
    }
