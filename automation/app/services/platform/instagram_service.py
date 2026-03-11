"""
Enhanced Instagram Service for NexGen-Quillix Automation Platform
Complete Instagram API integration with error handling
"""
from typing import Dict, Any, Optional, List
import requests
import logging
from app.services.platform.base import BasePlatformService, PlatformError, TokenExpiredError, RateLimitError
from app.config import settings

logger = logging.getLogger(__name__)


class InstagramService(BasePlatformService):
    """Instagram Platform Service (via Meta Graph API)"""
    
    PLATFORM_NAME = "instagram"
    API_VERSION = "v19.0"
    BASE_URL = f"https://graph.facebook.com/{API_VERSION}"
    
    def __init__(self, access_token: str, ig_user_id: Optional[str] = None):
        super().__init__(access_token, ig_user_id=ig_user_id)
        self.ig_user_id = ig_user_id or self.extra_params.get("ig_user_id")
    
    def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make API request to Instagram Graph API"""
        url = f"{self.BASE_URL}/{endpoint}"
        
        if params is None:
            params = {}
        params["access_token"] = self.access_token
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, params=params, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, params=params, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, params=params, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            result = response.json()
            
            if "error" in result:
                error = result["error"]
                error_code = error.get("code")
                error_msg = error.get("message", "Unknown error")
                
                if error_code == 190:
                    raise TokenExpiredError(self.PLATFORM_NAME)
                elif error_code == 4:
                    raise RateLimitError(self.PLATFORM_NAME)
                else:
                    raise PlatformError(self.PLATFORM_NAME, error_msg, error)
            
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Instagram API request failed: {e}")
            raise PlatformError(self.PLATFORM_NAME, f"Request failed: {str(e)}")
    
    def _get_ig_user_id(self) -> str:
        """Get Instagram business account ID"""
        if self.ig_user_id:
            return self.ig_user_id
        
        # Get IG user from connected Facebook page
        params = {
            "fields": "instagram_business_account"
        }
        result = self._make_request("GET", "me/accounts", params=params)
        
        accounts = result.get("data", [])
        if accounts and "instagram_business_account" in accounts[0]:
            self.ig_user_id = accounts[0]["instagram_business_account"]["id"]
            return self.ig_user_id
        
        raise PlatformError(self.PLATFORM_NAME, "No Instagram business account found")
    
    def publish(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publish a post to Instagram.
        
        Args:
            post_data: Dictionary containing:
                - content: Post caption
                - media_urls: List of image/video URLs
                - media_type: Type of media (image/video)
                
        Returns:
            Dict with post_id and platform_url
        """
        content = post_data.get("content", "")
        media_urls = post_data.get("media_urls", [])
        media_type = post_data.get("media_type", "image")
        
        if not media_urls:
            raise PlatformError(self.PLATFORM_NAME, "Media URL is required for Instagram")
        
        ig_user_id = self._get_ig_user_id()
        
        # Upload media container
        media_id = self._upload_media(media_urls[0], media_type, content)
        
        # Publish the media
        result = self._make_request(
            "POST", 
            f"{ig_user_id}/media_publish",
            data={"creation_id": media_id}
        )
        
        post_id = result.get("id")
        
        return {
            "success": True,
            "post_id": post_id,
            "platform_url": f"https://www.instagram.com/p/{post_id}" if post_id else None,
            "raw_response": result
        }
    
    def _upload_media(
        self, 
        media_url: str, 
        media_type: str = "image",
        caption: str = ""
    ) -> str:
        """Upload media container to Instagram"""
        ig_user_id = self._get_ig_user_id()
        
        if media_type == "video":
            payload = {
                "video_url": media_url,
                "caption": caption,
                "media_type": "VIDEO"
            }
        else:
            payload = {
                "image_url": media_url,
                "caption": caption
            }
        
        result = self._make_request("POST", f"{ig_user_id}/media", data=payload)
        
        return result.get("id")
    
    def delete_post(self, post_id: str) -> bool:
        """Delete an Instagram post"""
        result = self._make_request("DELETE", post_id)
        return result.get("success", False)
    
    def get_post(self, post_id: str) -> Dict[str, Any]:
        """Get an Instagram post"""
        fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count"
        result = self._make_request("GET", post_id, params={"fields": fields})
        return result
    
    def like_post(self, post_id: str) -> Dict[str, Any]:
        """Like an Instagram post"""
        result = self._make_request("POST", f"{post_id}/likes")
        return {"success": True, "result": result}
    
    def comment_post(self, post_id: str, message: str) -> Dict[str, Any]:
        """Comment on an Instagram post"""
        result = self._make_request("POST", f"{post_id}/comments", data={"text": message})
        return {
            "success": True,
            "comment_id": result.get("id"),
            "raw_response": result
        }
    
    def get_comments(self, post_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get comments on a post"""
        params = {
            "fields": "id,text,from,timestamp,like_count",
            "limit": limit
        }
        result = self._make_request("GET", f"{post_id}/comments", params=params)
        return result.get("data", [])
    
    def get_analytics(self, post_id: str) -> Dict[str, Any]:
        """Get analytics for a post"""
        fields = "id,like_count,comments_count,share_count,saved_count,reach,impressions"
        result = self._make_request("GET", post_id, params={"fields": fields})
        
        return {
            "likes": result.get("like_count", 0),
            "comments": result.get("comments_count", 0),
            "shares": result.get("share_count", 0),
            "saves": result.get("saved_count", 0),
            "reach": result.get("reach", 0),
            "impressions": result.get("impressions", 0)
        }
    
    def get_profile(self) -> Dict[str, Any]:
        """Get Instagram profile"""
        ig_user_id = self._get_ig_user_id()
        fields = "id,username,followers_count,follows_count,media_count,biography,profile_picture_url"
        result = self._make_request("GET", ig_user_id, params={"fields": fields})
        return result
    
    def get_media(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get Instagram media"""
        ig_user_id = self._get_ig_user_id()
        fields = "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count"
        params = {"fields": fields, "limit": limit}
        result = self._make_request("GET", f"{ig_user_id}/media", params=params)
        return result.get("data", [])
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh Instagram access token (via Meta)"""
        # Instagram uses Meta's token system
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": settings.INSTAGRAM_CLIENT_ID,
            "client_secret": settings.INSTAGRAM_CLIENT_SECRET,
            "fb_exchange_token": refresh_token
        }
        
        result = requests.get(
            f"{self.BASE_URL}/oauth/access_token",
            params=params,
            timeout=30
        ).json()
        
        if "access_token" in result:
            return {
                "access_token": result["access_token"],
                "expires_in": result.get("expires_in", 5184000)
            }
        
        raise PlatformError(self.PLATFORM_NAME, "Token refresh failed")
    
    def validate_connection(self) -> bool:
        """Validate Instagram connection"""
        try:
            profile = self.get_profile()
            return "id" in profile
        except Exception:
            return False
