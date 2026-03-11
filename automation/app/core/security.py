"""
Enhanced Security Module for NexGen-Quillix Automation Platform
Complete authentication system with JWT, OAuth 2.0, and token management
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from jose import jwt
from jose.exceptions import JWTError, JWTClaimsError
import bcrypt
from bson import ObjectId
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field, field_validator
import secrets
import logging
import re

from app.config import settings
from app.database import db

logger = logging.getLogger(__name__)

# OAuth security scheme
security = HTTPBearer(auto_error=False)


# ==================== Pydantic Models ====================

class TokenData(BaseModel):
    """JWT token data structure"""
    user_id: str
    email: str
    exp: datetime
    iat: datetime
    token_type: str = "access"


class RefreshTokenData(BaseModel):
    """Refresh token data structure"""
    user_id: str
    email: str
    token_id: str
    exp: datetime


class UserCreate(BaseModel):
    """User registration model"""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)
    full_name: Optional[str] = None
    username: Optional[str] = Field(None, min_length=3, max_length=30)
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = "UTC"
    language: Optional[str] = "en"
    notification_settings: Optional[Dict[str, Any]] = None
    
    @field_validator("password")
    @staticmethod
    def validate_password_strength(cls, v):
        """Validate password strength"""
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v
    
    @field_validator("username")
    @staticmethod
    def validate_username(cls, v):
        if v:
            if not re.match(r"^[a-zA-Z0-9_]+$", v):
                raise ValueError("Username can only contain letters, numbers, and underscores")
        return v


class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response model (without sensitive data)"""
    id: str
    email: str
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None


class UserUpdate(BaseModel):
    """User update model"""
    full_name: Optional[str] = None
    username: Optional[str] = Field(None, min_length=3, max_length=30)
    avatar_url: Optional[str] = None
    
    @field_validator("username")
    @staticmethod
    def validate_username(cls, v):
        if v:
            if not re.match(r"^[a-zA-Z0-9_]+$", v):
                raise ValueError("Username can only contain letters, numbers, and underscores")
        return v


class UserProfileResponse(BaseModel):
    """User profile response model"""
    id: str
    email: str
    full_name: Optional[str] = None
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    """Token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class PasswordResetRequest(BaseModel):
    """Password reset request model"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation model"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=72)
    
    @field_validator("new_password")
    @staticmethod
    def validate_password_strength(cls, v):
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one digit")
        return v


class OAuthProvider(str):
    """Supported OAuth providers"""
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    GOOGLE = "google"
    LINKEDIN = "linkedin"
    X = "x"
    YOUTUBE = "youtube"
    WHATSAPP = "whatsapp"
    
    @classmethod
    def get_all(cls) -> List[str]:
        return [cls.FACEBOOK, cls.INSTAGRAM, cls.GOOGLE, cls.LINKEDIN, cls.X, cls.YOUTUBE, cls.WHATSAPP]


# ==================== Password Functions ====================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    # Truncate to 72 bytes (bcrypt limit)
    password_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    # Truncate to 72 bytes (bcrypt limit)
    password_bytes = plain_password.encode('utf-8')[:72]
    return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))


# ==================== Token Functions ====================

def create_access_token(user_data: Dict[str, Any]) -> str:
    """Create JWT access token"""
    to_encode = user_data.copy()
    
    # Set expiration
    expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "token_type": "access",
        "jti": secrets.token_urlsafe(16)  # JWT ID for token revocation
    })
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET, 
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(user_data: Dict[str, Any]) -> tuple[str, str]:
    """Create JWT refresh token and store it in database"""
    # Generate unique token ID
    token_id = secrets.token_urlsafe(16)
    
    to_encode = user_data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_EXPIRATION_DAYS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "token_type": "refresh",
        "jti": token_id
    })
    
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET, 
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt, token_id


def decode_token(token: str) -> TokenData:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        return TokenData(
            user_id=payload.get("user_id"),
            email=payload.get("email"),
            exp=datetime.fromtimestamp(payload.get("exp")),
            iat=datetime.fromtimestamp(payload.get("iat")),
            token_type=payload.get("token_type", "access")
        )
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise


async def verify_access_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verify and decode access token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        user_id: str = payload.get("user_id")
        email: str = payload.get("email")
        token_type: str = payload.get("token_type")
        
        if user_id is None or email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Get user from database
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Add id field for response models
        user["id"] = str(user["_id"])
        
        return user
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )


async def verify_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify refresh token and return user data"""
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        user_id: str = payload.get("user_id")
        email: str = payload.get("email")
        token_type: str = payload.get("token_type")
        jti: str = payload.get("jti")
        
        if token_type != "refresh" or not jti:
            return None
        
        # Check if token exists in database (not revoked)
        token_record = await db.refresh_tokens.find_one({
            "token_id": jti,
            "user_id": user_id,
            "is_revoked": False
        })
        
        if not token_record:
            return None
        
        # Check expiration
        exp = datetime.fromtimestamp(payload.get("exp"))
        if exp < datetime.utcnow():
            return None
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        return user
        
    except Exception as e:
        logger.error(f"Refresh token verification error: {e}")
        return None


async def revoke_refresh_token(token_id: str, user_id: str) -> bool:
    """Revoke a refresh token"""
    result = await db.refresh_tokens.update_one(
        {"token_id": token_id, "user_id": user_id},
        {"$set": {"is_revoked": True, "revoked_at": datetime.utcnow()}}
    )
    return result.modified_count > 0


async def revoke_all_user_tokens(user_id: str) -> bool:
    """Revoke all refresh tokens for a user"""
    result = await db.refresh_tokens.update_many(
        {"user_id": user_id, "is_revoked": False},
        {"$set": {"is_revoked": True, "revoked_at": datetime.utcnow()}}
    )
    return result.modified_count > 0


# ==================== OAuth Functions ====================

def get_oauth_url(provider: str, state: str) -> str:
    """Generate OAuth authorization URL for a provider"""
    
    if provider == OAuthProvider.FACEBOOK:
        params = {
            "client_id": settings.FACEBOOK_CLIENT_ID,
            "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
            "scope": settings.FACEBOOK_SCOPES,
            "state": state,
            "response_type": "code"
        }
        return f"https://www.facebook.com/v19.0/dialog/oauth?{_urlencode(params)}"
    
    elif provider == OAuthProvider.INSTAGRAM:
        params = {
            "client_id": settings.INSTAGRAM_CLIENT_ID,
            "redirect_uri": settings.INSTAGRAM_REDIRECT_URI,
            "scope": settings.INSTAGRAM_SCOPES,
            "state": state,
            "response_type": "code"
        }
        return f"https://api.instagram.com/oauth/authorize?{_urlencode(params)}"
    
    elif provider == OAuthProvider.GOOGLE:
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "scope": "openid email profile",
            "state": state,
            "response_type": "code",
            "access_type": "offline",
            "prompt": "consent"
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{_urlencode(params)}"
    
    elif provider == OAuthProvider.LINKEDIN:
        params = {
            "client_id": settings.LINKEDIN_CLIENT_ID,
            "redirect_uri": settings.LINKEDIN_REDIRECT_URI,
            "scope": settings.LINKEDIN_SCOPES,
            "state": state,
            "response_type": "code"
        }
        return f"https://www.linkedin.com/oauth/v2/authorization?{_urlencode(params)}"
    
    elif provider == OAuthProvider.X:
        params = {
            "client_id": settings.X_CLIENT_ID,
            "redirect_uri": settings.X_REDIRECT_URI,
            "scope": settings.X_SCOPES,
            "state": state,
            "response_type": "code",
            "code_challenge": "challenge",
            "code_challenge_method": "plain"
        }
        return f"https://twitter.com/i/oauth2/authorize?{_urlencode(params)}"
    
    elif provider == OAuthProvider.YOUTUBE:
        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "scope": settings.YOUTUBE_SCOPES,
            "state": state,
            "response_type": "code",
            "access_type": "offline"
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{_urlencode(params)}"
    
    elif provider == OAuthProvider.WHATSAPP:
        params = {
            "client_id": settings.FACEBOOK_CLIENT_ID,
            "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
            "scope": settings.WHATSAPP_SCOPES,
            "state": state,
            "response_type": "code"
        }
        return f"https://www.facebook.com/v19.0/dialog/oauth?{_urlencode(params)}"
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider: {provider}"
        )


def generate_oauth_state(user_id: str, provider: str) -> str:
    """Generate secure OAuth state parameter"""
    state_data = {
        "user_id": user_id,
        "provider": provider,
        "nonce": secrets.token_urlsafe(16),
        "exp": (datetime.utcnow() + timedelta(minutes=10)).timestamp()
    }
    return jwt.encode(state_data, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_oauth_state(state: str) -> Dict[str, Any]:
    """Verify and decode OAuth state parameter"""
    try:
        payload = jwt.decode(
            state, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OAuth state expired"
            )
        
        return payload
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth state"
        )


def _urlencode(params: Dict[str, str]) -> str:
    """Simple URL encoding helper"""
    return "&".join(f"{k}={v}" for k, v in params.items())


# ==================== Current User Dependency ====================

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """
    Dependency to get the current authenticated user.
    Returns user document from database.
    """
    return await verify_access_token(credentials)


async def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Dependency to ensure user is active"""
    if not current_user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


# ==================== Optional Authentication ====================

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """
    Dependency that returns user if authenticated, None otherwise.
    Useful for endpoints that support both authenticated and unauthenticated access.
    """
    if not credentials:
        return None
    
    try:
        return await verify_access_token(credentials)
    except HTTPException:
        return None
