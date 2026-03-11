"""
Enhanced User Models with Pydantic for NexGen-Quillix Automation Platform
Complete user schema with validation and serialization
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, validator
from bson import ObjectId
import re


class PyObjectId(str):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        if isinstance(v, str):
            try:
                ObjectId(v)
                return v
            except Exception:
                raise ValueError("Invalid ObjectId")
        raise ValueError("Invalid ObjectId")


# ==================== Base Models ====================

class UserBase(BaseModel):
    """Base user model with common fields"""
    email: EmailStr
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: str = "UTC"
    language: str = "en"
    notification_settings: Dict[str, bool] = Field(default_factory=lambda: {
        "email_notifications": True,
        "push_notifications": True,
        "marketing_emails": False,
        "analytics_reports": True
    })


class UserCreate(UserBase):
    """User registration model with password validation"""
    password: str = Field(..., min_length=8, max_length=100)
    
    @validator("password")
    def validate_password_strength(cls, v):
        """Validate password strength requirements"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v
    
    @validator("username")
    def validate_username(cls, v):
        if v:
            if not re.match(r"^[a-zA-Z0-9_]+$", v):
                raise ValueError("Username can only contain letters, numbers, and underscores")
            if len(v) < 3:
                raise ValueError("Username must be at least 3 characters long")
        return v


class UserUpdate(BaseModel):
    """User update model - all fields optional for partial updates"""
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    notification_settings: Optional[Dict[str, bool]] = None
    
    @validator("username")
    def validate_username(cls, v):
        if v is not None and v:
            if not re.match(r"^[a-zA-Z0-9_]+$", v):
                raise ValueError("Username can only contain letters, numbers, and underscores")
            if len(v) < 3:
                raise ValueError("Username must be at least 3 characters long")
        return v


class UserResponse(UserBase):
    """User response model for API responses"""
    id: str = Field(..., alias="_id")
    is_active: bool = True
    is_verified: bool = False
    role: str = "user"
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    connected_accounts: List[str] = Field(default_factory=list)
    subscription_plan: str = "free"
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class UserInDB(UserBase):
    """User model as stored in database"""
    id: str = Field(..., alias="_id")
    password_hash: str
    is_active: bool = True
    is_verified: bool = False
    role: str = "user"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    connected_accounts: List[str] = Field(default_factory=list)
    subscription_plan: str = "free"
    oauth_provider: Optional[str] = None
    oauth_id: Optional[str] = None
    password_reset_token: Optional[str] = None
    password_reset_expires: Optional[datetime] = None
    verification_token: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class UserProfileResponse(BaseModel):
    """Extended user profile response"""
    id: str
    email: str
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: str
    language: str
    is_verified: bool
    role: str
    created_at: datetime
    last_login: Optional[datetime] = None
    connected_accounts_count: int = 0
    total_posts: int = 0
    scheduled_posts: int = 0
    published_posts: int = 0


# ==================== Social Account Models ====================

class SocialAccountBase(BaseModel):
    """Base social account model"""
    platform: str
    platform_user_id: Optional[str] = None
    platform_username: Optional[str] = None
    platform_profile_url: Optional[str] = None
    platform_avatar_url: Optional[str] = None
    permissions: List[str] = Field(default_factory=list)
    is_active: bool = True
    auto_refresh: bool = True


class SocialAccountCreate(SocialAccountBase):
    """Social account creation model"""
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None


class SocialAccountUpdate(BaseModel):
    """Social account update model"""
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    platform_username: Optional[str] = None
    platform_profile_url: Optional[str] = None
    platform_avatar_url: Optional[str] = None
    is_active: Optional[bool] = None
    auto_refresh: Optional[bool] = None


class SocialAccountResponse(SocialAccountBase):
    """Social account response model"""
    id: str
    user_id: str
    connected_at: datetime
    last_used: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    needs_reauth: bool = False
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class SocialAccountInDB(SocialAccountBase):
    """Social account model as stored in database"""
    id: str = Field(..., alias="_id")
    user_id: str
    access_token_encrypted: str
    refresh_token_encrypted: Optional[str] = None
    token_metadata: Dict[str, Any] = Field(default_factory=dict)
    connected_at: datetime = Field(default_factory=datetime.utcnow)
    last_used: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}


# ==================== Post Models ====================

class PostBase(BaseModel):
    """Base post model"""
    content: str = Field(..., min_length=1, max_length=5000)
    platforms: List[str]
    media_urls: List[str] = Field(default_factory=list)
    media_type: Optional[str] = None  # image, video, carousel
    scheduled_time: Optional[datetime] = None
    status: str = "draft"


class PostCreate(PostBase):
    """Post creation model"""
    is_draft: bool = False
    enable_analytics: bool = True
    enable_engagement: bool = False
    
    @validator("platforms")
    def validate_platforms(cls, v):
        valid_platforms = ["facebook", "instagram", "linkedin", "x", "youtube", "whatsapp"]
        for platform in v:
            if platform not in valid_platforms:
                raise ValueError(f"Invalid platform: {platform}")
        return v


class PostUpdate(BaseModel):
    """Post update model"""
    content: Optional[str] = None
    media_urls: Optional[List[str]] = None
    media_type: Optional[str] = None
    scheduled_time: Optional[datetime] = None


class PostResponse(PostBase):
    """Post response model"""
    id: str
    user_id: str
    is_draft: bool
    enable_analytics: bool
    enable_engagement: bool
    status: str
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    publish_results: List[Dict[str, Any]] = Field(default_factory=list)
    analytics: Optional[Dict[str, Any]] = None
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class PostScheduleRequest(BaseModel):
    """Request model for scheduling a post"""
    content: str = Field(..., min_length=1, max_length=5000)
    platforms: List[str]
    media_urls: List[str] = Field(default_factory=list)
    scheduled_time: datetime
    enable_analytics: bool = True
    enable_engagement: bool = False
    
    @validator("scheduled_time")
    def validate_future_time(cls, v):
        if v <= datetime.utcnow():
            raise ValueError("Scheduled time must be in the future")
        return v
    
    @validator("platforms")
    def validate_platforms(cls, v):
        valid_platforms = ["facebook", "instagram", "linkedin", "x", "youtube", "whatsapp"]
        for platform in v:
            if platform not in valid_platforms:
                raise ValueError(f"Invalid platform: {platform}")
        return v


class BulkPostCreate(BaseModel):
    """Bulk post creation model"""
    posts: List[PostCreate]
    
    @validator("posts")
    def validate_posts_count(cls, v):
        if len(v) > 10:
            raise ValueError("Maximum 10 posts can be created at once")
        return v


# ==================== Analytics Models ====================

class AnalyticsBase(BaseModel):
    """Base analytics model"""
    platform: str
    post_id: Optional[str] = None


class AnalyticsResponse(AnalyticsBase):
    """Analytics response model"""
    id: str
    user_id: str
    likes: int = 0
    comments: int = 0
    shares: int = 0
    impressions: int = 0
    reach: int = 0
    engagements: int = 0
    clicks: int = 0
    collected_at: datetime
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class AnalyticsSummary(BaseModel):
    """Analytics summary model"""
    total_posts: int = 0
    total_likes: int = 0
    total_comments: int = 0
    total_shares: int = 0
    total_impressions: int = 0
    total_reach: int = 0
    avg_engagement_rate: float = 0.0
    top_performing_post: Optional[Dict[str, Any]] = None
    platform_breakdown: Dict[str, Dict[str, int]] = Field(default_factory=dict)


class AnalyticsTimeRange(BaseModel):
    """Analytics time range model"""
    start_date: datetime
    end_date: datetime
    interval: str = "day"  # day, week, month


# ==================== Automation Models ====================

class AutomationRuleBase(BaseModel):
    """Base automation rule model"""
    name: str
    platform: str
    trigger: str  # new_follower, new_comment, mention, scheduled
    action: str  # auto_reply, auto_like, auto_follow_back, publish_post
    is_active: bool = True
    priority: int = 5  # 1-10


class AutomationRuleCreate(AutomationRuleBase):
    """Automation rule creation model"""
    conditions: Dict[str, Any] = Field(default_factory=dict)
    message_template: Optional[str] = None
    schedule: Optional[str] = None
    target_users: List[str] = Field(default_factory=list)
    exclude_users: List[str] = Field(default_factory=list)
    
    @validator("trigger")
    def validate_trigger(cls, v):
        valid_triggers = [
            "new_follower", "new_comment", "mention", "scheduled",
            "new_post", "new_like", "new_share", "new_message"
        ]
        if v not in valid_triggers:
            raise ValueError(f"Invalid trigger: {v}. Valid: {valid_triggers}")
        return v
    
    @validator("action")
    def validate_action(cls, v):
        valid_actions = [
            "auto_reply", "auto_like", "auto_follow_back", "publish_post",
            "send_dm", "send_email", "webhook", "schedule_post"
        ]
        if v not in valid_actions:
            raise ValueError(f"Invalid action: {v}. Valid: {valid_actions}")
        return v


class AutomationRuleUpdate(BaseModel):
    """Automation rule update model"""
    name: Optional[str] = None
    is_active: Optional[bool] = None
    priority: Optional[int] = None
    conditions: Optional[Dict[str, Any]] = None
    message_template: Optional[str] = None
    schedule: Optional[str] = None


class AutomationRuleResponse(AutomationRuleBase):
    """Automation rule response model"""
    id: str
    user_id: str
    conditions: Dict[str, Any]
    message_template: Optional[str] = None
    schedule: Optional[str] = None
    target_users: List[str]
    exclude_users: List[str]
    execution_count: int = 0
    last_executed: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class AutomationExecution(BaseModel):
    """Automation execution log"""
    rule_id: str
    user_id: str
    platform: str
    trigger: str
    action: str
    status: str  # success, failed, skipped
    input_data: Dict[str, Any] = Field(default_factory=dict)
    output_data: Dict[str, Any] = Field(default_factory=dict)
    error_message: Optional[str] = None
    executed_at: datetime = Field(default_factory=datetime.utcnow)


# ==================== Webhook Models ====================

class WebhookBase(BaseModel):
    """Base webhook model"""
    name: str
    platform: str
    url: str
    events: List[str]
    is_active: bool = True
    secret: Optional[str] = None


class WebhookCreate(WebhookBase):
    """Webhook creation model"""
    @validator("url")
    def validate_url(cls, v):
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class WebhookResponse(WebhookBase):
    """Webhook response model"""
    id: str
    user_id: str
    created_at: datetime
    last_triggered: Optional[datetime] = None
    total_triggered: int = 0
    failure_count: int = 0
    
    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


# ==================== Utility Functions ====================

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [
                    serialize_doc(v) if isinstance(v, (dict, ObjectId)) 
                    else v.isoformat() if isinstance(v, datetime)
                    else v 
                    for v in value
                ]
            else:
                result[key] = value
        return result
    
    return doc
