"""
Enhanced Social Routes for NexGen-Quillix Automation Platform
Complete social media account management and posting functionality
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
import logging

from app.database import db
from app.core.security import get_current_user, OAuthProvider
from app.services.platform.factory import PlatformFactory
from app.models import serialize_doc

logger = logging.getLogger(__name__)

router = APIRouter()

# Supported platforms
SUPPORTED_PLATFORMS = ["facebook", "instagram", "linkedin", "x", "youtube", "whatsapp"]

# Platform scopes mapping
PLATFORM_SCOPES = {
    "facebook": "pages_manage_posts,pages_read_engagement,instagram_basic",
    "instagram": "user_profile,user_media,instagram_basic,instagram_manage_insights",
    "linkedin": "r_liteprofile,w_member_social,r_emailaddress",
    "x": "tweet.read tweet.write users.read offline.access",
    "youtube": "https://www.googleapis.com/auth/youtube.force-ssl",
    "whatsapp": "whatsapp_business_management,whatsapp_business_messaging"
}

# OAuth URLs
OAUTH_URLS = {
    "facebook": "https://www.facebook.com/v19.0/dialog/oauth",
    "instagram": "https://api.instagram.com/oauth/authorize",
    "linkedin": "https://www.linkedin.com/oauth/v2/authorization",
    "x": "https://twitter.com/i/oauth2/authorize",
    "youtube": "https://accounts.google.com/o/oauth2/v2/auth",
    "whatsapp": "https://www.facebook.com/v19.0/dialog/oauth"
}


# ==================== Pydantic Models ====================

class PlatformConnectRequest(BaseModel):
    """Request to connect a social platform"""
    platform: str
    access_token: str
    refresh_token: Optional[str] = None
    platform_user_id: Optional[str] = None
    platform_username: Optional[str] = None
    expires_in: Optional[int] = None  # Token expiration in seconds


class PlatformOAuthInit(BaseModel):
    """Initiate OAuth flow"""
    platform: str


class PostCreate(BaseModel):
    """Create a post"""
    content: str = Field(..., min_length=1, max_length=5000)
    platforms: List[str] = Field(..., min_items=1)
    media_urls: List[str] = Field(default_factory=list)
    media_type: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    is_draft: bool = False
    enable_analytics: bool = True
    enable_engagement: bool = False


class PostUpdate(BaseModel):
    """Update a post"""
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None
    scheduled_time: Optional[datetime] = None


class AutomationRuleCreate(BaseModel):
    """Create an automation rule"""
    name: str = Field(..., min_length=1, max_length=100)
    platform: str
    trigger: str
    action: str
    conditions: Dict[str, Any] = Field(default_factory=dict)
    message_template: Optional[str] = None
    schedule: Optional[str] = None
    is_active: bool = True
    priority: int = Field(default=5, ge=1, le=10)


class AutomationRuleUpdate(BaseModel):
    """Update an automation rule"""
    name: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = Field(None, ge=1, le=10)
    conditions: Optional[Dict[str, Any]] = None
    message_template: Optional[str] = None
    schedule: Optional[str] = None


class BulkPostCreate(BaseModel):
    """Bulk create posts"""
    posts: List[PostCreate] = Field(..., max_items=10)


class EngagementAction(BaseModel):
    """Engagement action on a post"""
    post_id: str
    platform: str
    action: str  # like, comment, share, reply
    message: Optional[str] = None


# ==================== Platform Endpoints ====================

@router.get("/platforms")
async def get_supported_platforms():
    """Get list of supported social platforms"""
    return {
        "platforms": SUPPORTED_PLATFORMS,
        "count": len(SUPPORTED_PLATFORMS),
        "scopes": PLATFORM_SCOPES
    }


@router.get("/platforms/{platform}/oauth-url")
async def get_oauth_url(
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """Get OAuth URL for a specific platform"""
    if platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platform. Available: {SUPPORTED_PLATFORMS}"
        )
    
    from app.config import settings
    from app.core.security import generate_oauth_state
    
    # Generate state
    state = generate_oauth_state(str(current_user["_id"]), platform)
    
    # Build OAuth URL
    redirect_uri = getattr(settings, f"{platform.upper()}_REDIRECT_URI", None)
    client_id = getattr(settings, f"{platform.upper()}_CLIENT_ID", None)
    scopes = PLATFORM_SCOPES.get(platform, "")
    
    if not redirect_uri or not client_id:
        return {
            "error": "OAuth not configured for this platform",
            "platform": platform
        }
    
    # Platform-specific OAuth URL building
    if platform == "facebook" or platform == "whatsapp":
        oauth_url = (
            f"{OAUTH_URLS[platform]}?client_id={client_id}"
            f"&redirect_uri={redirect_uri}&scope={scopes}"
            f"&state={state}&response_type=code"
        )
    elif platform == "instagram":
        oauth_url = (
            f"{OAUTH_URLS[platform]}?client_id={client_id}"
            f"&redirect_uri={redirect_uri}&scope={scopes}"
            f"&state={state}&response_type=code"
        )
    elif platform == "linkedin":
        oauth_url = (
            f"{OAUTH_URLS[platform]}?client_id={client_id}"
            f"&redirect_uri={redirect_uri}&scope={scopes}"
            f"&state={state}&response_type=code"
        )
    elif platform == "x":
        oauth_url = (
            f"{OAUTH_URLS[platform]}?client_id={client_id}"
            f"&redirect_uri={redirect_uri}&scope={scopes}"
            f"&state={state}&response_type=code&code_challenge=challenge&code_challenge_method=plain"
        )
    elif platform == "youtube":
        oauth_url = (
            f"{OAUTH_URLS[platform]}?client_id={client_id}"
            f"&redirect_uri={redirect_uri}&scope={scopes}"
            f"&state={state}&response_type=code&access_type=offline&prompt=consent"
        )
    else:
        oauth_url = f"{OAUTH_URLS[platform]}?client_id={client_id}&redirect_uri={redirect_uri}&scope={scopes}&state={state}"
    
    return {
        "platform": platform,
        "oauth_url": oauth_url,
        "state": state,
        "scopes": scopes.split(",")
    }


@router.post("/platforms/{platform}/connect")
async def connect_platform(
    platform: str,
    request: PlatformConnectRequest,
    current_user: dict = Depends(get_current_user)
):
    """Connect a social media account manually (or after OAuth callback)"""
    if platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platform. Available: {SUPPORTED_PLATFORMS}"
        )
    
    user_id = str(current_user["_id"])
    
    # Check if account already exists
    existing = await db.social_accounts.find_one({
        "user_id": user_id,
        "platform": platform
    })
    
    # Calculate expiration
    expires_at = None
    if request.expires_in:
        expires_at = datetime.utcnow() + timedelta(seconds=request.expires_in)
    
    account_data = {
        "user_id": user_id,
        "platform": platform,
        "platform_user_id": request.platform_user_id,
        "platform_username": request.platform_username,
        "access_token_encrypted": request.access_token,  # In production, encrypt this
        "refresh_token_encrypted": request.refresh_token,
        "permissions": PLATFORM_SCOPES.get(platform, "").split(","),
        "is_active": True,
        "auto_refresh": True,
        "expires_at": expires_at,
        "connected_at": datetime.utcnow(),
        "last_used": datetime.utcnow()
    }
    
    if existing:
        # Update existing account
        await db.social_accounts.update_one(
            {"_id": existing["_id"]},
            {"$set": {**account_data, "updated_at": datetime.utcnow()}}
        )
        
        # Update user's connected accounts list
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$addToSet": {"connected_accounts": platform}}
        )
        
        logger.info(f"Platform account updated: {platform} for user {user_id}")
        
        return {
            "message": f"{platform} account updated successfully",
            "platform": platform,
            "status": "updated"
        }
    
    # Create new account
    result = await db.social_accounts.insert_one(account_data)
    
    # Update user's connected accounts
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$addToSet": {"connected_accounts": platform}}
    )
    
    logger.info(f"Platform account connected: {platform} for user {user_id}")
    
    return {
        "message": f"{platform} account connected successfully",
        "platform": platform,
        "account_id": str(result.inserted_id),
        "status": "connected"
    }


@router.get("/accounts")
async def get_connected_accounts(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    include_inactive: bool = False
):
    """Get all connected social media accounts"""
    user_id = str(current_user["_id"])
    
    query = {"user_id": user_id}
    if platform:
        query["platform"] = platform
    if not include_inactive:
        query["is_active"] = True
    
    accounts = []
    async for account in db.social_accounts.find(query).sort("connected_at", -1):
        account_data = serialize_doc(account)
        account_data.pop("access_token_encrypted", None)
        account_data.pop("refresh_token_encrypted", None)
        
        # Check if token is expired
        if account.get("expires_at") and account["expires_at"] < datetime.utcnow():
            account_data["needs_reauth"] = True
        else:
            account_data["needs_reauth"] = False
        
        accounts.append(account_data)
    
    return {
        "accounts": accounts,
        "count": len(accounts)
    }


@router.get("/accounts/{platform}")
async def get_account(
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific connected account"""
    user_id = str(current_user["_id"])
    
    account = await db.social_accounts.find_one({
        "user_id": user_id,
        "platform": platform
    })
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No {platform} account connected"
        )
    
    account_data = serialize_doc(account)
    account_data.pop("access_token_encrypted", None)
    account_data.pop("refresh_token_encrypted", None)
    
    # Check token status
    if account.get("expires_at") and account["expires_at"] < datetime.utcnow():
        account_data["needs_reauth"] = True
    else:
        account_data["needs_reauth"] = False
    
    return account_data


@router.delete("/accounts/{platform}")
async def disconnect_account(
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """Disconnect a social media account"""
    user_id = str(current_user["_id"])
    
    if platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platform"
        )
    
    result = await db.social_accounts.delete_one({
        "user_id": user_id,
        "platform": platform
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No {platform} account found"
        )
    
    # Remove from user's connected accounts
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {"$pull": {"connected_accounts": platform}}
    )
    
    logger.info(f"Platform account disconnected: {platform} for user {user_id}")
    
    return {"message": f"{platform} account disconnected successfully"}


@router.post("/accounts/{platform}/refresh")
async def refresh_platform_token(
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """Refresh platform access token"""
    user_id = str(current_user["_id"])
    
    account = await db.social_accounts.find_one({
        "user_id": user_id,
        "platform": platform
    })
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No {platform} account connected"
        )
    
    refresh_token = account.get("refresh_token_encrypted")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No refresh token available"
        )
    
    # Token refresh logic (platform-specific)
    # This is a placeholder - actual implementation depends on platform API
    try:
        # In production, call platform's token refresh endpoint
        logger.info(f"Token refresh requested for {platform}")
        
        return {
            "message": "Token refresh initiated",
            "platform": platform
        }
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


# ==================== Post Endpoints ====================

@router.post("/posts")
async def create_post(
    post: PostCreate,
    current_user: dict = Depends(get_current_user),
    background_tasks: BackgroundTasks = None
):
    """Create and optionally publish a post"""
    user_id = str(current_user["_id"])
    
    # Validate platforms
    invalid_platforms = [p for p in post.platforms if p not in SUPPORTED_PLATFORMS]
    if invalid_platforms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platforms: {invalid_platforms}"
        )
    
    # Check if all platforms are connected
    connected_accounts = await db.social_accounts.find({
        "user_id": user_id,
        "platform": {"$in": post.platforms},
        "is_active": True
    }).to_list(length=None)
    
    connected_platforms = {acc["platform"] for acc in connected_accounts}
    missing_platforms = set(post.platforms) - connected_platforms
    
    if missing_platforms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Accounts not connected for: {list(missing_platforms)}"
        )
    
    # Determine status
    if post.is_draft:
        status_value = "draft"
    elif post.scheduled_time:
        if post.scheduled_time <= datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Scheduled time must be in the future"
            )
        status_value = "scheduled"
    else:
        status_value = "draft"  # Default to draft, publish separately
    
    # Create post document
    post_doc = {
        "user_id": user_id,
        "content": post.content,
        "platforms": post.platforms,
        "media_urls": post.media_urls,
        "media_type": post.media_type,
        "scheduled_time": post.scheduled_time,
        "status": status_value,
        "is_draft": post.is_draft,
        "enable_analytics": post.enable_analytics,
        "enable_engagement": post.enable_engagement,
        "publish_results": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.posts.insert_one(post_doc)
    post_id = str(result.inserted_id)
    
    # If scheduled in the past or immediate publish
    if not post.is_draft and not post.scheduled_time:
        # Update status to pending publish
        await db.posts.update_one(
            {"_id": result.inserted_id},
            {"$set": {"status": "pending"}}
        )
        
        # Trigger background publishing
        # In production, add to task queue
        # background_tasks.add_task(publish_post_task, post_id)
    
    logger.info(f"Post created: {post_id} for user {user_id}")
    
    return {
        "message": "Post created successfully",
        "post_id": post_id,
        "status": status_value,
        "scheduled_time": post.scheduled_time
    }


@router.post("/posts/bulk")
async def bulk_create_posts(
    bulk: BulkPostCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create multiple posts at once"""
    user_id = str(current_user["_id"])
    
    created_posts = []
    errors = []
    
    for idx, post in enumerate(bulk.posts):
        try:
            # Validate platforms
            invalid_platforms = [p for p in post.platforms if p not in SUPPORTED_PLATFORMS]
            if invalid_platforms:
                errors.append({"index": idx, "error": f"Unsupported platforms: {invalid_platforms}"})
                continue
            
            # Create post document
            post_doc = {
                "user_id": user_id,
                "content": post.content,
                "platforms": post.platforms,
                "media_urls": post.media_urls,
                "media_type": post.media_type,
                "scheduled_time": post.scheduled_time,
                "status": "draft",
                "is_draft": post.is_draft,
                "enable_analytics": post.enable_analytics,
                "enable_engagement": post.enable_engagement,
                "publish_results": [],
                "created_at": datetime.utcnow()
            }
            
            result = await db.posts.insert_one(post_doc)
            created_posts.append({
                "index": idx,
                "post_id": str(result.inserted_id)
            })
            
        except Exception as e:
            errors.append({"index": idx, "error": str(e)})
    
    return {
        "created": len(created_posts),
        "posts": created_posts,
        "errors": len(errors),
        "error_details": errors
    }


@router.get("/posts")
async def get_posts(
    current_user: dict = Depends(get_current_user),
    status_filter: Optional[str] = None,
    platform_filter: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get user's posts with pagination"""
    user_id = str(current_user["_id"])
    
    query = {"user_id": user_id}
    
    if status_filter:
        query["status"] = status_filter
    if platform_filter:
        query["platforms"] = platform_filter
    
    # Calculate pagination
    skip = (page - 1) * limit
    
    # Get total count
    total = await db.posts.count_documents(query)
    
    # Get posts
    posts_cursor = db.posts.find(query).sort("created_at", -1).skip(skip).limit(limit)
    posts = await posts_cursor.to_list(length=limit)
    
    return {
        "posts": serialize_doc(posts),
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }


@router.get("/posts/{post_id}")
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


@router.put("/posts/{post_id}")
async def update_post(
    post_id: str,
    post_update: PostUpdate,
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


@router.delete("/posts/{post_id}")
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


@router.post("/posts/{post_id}/publish")
async def publish_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Publish a post immediately"""
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
            detail="Post already published"
        )
    
    # Get connected accounts for required platforms
    results = []
    for platform in post["platforms"]:
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
            # Get platform service
            service = PlatformFactory.get_service(
                platform, 
                account.get("access_token_encrypted")
            )
            
            # Publish to platform
            publish_result = service.publish({
                "content": post["content"],
                "media_urls": post.get("media_urls", [])
            })
            
            results.append({
                "platform": platform,
                "status": "success",
                "result": publish_result
            })
            
            # Update last used
            await db.social_accounts.update_one(
                {"_id": account["_id"]},
                {"$set": {"last_used": datetime.utcnow()}}
            )
            
        except Exception as e:
            logger.error(f"Publish error for {platform}: {e}")
            results.append({
                "platform": platform,
                "status": "error",
                "message": str(e)
            })
    
    # Update post status
    all_success = all(r["status"] == "success" for r in results)
    await db.posts.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$set": {
                "status": "published" if all_success else "partial",
                "publish_results": results,
                "published_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "Post published",
        "results": results,
        "overall_status": "success" if all_success else "partial_failure"
    }


# ==================== Automation Rules Endpoints ====================

@router.post("/automation/rules")
async def create_automation_rule(
    rule: AutomationRuleCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create an automation rule"""
    if rule.platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platform: {rule.platform}"
        )
    
    valid_triggers = [
        "new_follower", "new_comment", "mention", "scheduled",
        "new_post", "new_like", "new_share", "new_message"
    ]
    if rule.trigger not in valid_triggers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid trigger. Valid: {valid_triggers}"
        )
    
    valid_actions = [
        "auto_reply", "auto_like", "auto_follow_back", "publish_post",
        "send_dm", "send_email", "webhook", "schedule_post"
    ]
    if rule.action not in valid_actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action. Valid: {valid_actions}"
        )
    
    rule_doc = {
        "user_id": str(current_user["_id"]),
        "name": rule.name,
        "platform": rule.platform,
        "trigger": rule.trigger,
        "action": rule.action,
        "conditions": rule.conditions,
        "message_template": rule.message_template,
        "schedule": rule.schedule,
        "is_active": rule.is_active,
        "priority": rule.priority,
        "execution_count": 0,
        "last_executed": None,
        "created_at": datetime.utcnow()
    }
    
    result = await db.automation_rules.insert_one(rule_doc)
    
    logger.info(f"Automation rule created: {rule.name} for user {current_user['_id']}")
    
    return {
        "message": "Automation rule created",
        "rule_id": str(result.inserted_id)
    }


@router.get("/automation/rules")
async def get_automation_rules(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    include_inactive: bool = False
):
    """Get all automation rules"""
    user_id = str(current_user["_id"])
    
    query = {"user_id": user_id}
    if platform:
        query["platform"] = platform
    if not include_inactive:
        query["is_active"] = True
    
    rules = await db.automation_rules.find(query).sort("created_at", -1).to_list(length=100)
    
    return {
        "rules": serialize_doc(rules),
        "count": len(rules)
    }


@router.put("/automation/rules/{rule_id}")
async def update_automation_rule(
    rule_id: str,
    rule_update: AutomationRuleUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an automation rule"""
    from bson import ObjectId
    
    user_id = str(current_user["_id"])
    
    try:
        existing = await db.automation_rules.find_one({
            "_id": ObjectId(rule_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid rule ID"
        )
    
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation rule not found"
        )
    
    # Build update document
    update_data = {k: v for k, v in rule_update.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.automation_rules.update_one(
        {"_id": ObjectId(rule_id)},
        {"$set": update_data}
    )
    
    return {"message": "Automation rule updated"}


@router.delete("/automation/rules/{rule_id}")
async def delete_automation_rule(
    rule_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an automation rule"""
    from bson import ObjectId
    
    user_id = str(current_user["_id"])
    
    try:
        result = await db.automation_rules.delete_one({
            "_id": ObjectId(rule_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid rule ID"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation rule not found"
        )
    
    return {"message": "Automation rule deleted"}


@router.post("/automation/rules/{rule_id}/toggle")
async def toggle_automation_rule(
    rule_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Toggle an automation rule on/off"""
    from bson import ObjectId
    
    user_id = str(current_user["_id"])
    
    try:
        rule = await db.automation_rules.find_one({
            "_id": ObjectId(rule_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid rule ID"
        )
    
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation rule not found"
        )
    
    new_enabled = not rule.get("is_active", True)
    
    await db.automation_rules.update_one(
        {"_id": ObjectId(rule_id)},
        {"$set": {"is_active": new_enabled, "updated_at": datetime.utcnow()}}
    )
    
    return {
        "message": f"Automation rule {'enabled' if new_enabled else 'disabled'}",
        "is_active": new_enabled
    }


# ==================== Engagement Endpoints ====================

@router.post("/engagement")
async def perform_engagement(
    action: EngagementAction,
    current_user: dict = Depends(get_current_user)
):
    """Perform an engagement action (like, comment, share)"""
    user_id = str(current_user["_id"])
    
    if action.platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platform"
        )
    
    valid_actions = ["like", "comment", "share", "reply"]
    if action.action not in valid_actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action. Valid: {valid_actions}"
        )
    
    # Get connected account
    account = await db.social_accounts.find_one({
        "user_id": user_id,
        "platform": action.platform,
        "is_active": True
    })
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{action.platform} account not connected"
        )
    
    try:
        service = PlatformFactory.get_service(
            action.platform,
            account.get("access_token_encrypted")
        )
        
        # Perform action based on type
        if action.action == "like":
            result = service.like_post(action.post_id)
        elif action.action == "comment":
            result = service.comment_post(action.post_id, action.message)
        elif action.action == "share":
            result = service.share_post(action.post_id)
        elif action.action == "reply":
            result = service.reply_to_comment(action.post_id, action.message)
        
        return {
            "message": f"Successfully performed {action.action}",
            "result": result
        }
        
    except Exception as e:
        logger.error(f"Engagement action error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to perform action: {str(e)}"
        )


# ==================== Health Check ====================

@router.get("/health")
async def social_health():
    """Social service health check"""
    return {
        "status": "healthy",
        "service": "social"
    }
