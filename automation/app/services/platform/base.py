"""
Enhanced Base Platform Service for NexGen-Quillix Automation Platform
Abstract base class for all social platform integrations
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class PlatformError(Exception):
    """Base exception for platform-related errors"""
    def __init__(self, platform: str, message: str, details: Optional[Dict] = None):
        self.platform = platform
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class TokenExpiredError(PlatformError):
    """Raised when platform token has expired"""
    def __init__(self, platform: str):
        super().__init__(
            platform, 
            f"{platform} access token has expired",
            {"error_code": "TOKEN_EXPIRED"}
        )


class RateLimitError(PlatformError):
    """Raised when platform rate limit is exceeded"""
    def __init__(self, platform: str, retry_after: Optional[int] = None):
        super().__init__(
            platform,
            f"{platform} rate limit exceeded",
            {"retry_after": retry_after} if retry_after else {}
        )


class PlatformNotConnectedError(PlatformError):
    """Raised when platform account is not connected"""
    def __init__(self, platform: str):
        super().__init__(
            platform,
            f"{platform} account is not connected",
            {"error_code": "NOT_CONNECTED"}
        )


class BasePlatformService(ABC):
    """
    Abstract base class for all social platform services.
    
    Provides common functionality and defines the interface
    that all platform implementations must follow.
    """
    
    PLATFORM_NAME: str = "base"
    API_VERSION: str = "v1"
    BASE_URL: str = ""
    
    def __init__(self, access_token: str, **kwargs):
        """
        Initialize the platform service.
        
        Args:
            access_token: OAuth access token for the platform
            **kwargs: Additional platform-specific parameters
        """
        self.access_token = access_token
        self.extra_params = kwargs
        self.logger = logging.getLogger(f"{__name__}.{self.PLATFORM_NAME}")
    
    def _get_headers(self, extra_headers: Optional[Dict] = None) -> Dict[str, str]:
        """Get common headers for API requests"""
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        if extra_headers:
            headers.update(extra_headers)
        return headers
    
    def _make_error_message(self, response: Dict) -> str:
        """Extract error message from API response"""
        if isinstance(response, dict):
            return response.get("error", {}).get("message", str(response))
        return str(response)
    
    @abstractmethod
    def publish(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publish content to the platform.
        
        Args:
            post_data: Dictionary containing:
                - content: Post text content
                - media_urls: List of media URLs (optional)
                - media_type: Type of media (image, video, etc.)
                
        Returns:
            Dict containing:
                - success: Boolean
                - post_id: Platform-specific post ID
                - platform_url: URL to the published post
                - raw_response: Raw API response
        """
        pass
    
    @abstractmethod
    def delete_post(self, post_id: str) -> bool:
        """
        Delete a published post.
        
        Args:
            post_id: Platform-specific post ID
            
        Returns:
            True if successful
        """
        pass
    
    @abstractmethod
    def get_post(self, post_id: str) -> Dict[str, Any]:
        """
        Get a post by ID.
        
        Args:
            post_id: Platform-specific post ID
            
        Returns:
            Post data
        """
        pass
    
    def like_post(self, post_id: str) -> Dict[str, Any]:
        """Like a post (optional implementation)"""
        raise NotImplementedError(f"{self.PLATFORM_NAME} does not support liking posts")
    
    def unlike_post(self, post_id: str) -> Dict[str, Any]:
        """Unlike a post (optional implementation)"""
        raise NotImplementedError(f"{self.PLATFORM_NAME} does not support unliking posts")
    
    def comment_post(self, post_id: str, message: str) -> Dict[str, Any]:
        """Comment on a post (optional implementation)"""
        raise NotImplementedError(f"{self.PLATFORM_NAME} does not support commenting")
    
    def reply_to_comment(self, comment_id: str, message: str) -> Dict[str, Any]:
        """Reply to a comment (optional implementation)"""
        raise NotImplementedError(f"{self.PLATFORM_NAME} does not support replying to comments")
    
    def share_post(self, post_id: str, message: Optional[str] = None) -> Dict[str, Any]:
        """Share/retweet a post (optional implementation)"""
        raise NotImplementedError(f"{self.PLATFORM_NAME} does not support sharing posts")
    
    def get_comments(self, post_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get comments on a post (optional implementation)"""
        raise NotImplementedError(f"{self.PLATFORM_NAME} does not support getting comments")
    
    def get_analytics(self, post_id: str) -> Dict[str, Any]:
        """Get analytics for a post (optional implementation)"""
        raise NotImplementedError(f"{self.PLATFORM_NAME} does not support analytics")
    
    def get_profile(self) -> Dict[str, Any]:
        """Get user profile info (optional implementation)"""
        raise NotImplementedError(f"{self.PLATFORM_NAME} does not support profile retrieval")
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """
        Refresh the access token.
        
        Args:
            refresh_token: The refresh token
            
        Returns:
            Dict containing new access_token and optionally refresh_token
        """
        raise NotImplementedError(f"{self.PLATFORM_NAME} does not support token refresh")
    
    def validate_connection(self) -> bool:
        """
        Validate the connection by making a test API call.
        
        Returns:
            True if connection is valid
        """
        try:
            self.get_profile()
            return True
        except Exception as e:
            self.logger.warning(f"Connection validation failed: {e}")
            return False
    
    def format_post_content(self, content: str, max_length: Optional[int] = None) -> str:
        """
        Format post content for platform-specific requirements.
        
        Args:
            content: Raw content
            max_length: Maximum allowed length
            
        Returns:
            Formatted content
        """
        if max_length and len(content) > max_length:
            return content[:max_length - 3] + "..."
        return content
    
    def prepare_media(self, media_urls: List[str], media_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Prepare media for upload.
        
        Args:
            media_urls: List of media URLs
            media_type: Type of media
            
        Returns:
            Platform-specific media payload
        """
        return {"media_urls": media_urls}
    
    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} platform={self.PLATFORM_NAME}>"
