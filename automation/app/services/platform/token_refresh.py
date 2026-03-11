"""
Enhanced Token Refresh Service for NexGen-Quillix Automation Platform
Handles automatic token refresh for all social platforms
"""
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import logging
import requests
from app.database import db
from app.config import settings
from app.services.platform.base import PlatformError, TokenExpiredError

logger = logging.getLogger(__name__)


class TokenRefreshService:
    """Service for refreshing OAuth tokens for all platforms"""
    
    def __init__(self):
        self.platform_configs = {
            "facebook": {
                "token_url": "https://graph.facebook.com/v19.0/oauth/access_token",
                "client_id": settings.FACEBOOK_CLIENT_ID,
                "client_secret": settings.FACEBOOK_CLIENT_SECRET
            },
            "instagram": {
                "token_url": "https://api.instagram.com/oauth/access_token",
                "client_id": settings.INSTAGRAM_CLIENT_ID,
                "client_secret": settings.INSTAGRAM_CLIENT_SECRET
            },
            "linkedin": {
                "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
                "client_id": settings.LINKEDIN_CLIENT_ID,
                "client_secret": settings.LINKEDIN_CLIENT_SECRET
            },
            "x": {
                "token_url": "https://api.twitter.com/2/oauth2/token",
                "client_id": settings.X_CLIENT_ID,
                "client_secret": settings.X_CLIENT_SECRET
            },
            "youtube": {
                "token_url": "https://oauth2.googleapis.com/token",
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET
            },
            "whatsapp": {
                "token_url": "https://graph.facebook.com/v19.0/oauth/access_token",
                "client_id": settings.FACEBOOK_CLIENT_ID,
                "client_secret": settings.FACEBOOK_CLIENT_SECRET
            }
        }
    
    async def refresh_token(self, account: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Refresh token for a social account.
        
        Args:
            account: Social account document from database
            
        Returns:
            Updated token data or None if refresh failed
        """
        platform = account.get("platform")
        refresh_token = account.get("refresh_token_encrypted")
        
        if not refresh_token:
            logger.warning(f"No refresh token for {platform} account")
            return None
        
        config = self.platform_configs.get(platform)
        if not config:
            logger.warning(f"No token refresh config for {platform}")
            return None
        
        try:
            if platform in ["facebook", "instagram", "whatsapp"]:
                result = await self._refresh_meta_token(config, refresh_token)
            elif platform == "linkedin":
                result = await self._refresh_linkedin_token(config, refresh_token)
            elif platform == "x":
                result = await self._refresh_x_token(config, refresh_token)
            elif platform == "youtube":
                result = await self._refresh_google_token(config, refresh_token)
            else:
                logger.warning(f"Token refresh not supported for {platform}")
                return None
            
            # Update account with new tokens
            await self._update_account_tokens(account, result)
            
            logger.info(f"Successfully refreshed token for {platform}")
            return result
            
        except Exception as e:
            logger.error(f"Token refresh failed for {platform}: {e}")
            return None
    
    async def _refresh_meta_token(
        self, 
        config: Dict[str, Any], 
        refresh_token: str
    ) -> Dict[str, Any]:
        """Refresh token for Facebook/Instagram/WhatsApp"""
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": config["client_id"],
            "client_secret": config["client_secret"],
            "fb_exchange_token": refresh_token
        }
        
        response = requests.get(
            config["token_url"],
            params=params,
            timeout=30
        )
        
        if response.status_code >= 400:
            raise PlatformError("meta", f"Token refresh failed: {response.text}")
        
        result = response.json()
        
        return {
            "access_token": result["access_token"],
            "expires_in": result.get("expires_in", 5184000)
        }
    
    async def _refresh_linkedin_token(
        self,
        config: Dict[str, Any],
        refresh_token: str
    ) -> Dict[str, Any]:
        """Refresh token for LinkedIn"""
        # LinkedIn doesn't support token refresh - user must reconnect
        raise PlatformError(
            "linkedin",
            "LinkedIn tokens cannot be refreshed. Please reconnect your account."
        )
    
    async def _refresh_x_token(
        self,
        config: Dict[str, Any],
        refresh_token: str
    ) -> Dict[str, Any]:
        """Refresh token for X (Twitter)"""
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": config["client_id"],
            "client_secret": config["client_secret"]
        }
        
        response = requests.post(
            config["token_url"],
            data=data,
            timeout=30
        )
        
        if response.status_code >= 400:
            raise PlatformError("x", f"Token refresh failed: {response.text}")
        
        result = response.json()
        
        return {
            "access_token": result.get("access_token"),
            "refresh_token": result.get("refresh_token", refresh_token),
            "expires_in": result.get("expires_in", 7200)
        }
    
    async def _refresh_google_token(
        self,
        config: Dict[str, Any],
        refresh_token: str
    ) -> Dict[str, Any]:
        """Refresh token for YouTube (Google)"""
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": config["client_id"],
            "client_secret": config["client_secret"]
        }
        
        response = requests.post(
            config["token_url"],
            data=data,
            timeout=30
        )
        
        if response.status_code >= 400:
            raise PlatformError("youtube", f"Token refresh failed: {response.text}")
        
        result = response.json()
        
        return {
            "access_token": result["access_token"],
            "expires_in": result.get("expires_in", 3600)
        }
    
    async def _update_account_tokens(
        self, 
        account: Dict[str, Any], 
        token_data: Dict[str, Any]
    ):
        """Update account with new tokens"""
        user_id = account.get("user_id")
        platform = account.get("platform")
        
        update_data = {
            "access_token_encrypted": token_data.get("access_token"),
            "updated_at": datetime.utcnow()
        }
        
        if token_data.get("refresh_token"):
            update_data["refresh_token_encrypted"] = token_data["refresh_token"]
        
        if token_data.get("expires_in"):
            update_data["expires_at"] = datetime.utcnow() + timedelta(
                seconds=token_data["expires_in"]
            )
        
        await db.social_accounts.update_one(
            {"user_id": user_id, "platform": platform},
            {"$set": update_data}
        )
    
    async def check_and_refresh_expired_tokens(self, user_id: str):
        """
        Check and refresh all expired tokens for a user.
        
        Args:
            user_id: User ID
            
        Returns:
            List of refreshed accounts
        """
        now = datetime.utcnow()
        
        # Find accounts with expired or soon-to-expire tokens
        accounts = await db.social_accounts.find({
            "user_id": user_id,
            "is_active": True,
            "auto_refresh": True,
            "$or": [
                {"expires_at": {"$lt": now}},
                {"expires_at": {"$lt": now + timedelta(hours=1)}}
            ]
        }).to_list(length=None)
        
        refreshed = []
        for account in accounts:
            result = await self.refresh_token(account)
            if result:
                refreshed.append(account["platform"])
        
        return refreshed
    
    async def revoke_token(self, account: Dict[str, Any]) -> bool:
        """
        Revoke a token (logout from platform).
        
        Args:
            account: Social account document
            
        Returns:
            True if successful
        """
        platform = account.get("platform")
        access_token = account.get("access_token_encrypted")
        
        if not access_token:
            return False
        
        # Most platforms don't have revocation endpoints
        # We'll just mark the account as inactive
        await db.social_accounts.update_one(
            {"_id": account["_id"]},
            {"$set": {"is_active": False, "revoked_at": datetime.utcnow()}}
        )
        
        logger.info(f"Token revoked for {platform}")
        return True


# Singleton instance
token_refresh_service = TokenRefreshService()
