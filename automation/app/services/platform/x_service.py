"""
Enhanced X (Twitter) Service for NexGen-Quillix Automation Platform
Complete X/Twitter API v2 integration with error handling
"""
from typing import Dict, Any, Optional, List
import requests
import logging
from app.services.platform.base import BasePlatformService, PlatformError, TokenExpiredError, RateLimitError

logger = logging.getLogger(__name__)


class XService(BasePlatformService):
    """X (Twitter) Platform Service"""
    
    PLATFORM_NAME = "x"
    API_VERSION = "2"
    BASE_URL = f"https://api.twitter.com/{API_VERSION}"
    
    def __init__(self, access_token: str, user_id: Optional[str] = None):
        super().__init__(access_token, user_id=user_id)
        self.user_id = user_id or self.extra_params.get("user_id")
    
    def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make API request to X API v2"""
        url = f"{self.BASE_URL}/{endpoint}"
        headers = self._get_headers({
            "Authorization": f"Bearer {self.access_token}"
        })
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Handle rate limiting
            if response.status_code == 429:
                retry_after = int(response.headers.get("X-RateLimit-Reset", 60))
                raise RateLimitError(self.PLATFORM_NAME, retry_after)
            
            # Handle errors
            if response.status_code >= 400:
                error_data = response.json()
                error = error_data.get("errors", [{}])[0] if error_data.get("errors") else {}
                raise PlatformError(
                    self.PLATFORM_NAME,
                    error.get("detail", error_data.get("title", response.text)),
                    error_data
                )
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"X API request failed: {e}")
            raise PlatformError(self.PLATFORM_NAME, f"Request failed: {str(e)}")
    
    def publish(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publish a tweet.
        
        Args:
            post_data: Dictionary containing:
                - content: Tweet text
                - media_urls: List of media URLs
                
        Returns:
            Dict with post_id and platform_url
        """
        content = post_data.get("content", "")
        
        # Validate length
        if len(content) > 280:
            content = content[:277] + "..."
        
        payload = {"text": content}
        
        # Add media if available
        media_urls = post_data.get("media_urls", [])
        if media_urls:
            try:
                media_id = self._upload_media(media_urls[0])
                payload["media"] = {"media_ids": [media_id]}
            except Exception as e:
                logger.warning(f"Failed to upload media: {e}")
        
        result = self._make_request("POST", "tweets", data=payload)
        
        tweet_data = result.get("data", {})
        tweet_id = tweet_data.get("id")
        
        return {
            "success": True,
            "post_id": tweet_id,
            "platform_url": f"https://twitter.com/i/status/{tweet_id}" if tweet_id else None,
            "raw_response": result
        }
    
    def _upload_media(self, media_url: str) -> str:
        """Upload media to X"""
        # First, get the media from URL
        media_response = requests.get(media_url, timeout=30)
        media_content = media_response.content
        
        # Upload to X
        url = "https://upload.twitter.com/1.1/media/upload.json"
        headers = {"Authorization": f"Bearer {self.access_token}"}
        
        files = {"media": media_content}
        data = {"media_type": "image/jpeg"}
        
        response = requests.post(url, headers=headers, files=files, data=data, timeout=60)
        
        if response.status_code >= 400:
            raise PlatformError(self.PLATFORM_NAME, f"Media upload failed: {response.text}")
        
        return response.json().get("media_id_string")
    
    def delete_post(self, tweet_id: str) -> bool:
        """Delete a tweet"""
        result = self._make_request("DELETE", f"tweets/{tweet_id}")
        return result.get("data", {}).get("deleted", False)
    
    def get_post(self, tweet_id: str) -> Dict[str, Any]:
        """Get a tweet"""
        params = {"tweet.fields": "created_at,public_metrics,author_id"}
        result = self._make_request("GET", f"tweets/{tweet_id}", params=params)
        return result.get("data", {})
    
    def like_post(self, tweet_id: str) -> Dict[str, Any]:
        """Like a tweet"""
        if not self.user_id:
            raise PlatformError(self.PLATFORM_NAME, "User ID required for liking")
        
        payload = {"tweet_id": tweet_id}
        result = self._make_request("POST", f"users/{self.user_id}/likes", data=payload)
        return {"success": True, "result": result}
    
    def unlike_post(self, tweet_id: str) -> Dict[str, Any]:
        """Unlike a tweet"""
        if not self.user_id:
            raise PlatformError(self.PLATFORM_NAME, "User ID required")
        
        result = self._make_request("DELETE", f"users/{self.user_id}/likes/{tweet_id}")
        return {"success": True, "result": result}
    
    def retweet(self, tweet_id: str) -> Dict[str, Any]:
        """Retweet a tweet"""
        if not self.user_id:
            raise PlatformError(self.PLATFORM_NAME, "User ID required for retweeting")
        
        payload = {"tweet_id": tweet_id}
        result = self._make_request("POST", f"users/{self.user_id}/retweets", data=payload)
        return {
            "success": True,
            "result": result
        }
    
    def comment_post(self, tweet_id: str, message: str) -> Dict[str, Any]:
        """Reply to a tweet (quote tweet)"""
        payload = {
            "text": message,
            "reply": {"in_reply_to_tweet_id": tweet_id}
        }
        result = self._make_request("POST", "tweets", data=payload)
        
        tweet_data = result.get("data", {})
        
        return {
            "success": True,
            "post_id": tweet_data.get("id"),
            "raw_response": result
        }
    
    def get_mentions(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get mentions of the user"""
        if not self.user_id:
            raise PlatformError(self.PLATFORM_NAME, "User ID required")
        
        params = {
            "max_results": limit,
            "tweet.fields": "created_at,public_metrics"
        }
        result = self._make_request("GET", f"users/{self.user_id}/mentions", params=params)
        return result.get("data", [])
    
    def get_timeline(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user's timeline"""
        if not self.user_id:
            raise PlatformError(self.PLATFORM_NAME, "User ID required")
        
        params = {
            "max_results": limit,
            "tweet.fields": "created_at,public_metrics"
        }
        result = self._make_request("GET", f"users/{self.user_id}/timelines/reverse_chronological", params=params)
        return result.get("data", [])
    
    def get_analytics(self, tweet_id: str) -> Dict[str, Any]:
        """Get analytics for a tweet"""
        params = {"tweet.fields": "public_metrics"}
        result = self._make_request("GET", f"tweets/{tweet_id}", params=params)
        
        metrics = result.get("data", {}).get("public_metrics", {})
        
        return {
            "likes": metrics.get("like_count", 0),
            "retweets": metrics.get("retweet_count", 0),
            "replies": metrics.get("reply_count", 0),
            "quotes": metrics.get("quote_count", 0),
            "impressions": metrics.get("impression_count", 0)
        }
    
    def get_profile(self) -> Dict[str, Any]:
        """Get user profile"""
        if self.user_id:
            params = {"user.fields": "public_metrics,description,profile_image_url"}
            result = self._make_request("GET", f"users/{self.user_id}", params=params)
        else:
            # Get current user
            result = self._make_request("GET", "users/me", params={"user.fields": "public_metrics"})
        
        return result.get("data", {})
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh X access token"""
        # X OAuth 2.0 token refresh
        url = "https://api.twitter.com/2/oauth2/token"
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": self.extra_params.get("client_id"),
            "client_secret": self.extra_params.get("client_secret")
        }
        
        response = requests.post(url, data=data, timeout=30)
        
        if response.status_code >= 400:
            raise PlatformError(self.PLATFORM_NAME, "Token refresh failed")
        
        result = response.json()
        
        return {
            "access_token": result.get("access_token"),
            "refresh_token": result.get("refresh_token"),
            "expires_in": result.get("expires_in", 7200)
        }
    
    def validate_connection(self) -> bool:
        """Validate X connection"""
        try:
            profile = self.get_profile()
            return "id" in profile
        except Exception:
            return False
