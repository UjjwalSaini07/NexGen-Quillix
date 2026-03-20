"""
Enhanced Facebook Service for NexGen-Quillix Automation Platform
Complete Facebook API integration with error handling
"""
from typing import Dict, Any, Optional, List
import requests
import logging
from app.services.platform.base import BasePlatformService, PlatformError, TokenExpiredError, RateLimitError
from app.config import settings

logger = logging.getLogger(__name__)


class FacebookService(BasePlatformService):
    """Facebook/Meta Platform Service"""
    
    PLATFORM_NAME = "facebook"
    API_VERSION = "v19.0"
    BASE_URL = f"https://graph.facebook.com/{API_VERSION}"
    
    def __init__(self, access_token: str, page_id: Optional[str] = None):
        super().__init__(access_token, page_id=page_id)
        self.page_id = page_id or self.extra_params.get("page_id")
    
    def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Make API request to Facebook Graph API with error handling.
        """
        url = f"{self.BASE_URL}/{endpoint}"
        
        # Always include access token
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
            
            # Check for errors
            if "error" in result:
                error = result["error"]
                error_code = error.get("code")
                error_msg = error.get("message", "Unknown error")
                
                # Handle specific error codes
                if error_code == 190:  # Token expired
                    raise TokenExpiredError(self.PLATFORM_NAME)
                elif error_code == 4:  # Rate limit
                    raise RateLimitError(self.PLATFORM_NAME)
                elif error_code in [200, 100]:  # Permission errors
                    raise PlatformError(
                        self.PLATFORM_NAME,
                        f"Permission denied: {error_msg}",
                        error
                    )
                else:
                    raise PlatformError(
                        self.PLATFORM_NAME,
                        f"API error: {error_msg}",
                        error
                    )
            
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Facebook API request failed: {e}")
            raise PlatformError(self.PLATFORM_NAME, f"Request failed: {str(e)}")
    
    def publish(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publish a post to Facebook.
        
        Args:
            post_data: Dictionary containing:
                - content: Post text
                - media_urls: List of image URLs
                - link_url: Optional link to share
                
        Returns:
            Dict with post_id and platform_url
        """
        content = post_data.get("content", "")
        media_urls = post_data.get("media_urls", [])
        link_url = post_data.get("link_url")
        
        # Determine the endpoint based on whether page_id is available
        # If page_id is provided, post to page; otherwise post to user's timeline
        if self.page_id:
            feed_endpoint = f"{self.page_id}/feed"
            platform_url_base = f"https://www.facebook.com/{self.page_id}/posts/"
        else:
            # Post to user's personal profile timeline
            feed_endpoint = "me/feed"
            platform_url_base = "https://www.facebook.com/"
        
        # Prepare post data
        post_payload = {"message": content}
        
        # Add media if available
        if media_urls:
            # For posts with images, we need to upload as media first
            if len(media_urls) == 1:
                # Single image - can include directly
                media_id = self._upload_media(media_urls[0], "image")
                post_payload["attached_media"] = [{"media_fbid": media_id}]
            else:
                # Multiple images - create media container
                attached_media = []
                for url in media_urls[:10]:  # Max 10 images
                    media_id = self._upload_media(url, "image")
                    attached_media.append({"media_fbid": media_id})
                post_payload["attached_media"] = attached_media
        
        # Add link if provided
        if link_url:
            post_payload["link"] = link_url
        
        # Make the post
        result = self._make_request("POST", feed_endpoint, data=post_payload)
        
        post_id = result.get("id")
        
        return {
            "success": True,
            "post_id": post_id,
            "platform_url": f"{platform_url_base}{post_id}" if post_id else None,
            "raw_response": result
        }
    
    def _upload_media(self, media_url: str, media_type: str = "image") -> str:
        """
        Upload media to Facebook.
        
        Args:
            media_url: URL of the media
            media_type: Type of media (image, video)
            
        Returns:
            Media ID
        """
        # Determine endpoint based on whether we have page_id
        if self.page_id:
            endpoint = f"{self.page_id}/assets" if media_type == "video" else f"{self.page_id}/photos"
        else:
            # For user profile, use me/photos endpoint
            endpoint = "me/photos"
        
        payload = {
            "url": media_url,
            "published": False  # Upload as unpublished for later use
        }
        
        if media_type == "image":
            payload["message"] = "Image for post"
        
        result = self._make_request("POST", endpoint, data=payload)
        
        return result.get("id")
    
    def delete_post(self, post_id: str) -> bool:
        """Delete a Facebook post"""
        result = self._make_request("DELETE", post_id)
        return result.get("success", False)
    
    def get_post(self, post_id: str) -> Dict[str, Any]:
        """Get a Facebook post"""
        fields = "id,message,created_time,type,story,from,shares,reactions.summary(true),comments.summary(true)"
        result = self._make_request("GET", post_id, params={"fields": fields})
        return result
    
    def like_post(self, post_id: str) -> Dict[str, Any]:
        """Like a post"""
        result = self._make_request("POST", f"{post_id}/reactions", params={"type": "LIKE"})
        return {"success": True, "result": result}
    
    def comment_post(self, post_id: str, message: str) -> Dict[str, Any]:
        """Comment on a post"""
        result = self._make_request("POST", f"{post_id}/comments", data={"message": message})
        return {
            "success": True,
            "comment_id": result.get("id"),
            "raw_response": result
        }
    
    def get_comments(self, post_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get comments on a post"""
        params = {
            "fields": "id,message,from,created_time,like_count",
            "limit": limit
        }
        result = self._make_request("GET", f"{post_id}/comments", params=params)
        return result.get("data", [])
    
    def get_analytics(self, post_id: str) -> Dict[str, Any]:
        """Get analytics for a post"""
        fields = "impressions,reach,engagements,clicks,share_count,reactions.summary(true),comments.summary(true)"
        result = self._make_request("GET", post_id, params={"fields": fields})
        
        return {
            "impressions": result.get("impressions", 0),
            "reach": result.get("reach", 0),
            "engagements": result.get("engagements", 0),
            "clicks": result.get("clicks", 0),
            "shares": result.get("share_count", 0),
            "likes": result.get("reactions", {}).get("summary", {}).get("total_count", 0),
            "comments": result.get("comments", {}).get("summary", {}).get("total_count", 0)
        }
    
    def get_profile(self) -> Dict[str, Any]:
        """Get Facebook page profile"""
        if not self.page_id:
            # Get user profile if no page
            fields = "id,name,email,picture"
            result = self._make_request("GET", "me", params={"fields": fields})
        else:
            fields = "id,name,fan_count,followers_count,picture"
            result = self._make_request("GET", self.page_id, params={"fields": fields})
        
        return result
    
    def get_pages(self) -> List[Dict[str, Any]]:
        """Get all pages managed by the user"""
        fields = "id,name,fan_count,followers_count,access_token"
        result = self._make_request("GET", "me/accounts", params={"fields": fields})
        return result.get("data", [])
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh Facebook access token"""
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": settings.FACEBOOK_CLIENT_ID,
            "client_secret": settings.FACEBOOK_CLIENT_SECRET,
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
                "expires_in": result.get("expires_in", 5184000)  # 60 days default
            }
        
        raise PlatformError(self.PLATFORM_NAME, "Token refresh failed")
    
    def validate_connection(self) -> bool:
        """Validate Facebook connection"""
        try:
            profile = self.get_profile()
            return "id" in profile
        except Exception:
            return False
