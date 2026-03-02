from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.database import db
from app.models.social_account import social_account_schema
from app.services.platform.factory import PlatformFactory
from app.core.security import get_current_user

router = APIRouter()

# Pydantic models for request validation
class SocialAccountCreate(BaseModel):
    platform: str
    access_token: str
    refresh_token: Optional[str] = None
    platform_user_id: Optional[str] = None

class PostCreate(BaseModel):
    content: str
    platforms: List[str]
    media_url: Optional[str] = None
    scheduled_time: Optional[datetime] = None

class EngagementAction(BaseModel):
    post_id: str
    action: str  # 'like', 'comment', 'share', 'reply'
    message: Optional[str] = None

class AutomationRule(BaseModel):
    platform: str
    trigger: str  # 'new_follower', 'new_comment', 'mention', 'scheduled'
    action: str  # 'auto_reply', 'auto_like', 'auto_follow_back', 'publish_post'
    message_template: Optional[str] = None
    schedule: Optional[str] = None
    enabled: bool = True

SUPPORTED_PLATFORMS = ["instagram", "facebook", "linkedin", "x", "youtube", "whatsapp"]

@router.get("/platforms")
async def get_supported_platforms():
    """Get list of supported social platforms"""
    return {
        "platforms": SUPPORTED_PLATFORMS,
        "count": len(SUPPORTED_PLATFORMS)
    }

@router.post("/connect")
async def connect_social_account(
    account: SocialAccountCreate,
    current_user: dict = Depends(get_current_user)
):
    """Connect a social media account to the user's profile"""
    if account.platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Platform '{account.platform}' not supported. Supported: {SUPPORTED_PLATFORMS}"
        )
    
    # Check if account already exists
    existing = await db.social_accounts.find_one({
        "user_id": current_user["_id"],
        "platform": account.platform
    })
    
    if existing:
        # Update existing account
        await db.social_accounts.update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "access_token": account.access_token,
                "refresh_token": account.refresh_token,
                "platform_user_id": account.platform_user_id,
                "updated_at": datetime.utcnow()
            }}
        )
        return {"message": f"{account.platform} account updated successfully"}
    
    # Create new account
    account_data = social_account_schema(
        user_id=str(current_user["_id"]),
        platform=account.platform,
        access_token=account.access_token,
        refresh_token=account.refresh_token
    )
    account_data["platform_user_id"] = account.platform_user_id
    
    result = await db.social_accounts.insert_one(account_data)
    return {
        "message": f"{account.platform} account connected successfully",
        "account_id": str(result.inserted_id)
    }

@router.get("/accounts")
async def get_connected_accounts(current_user: dict = Depends(get_current_user)):
    """Get all connected social media accounts for the current user"""
    accounts = []
    async for account in db.social_accounts.find({"user_id": str(current_user["_id"])}):
        account["_id"] = str(account["_id"])
        # Don't return access tokens
        account.pop("access_token", None)
        account.pop("refresh_token", None)
        accounts.append(account)
    
    return {
        "accounts": accounts,
        "count": len(accounts)
    }

@router.delete("/accounts/{platform}")
async def disconnect_account(
    platform: str,
    current_user: dict = Depends(get_current_user)
):
    """Disconnect a social media account"""
    result = await db.social_accounts.delete_one({
        "user_id": str(current_user["_id"]),
        "platform": platform
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No {platform} account found for this user"
        )
    
    return {"message": f"{platform} account disconnected successfully"}

@router.post("/publish")
async def publish_post(
    post: PostCreate,
    current_user: dict = Depends(get_current_user)
):
    """Publish a post to multiple social platforms"""
    # Validate platforms
    invalid_platforms = [p for p in post.platforms if p not in SUPPORTED_PLATFORMS]
    if invalid_platforms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platforms: {invalid_platforms}"
        )
    
    # Get connected accounts
    results = []
    for platform in post.platforms:
        account = await db.social_accounts.find_one({
            "user_id": str(current_user["_id"]),
            "platform": platform
        })
        
        if not account:
            results.append({
                "platform": platform,
                "status": "error",
                "message": f"{platform} account not connected"
            })
            continue
        
        try:
            service = PlatformFactory.get_service(platform, account)
            publish_result = service.publish({
                "content": post.content,
                "media_url": post.media_url
            })
            results.append({
                "platform": platform,
                "status": "success",
                "result": publish_result
            })
        except Exception as e:
            results.append({
                "platform": platform,
                "status": "error",
                "message": str(e)
            })
    
    # Save post to database
    post_data = {
        "user_id": str(current_user["_id"]),
        "content": post.content,
        "media_url": post.media_url,
        "platforms": post.platforms,
        "scheduled_time": post.scheduled_time,
        "status": "published" if all(r["status"] == "success" for r in results) else "partial",
        "publish_results": results,
        "created_at": datetime.utcnow()
    }
    await db.posts.insert_one(post_data)
    
    return {
        "message": "Post published",
        "results": results
    }

@router.post("/schedule")
async def schedule_post(
    post: PostCreate,
    current_user: dict = Depends(get_current_user)
):
    """Schedule a post for future publishing"""
    if not post.scheduled_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scheduled time is required"
        )
    
    if post.scheduled_time <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scheduled time must be in the future"
        )
    
    post_data = {
        "user_id": str(current_user["_id"]),
        "content": post.content,
        "media_url": post.media_url,
        "platforms": post.platforms,
        "scheduled_time": post.scheduled_time,
        "status": "scheduled",
        "created_at": datetime.utcnow()
    }
    
    result = await db.posts.insert_one(post_data)
    return {
        "message": "Post scheduled successfully",
        "post_id": str(result.inserted_id),
        "scheduled_time": post.scheduled_time
    }

@router.get("/posts")
async def get_posts(
    current_user: dict = Depends(get_current_user),
    status_filter: Optional[str] = None,
    platform_filter: Optional[str] = None,
    limit: int = 50
):
    """Get posts for the current user with optional filters"""
    query = {"user_id": str(current_user["_id"])}
    
    if status_filter:
        query["status"] = status_filter
    if platform_filter:
        query["platforms"] = platform_filter
    
    posts = []
    async for post in db.posts.find(query).sort("created_at", -1).limit(limit):
        post["_id"] = str(post["_id"])
        posts.append(post)
    
    return {
        "posts": posts,
        "count": len(posts)
    }

@router.get("/posts/{post_id}")
async def get_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific post by ID"""
    from bson import ObjectId
    
    post = await db.posts.find_one({
        "_id": ObjectId(post_id),
        "user_id": str(current_user["_id"])
    })
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    post["_id"] = str(post["_id"])
    return post

@router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a post (only drafts or scheduled)"""
    from bson import ObjectId
    
    post = await db.posts.find_one({
        "_id": ObjectId(post_id),
        "user_id": str(current_user["_id"])
    })
    
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

# Automation Rules Endpoints
@router.post("/automation/rules")
async def create_automation_rule(
    rule: AutomationRule,
    current_user: dict = Depends(get_current_user)
):
    """Create an automation rule"""
    if rule.platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platform: {rule.platform}"
        )
    
    rule_data = {
        "user_id": str(current_user["_id"]),
        "platform": rule.platform,
        "trigger": rule.trigger,
        "action": rule.action,
        "message_template": rule.message_template,
        "schedule": rule.schedule,
        "enabled": rule.enabled,
        "created_at": datetime.utcnow()
    }
    
    result = await db.automation_rules.insert_one(rule_data)
    return {
        "message": "Automation rule created",
        "rule_id": str(result.inserted_id)
    }

@router.get("/automation/rules")
async def get_automation_rules(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None
):
    """Get all automation rules for the current user"""
    query = {"user_id": str(current_user["_id"])}
    if platform:
        query["platform"] = platform
    
    rules = []
    async for rule in db.automation_rules.find(query):
        rule["_id"] = str(rule["_id"])
        rules.append(rule)
    
    return {
        "rules": rules,
        "count": len(rules)
    }

@router.put("/automation/rules/{rule_id}")
async def update_automation_rule(
    rule_id: str,
    rule: AutomationRule,
    current_user: dict = Depends(get_current_user)
):
    """Update an automation rule"""
    from bson import ObjectId
    
    result = await db.automation_rules.update_one(
        {"_id": ObjectId(rule_id), "user_id": str(current_user["_id"])},
        {"$set": {
            "platform": rule.platform,
            "trigger": rule.trigger,
            "action": rule.action,
            "message_template": rule.message_template,
            "schedule": rule.schedule,
            "enabled": rule.enabled,
            "updated_at": datetime.utcnow()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation rule not found"
        )
    
    return {"message": "Automation rule updated"}

@router.delete("/automation/rules/{rule_id}")
async def delete_automation_rule(
    rule_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an automation rule"""
    from bson import ObjectId
    
    result = await db.automation_rules.delete_one({
        "_id": ObjectId(rule_id),
        "user_id": str(current_user["_id"])
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation rule not found"
        )
    
    return {"message": "Automation rule deleted"}

@router.post("/automation/{rule_id}/toggle")
async def toggle_automation_rule(
    rule_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Toggle an automation rule on/off"""
    from bson import ObjectId
    
    rule = await db.automation_rules.find_one({
        "_id": ObjectId(rule_id),
        "user_id": str(current_user["_id"])
    })
    
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation rule not found"
        )
    
    new_enabled = not rule.get("enabled", True)
    await db.automation_rules.update_one(
        {"_id": ObjectId(rule_id)},
        {"$set": {"enabled": new_enabled}}
    )
    
    return {
        "message": f"Automation rule {'enabled' if new_enabled else 'disabled'}",
        "enabled": new_enabled
    }

# OAuth endpoints (placeholder)
@router.get("/{platform}/login")
async def login(platform: str):
    """Redirect user to platform OAuth URL"""
    if platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platform: {platform}"
        )
    
    oauth_urls = {
        "facebook": "https://www.facebook.com/v19.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=pages_manage_posts,pages_read_engagement",
        "instagram": "https://api.instagram.com/oauth/authorize?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=user_profile,user_media",
        "linkedin": "https://www.linkedin.com/oauth/v2/authorization?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=r_liteprofile,w_member_social",
        "x": "https://twitter.com/i/oauth2/authorize?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=tweet.read tweet.write users.read",
        "youtube": "https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=https://www.googleapis.com/auth/youtube.force-ssl",
        "whatsapp": "https://www.facebook.com/v19.0/dialog/oauth?client_id=YOUR_APP_ID&redirect_uri=YOUR_REDIRECT_URI&scope=whatsapp_business_management,whatsapp_business_messaging"
    }
    
    return {
        "platform": platform,
        "oauth_url": oauth_urls.get(platform),
        "message": f"Redirect user to {platform} OAuth URL"
    }

@router.get("/{platform}/callback")
async def callback(platform: str, code: str):
    """Handle OAuth callback and exchange code for token"""
    if platform not in SUPPORTED_PLATFORMS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported platform: {platform}"
        )
    
    # In production, you would exchange the code for an access token here
    return {
        "message": f"Exchange code for token for {platform}",
        "platform": platform,
        "note": "Token exchange should be implemented with platform-specific API calls"
    }