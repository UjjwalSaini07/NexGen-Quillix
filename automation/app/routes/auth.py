"""
Enhanced Authentication Routes for NexGen-Quillix Automation Platform
Complete authentication system with JWT, OAuth 2.0, and token management
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import JSONResponse
from typing import Optional, List
from datetime import datetime, timedelta
from bson import ObjectId
import secrets
import logging
import re

from app.database import db
from app.config import settings
from app.core.security import (
    hash_password, 
    verify_password, 
    create_access_token, 
    create_refresh_token,
    verify_refresh_token,
    revoke_refresh_token,
    revoke_all_user_tokens,
    get_oauth_url,
    generate_oauth_state,
    verify_oauth_state,
    get_current_user,
    OAuthProvider,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    UserUpdate,
    UserProfileResponse
)
from app.models import serialize_doc

logger = logging.getLogger(__name__)

router = APIRouter()


# ==================== User Registration & Login ====================

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """
    Register a new user with email and password.
    
    Validates:
    - Email format
    - Password strength (min 8 chars, uppercase, lowercase, digit, special char)
    - Username format (alphanumeric + underscore)
    - Email uniqueness
    """
    try:
        # Check if email already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if username is taken (if provided)
        if user_data.username:
            existing_username = await db.users.find_one({"username": user_data.username})
            if existing_username:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Create user document
        user_doc = {
            "email": user_data.email,
            "password_hash": hash_password(user_data.password),
            "full_name": user_data.full_name,
            "username": user_data.username,
            "avatar_url": user_data.avatar_url,
            "bio": user_data.bio,
            "timezone": user_data.timezone,
            "language": user_data.language,
            "notification_settings": user_data.notification_settings,
            "is_active": True,
            "is_verified": False,
            "role": "user",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "connected_accounts": [],
            "subscription_plan": "free",
            "last_login": None,
            "oauth_provider": None,
            "oauth_id": None
        }
        
        # Insert user
        result = await db.users.insert_one(user_doc)
        user_doc["_id"] = str(result.inserted_id)
        user_doc["id"] = str(result.inserted_id)  # For UserResponse
        
        logger.info(f"New user registered: {user_data.email}")
        
        return UserResponse(**serialize_doc(user_doc))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, request: Request):
    """
    Authenticate user and return JWT tokens.
    
    Returns:
    - access_token: JWT token for API authentication
    - refresh_token: JWT token for refreshing access token
    - expires_in: Token expiration in seconds
    """
    try:
        # Find user by email
        user = await db.users.find_one({"email": credentials.email})
        
        if not user:
            # Use generic message to prevent user enumeration
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if not verify_password(credentials.password, user.get("password_hash", "")):
            # Log failed login attempt
            logger.warning(f"Failed login attempt for email: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled. Contact support."
            )
        
        # Prepare user data for token
        user_data = {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "role": user.get("role", "user")
        }
        
        # Generate tokens
        access_token = create_access_token(user_data)
        refresh_token, token_id = create_refresh_token(user_data)
        
        # Store refresh token in database
        await db.refresh_tokens.insert_one({
            "user_id": str(user["_id"]),
            "token_id": token_id,
            "email": user["email"],
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_EXPIRATION_DAYS),
            "is_revoked": False,
            "ip_address": request.client.host if request.client else None,
            "user_agent": request.headers.get("user-agent")
        })
        
        # Update last login
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        logger.info(f"User logged in: {credentials.email}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.JWT_EXPIRATION_HOURS * 3600
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str = Query(...)):
    """
    Refresh access token using refresh token.
    
    Invalidate old refresh token and issue new tokens.
    """
    try:
        # Verify refresh token
        user = await verify_refresh_token(refresh_token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        # Decode token to get token_id for revocation
        from jose import jwt
        payload = jwt.decode(
            refresh_token, 
            settings.JWT_SECRET, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        token_id = payload.get("jti")
        
        # Revoke old refresh token
        await revoke_refresh_token(token_id, str(user["_id"]))
        
        # Prepare user data for new tokens
        user_data = {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "role": user.get("role", "user")
        }
        
        # Generate new tokens
        new_access_token = create_access_token(user_data)
        new_refresh_token, new_token_id = create_refresh_token(user_data)
        
        # Store new refresh token
        await db.refresh_tokens.insert_one({
            "user_id": str(user["_id"]),
            "token_id": new_token_id,
            "email": user["email"],
            "created_at": datetime.utcnow(),
            "expires_at": datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_EXPIRATION_DAYS),
            "is_revoked": False
        })
        
        logger.info(f"Token refreshed for user: {user['email']}")
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=settings.JWT_EXPIRATION_HOURS * 3600
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user),
    refresh_token: Optional[str] = Query(None)
):
    """
    Logout user by revoking refresh tokens.
    
    Optionally revoke a specific refresh token or all tokens.
    """
    try:
        user_id = str(current_user["_id"])
        
        if refresh_token:
            # Revoke specific token
            from jose import jwt
            payload = jwt.decode(
                refresh_token, 
                settings.JWT_SECRET, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            token_id = payload.get("jti")
            await revoke_refresh_token(token_id, user_id)
            logger.info(f"Specific token revoked for user: {current_user['email']}")
        else:
            # Revoke all tokens
            await revoke_all_user_tokens(user_id)
            logger.info(f"All tokens revoked for user: {current_user['email']}")
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )


# ==================== OAuth Endpoints ====================

@router.get("/oauth/{provider}")
async def oauth_init(
    provider: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Initiate OAuth flow for a social platform.
    
    Returns OAuth authorization URL to redirect user to.
    """
    if provider not in OAuthProvider.get_all():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported OAuth provider. Available: {OAuthProvider.get_all()}"
        )
    
    # Generate state with user info
    state = generate_oauth_state(str(current_user["_id"]), provider)
    
    # Get OAuth URL
    oauth_url = get_oauth_url(provider, state)
    
    return {
        "provider": provider,
        "oauth_url": oauth_url,
        "state": state,
        "message": f"Redirect user to {provider} OAuth URL"
    }


@router.get("/oauth/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str,
    state: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Handle OAuth callback from social platform.
    
    Exchange authorization code for access token and store account.
    """
    import requests
    from app.config import settings
    
    try:
        # Verify state
        state_data = verify_oauth_state(state)
        
        if state_data.get("provider") != provider:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OAuth state mismatch"
            )
        
        user_id = str(current_user["_id"])
        access_token = None
        refresh_token = None
        expires_in = None
        
        # Exchange code for token based on provider
        if provider == "facebook":
            token_url = "https://graph.facebook.com/v19.0/oauth/access_token"
            params = {
                "client_id": settings.FACEBOOK_CLIENT_ID,
                "client_secret": settings.FACEBOOK_CLIENT_SECRET,
                "redirect_uri": settings.FACEBOOK_REDIRECT_URI,
                "code": code
            }
            response = requests.get(token_url, params=params, timeout=30)
            token_data = response.json()
            
            if "access_token" in token_data:
                access_token = token_data["access_token"]
                expires_in = token_data.get("expires_in", 5184000)  # Default 60 days
                
                # Exchange short-lived token for long-lived token
                exchange_url = "https://graph.facebook.com/v19.0/oauth/access_token"
                exchange_params = {
                    "grant_type": "fb_exchange_token",
                    "client_id": settings.FACEBOOK_CLIENT_ID,
                    "client_secret": settings.FACEBOOK_CLIENT_SECRET,
                    "fb_exchange_token": access_token
                }
                exchange_response = requests.get(exchange_url, params=exchange_params, timeout=30)
                exchange_data = exchange_response.json()
                
                if "access_token" in exchange_data:
                    access_token = exchange_data["access_token"]
                    expires_in = exchange_data.get("expires_in", 5184000)
                
                # Get user info
                user_info_url = f"https://graph.facebook.com/v19.0/me"
                user_params = {"access_token": access_token, "fields": "id,name,email"}
                user_response = requests.get(user_info_url, params=user_params, timeout=30)
                user_info = user_response.json()
                
                # Store account in database
                from app.database import db
                from datetime import datetime, timedelta
                
                expires_at = datetime.utcnow() + timedelta(seconds=expires_in) if expires_in else None
                
                # Upsert social account
                await db.social_accounts.update_one(
                    {"user_id": user_id, "platform": "facebook"},
                    {
                        "$set": {
                            "access_token_encrypted": access_token,
                            "refresh_token_encrypted": None,  # Long-lived token doesn't need refresh
                            "platform_user_id": user_info.get("id"),
                            "platform_username": user_info.get("name"),
                            "expires_at": expires_at,
                            "is_active": True,
                            "connected_at": datetime.utcnow(),
                            "permissions": settings.FACEBOOK_SCOPES.split(",")
                        }
                    },
                    upsert=True
                )
                
                logger.info(f"Facebook account connected for user {user_id}")
                
                return {
                    "message": "Successfully connected Facebook account",
                    "provider": provider,
                    "platform_user_id": user_info.get("id"),
                    "platform_username": user_info.get("name"),
                    "token_expires_in": expires_in
                }
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Token exchange failed: {token_data.get('error', 'Unknown error')}"
                )
        
        # Other providers can be added here
        else:
            return {
                "message": f"OAuth callback for {provider} - implementation pending",
                "provider": provider,
                "note": "Token exchange not yet implemented for this provider"
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OAuth callback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth callback processing failed"
        )


# ==================== User Profile ====================

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user's profile"""
    return UserResponse(**serialize_doc(current_user))


@router.get("/me/profile", response_model=UserProfileResponse)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get extended user profile with statistics"""
    user_id = str(current_user["_id"])
    
    # Get connected accounts count
    connected_count = await db.social_accounts.count_documents({
        "user_id": user_id,
        "is_active": True
    })
    
    # Get post counts
    total_posts = await db.posts.count_documents({"user_id": user_id})
    scheduled_posts = await db.posts.count_documents({
        "user_id": user_id,
        "status": "scheduled"
    })
    published_posts = await db.posts.count_documents({
        "user_id": user_id,
        "status": "published"
    })
    
    return UserProfileResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user.get("full_name"),
        username=current_user.get("username"),
        avatar_url=current_user.get("avatar_url"),
        bio=current_user.get("bio"),
        timezone=current_user.get("timezone", "UTC"),
        language=current_user.get("language", "en"),
        is_verified=current_user.get("is_verified", False),
        role=current_user.get("role", "user"),
        created_at=current_user["created_at"],
        last_login=current_user.get("last_login"),
        connected_accounts_count=connected_count,
        total_posts=total_posts,
        scheduled_posts=scheduled_posts,
        published_posts=published_posts
    )


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile"""
    try:
        # Check username uniqueness if provided
        if user_data.username and user_data.username != current_user.get("username"):
            existing = await db.users.find_one({"username": user_data.username})
            if existing and str(existing["_id"]) != str(current_user["_id"]):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
        
        # Build update document
        update_data = {k: v for k, v in user_data.model_dump().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        # Update user
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
        updated_user["id"] = str(updated_user["_id"])
        
        logger.info(f"User profile updated: {current_user['email']}")
        
        return UserResponse(**serialize_doc(updated_user))
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )


@router.delete("/me")
async def delete_user_account(
    current_user: dict = Depends(get_current_user),
    password: str = Query(...)
):
    """Delete user account (requires password confirmation)"""
    try:
        # Verify password
        user = await db.users.find_one({"_id": ObjectId(current_user["_id"])})
        
        if not verify_password(password, user.get("password_hash", "")):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid password"
            )
        
        # Soft delete - mark as inactive instead of deleting
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {
                "$set": {
                    "is_active": False,
                    "deleted_at": datetime.utcnow(),
                    "email": f"deleted_{current_user['_id']}_{current_user['email']}"
                }
            }
        )
        
        # Revoke all tokens
        await revoke_all_user_tokens(str(current_user["_id"]))
        
        # Delete connected accounts
        await db.social_accounts.delete_many({"user_id": str(current_user["_id"])})
        
        logger.info(f"User account deleted: {current_user['email']}")
        
        return {"message": "Account deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Account deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account deletion failed"
        )


# ==================== Password Management ====================

@router.post("/password/reset-request")
async def request_password_reset(email: str = Query(...)):
    """Request password reset email"""
    try:
        user = await db.users.find_one({"email": email})
        
        if not user:
            # Don't reveal if email exists
            return {"message": "If the email exists, a reset link has been sent"}
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        reset_expires = datetime.utcnow() + timedelta(hours=24)
        
        # Store reset token
        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "password_reset_token": reset_token,
                    "password_reset_expires": reset_expires
                }
            }
        )
        
        # In production, send email with reset link
        reset_link = f"{settings.CORS_ORIGINS[0]}/reset-password?token={reset_token}"
        logger.info(f"Password reset link for {email}: {reset_link}")
        
        return {"message": "If the email exists, a reset link has been sent"}
        
    except Exception as e:
        logger.error(f"Password reset request error: {e}")
        return {"message": "If the email exists, a reset link has been sent"}


@router.post("/password/reset-confirm")
async def confirm_password_reset(token: str = Query(...), new_password: str = Query(...)):
    """Confirm password reset with new password"""
    try:
        # Find user with valid reset token
        user = await db.users.find_one({
            "password_reset_token": token,
            "password_reset_expires": {"$gt": datetime.utcnow()}
        })
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Update password
        await db.users.update_one(
            {"_id": user["_id"]},
            {
                "$set": {
                    "password_hash": hash_password(new_password),
                    "password_reset_token": None,
                    "password_reset_expires": None,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Revoke all existing tokens
        await revoke_all_user_tokens(str(user["_id"]))
        
        logger.info(f"Password reset successful for user: {user['email']}")
        
        return {"message": "Password reset successful"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset confirm error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )


# ==================== Token Validation ====================

@router.get("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)):
    """Verify if current access token is valid"""
    return {
        "valid": True,
        "user_id": str(current_user["_id"]),
        "email": current_user["email"]
    }


# ==================== Health Check ====================

@router.get("/health")
async def auth_health():
    """Authentication service health check"""
    return {
        "status": "healthy",
        "service": "authentication"
    }
