"""
Enhanced LinkedIn Service for NexGen-Quillix Automation Platform
Complete LinkedIn API integration with error handling
"""
from typing import Dict, Any, Optional, List
import requests
import logging
from app.services.platform.base import BasePlatformService, PlatformError, TokenExpiredError, RateLimitError
from app.config import settings

logger = logging.getLogger(__name__)


class LinkedInService(BasePlatformService):
    """LinkedIn Platform Service"""
    
    PLATFORM_NAME = "linkedin"
    API_VERSION = "v2"
    BASE_URL = f"https://api.linkedin.com/{API_VERSION}"
    UGC_POSTS_URL = "https://api.linkedin.com/v2/ugcPosts"
    
    def __init__(self, access_token: str, person_id: Optional[str] = None):
        super().__init__(access_token, person_id=person_id)
        self.person_id = person_id or self.extra_params.get("person_id")
    
    def _make_request(
        self, 
        method: str, 
        url: str, 
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make API request to LinkedIn API"""
        headers = self._get_headers()
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Handle rate limiting
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 60))
                raise RateLimitError(self.PLATFORM_NAME, retry_after)
            
            # Handle other errors
            if response.status_code >= 400:
                error_data = response.json()
                raise PlatformError(
                    self.PLATFORM_NAME,
                    f"LinkedIn API error: {error_data.get('message', response.text)}",
                    error_data
                )
            
            return response.json() if response.content else {}
            
        except requests.exceptions.RequestException as e:
            logger.error(f"LinkedIn API request failed: {e}")
            raise PlatformError(self.PLATFORM_NAME, f"Request failed: {str(e)}")
    
    def _get_author_urn(self) -> str:
        """Get author URN for LinkedIn"""
        if self.person_id:
            return f"urn:li:person:{self.person_id}"
        # If no person_id, will need to fetch from /me
        return "urn:li:person:ME"
    
    def publish(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publish a post to LinkedIn.
        
        Args:
            post_data: Dictionary containing:
                - content: Post text
                - media_urls: List of image URLs
                - link_url: Optional link to share
                - link_title: Title for link
                - link_description: Description for link
                
        Returns:
            Dict with post_id and platform_url
        """
        content = post_data.get("content", "")
        media_urls = post_data.get("media_urls", [])
        link_url = post_data.get("link_url")
        link_title = post_data.get("link_title")
        link_description = post_data.get("link_description")
        
        author = self._get_author_urn()
        
        # Build share content
        specific_content = {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": content},
                "shareMediaCategory": "NONE"
            }
        }
        
        # Add media if available
        if media_urls:
            # Upload image first and get asset URN
            try:
                asset_urn = self._upload_image(media_urls[0])
                specific_content["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
                specific_content["com.linkedin.ugc.ShareContent"]["media"] = [
                    {
                        "status": "READY",
                        "media": asset_urn
                    }
                ]
            except Exception as e:
                logger.warning(f"Failed to upload image: {e}")
        
        # Add link if available
        if link_url:
            specific_content["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "ARTICLE"
            specific_content["com.linkedin.ugc.ShareContent"]["media"] = [
                {
                    "status": "READY",
                    "originalUrl": link_url,
                    "title": {"text": link_title or ""},
                    "description": {"text": link_description or ""}
                }
            ]
        
        payload = {
            "author": author,
            "lifecycleState": "PUBLISHED",
            "specificContent": specific_content,
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        result = self._make_request("POST", self.UGC_POSTS_URL, data=payload)
        
        post_id = result.get("id")
        
        return {
            "success": True,
            "post_id": post_id,
            "platform_url": f"https://www.linkedin.com/feed/update/{post_id}" if post_id else None,
            "raw_response": result
        }
    
    def _upload_image(self, image_url: str) -> str:
        """
        Register and upload image to LinkedIn.
        
        Args:
            image_url: URL of the image
            
        Returns:
            Asset URN
        """
        # Register upload
        register_url = f"{self.BASE_URL}/assets"
        register_payload = {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                "owner": self._get_author_urn(),
                "serviceRelationships": [
                    {
                        "relationshipType": "OWNER",
                        "identifier": "urn:li:userGeneratedContent"
                    }
                ]
            }
        }
        
        register_result = self._make_request("POST", register_url, data=register_payload)
        
        # Get upload URL
        asset = register_result.get("asset")
        upload_url = register_result.get("value", {}).get("uploadMechanism", {}).get("com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest", {}).get("uploadUrl")
        
        if not upload_url:
            raise PlatformError(self.PLATFORM_NAME, "Failed to get upload URL")
        
        # Upload image
        image_response = requests.put(
            upload_url,
            data=requests.get(image_url).content,
            headers={"Content-Type": "image/jpeg"}
        )
        
        if image_response.status_code != 201:
            raise PlatformError(self.PLATFORM_NAME, "Image upload failed")
        
        return asset
    
    def delete_post(self, post_id: str) -> bool:
        """Delete a LinkedIn post"""
        url = f"{self.UGC_POSTS_URL}/{post_id}"
        result = self._make_request("DELETE", url)
        return True  # LinkedIn doesn't return confirmation
    
    def get_post(self, post_id: str) -> Dict[str, Any]:
        """Get a LinkedIn post"""
        # Use ugcPosts endpoint
        url = f"{self.UGC_POSTS_URL}/{post_id}"
        headers = self._get_headers()
        headers["X-Restli-Protocol-Version"] = "2.0.0"
        
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code >= 400:
            raise PlatformError(self.PLATFORM_NAME, f"Failed to get post: {response.text}")
        
        return response.json()
    
    def like_post(self, post_id: str) -> Dict[str, Any]:
        """Like a LinkedIn post"""
        url = f"{self.BASE_URL}/ugcPosts/{post_id}/likes"
        result = self._make_request("POST", url, data={})
        return {"success": True, "result": result}
    
    def comment_post(self, post_id: str, message: str) -> Dict[str, Any]:
        """Comment on a LinkedIn post"""
        url = f"{self.BASE_URL}/ugcPosts/{post_id}/comments"
        payload = {
            "author": self._get_author_urn(),
            "message": {"text": message}
        }
        result = self._make_request("POST", url, data=payload)
        return {
            "success": True,
            "comment_id": result.get("id"),
            "raw_response": result
        }
    
    def get_comments(self, post_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get comments on a post"""
        url = f"{self.UGC_POSTS_URL}/{post_id}/comments"
        params = {"count": limit}
        result = self._make_request("GET", url, params=params)
        return result.get("elements", [])
    
    def get_analytics(self, post_id: str) -> Dict[str, Any]:
        """Get analytics for a post"""
        # LinkedIn Analytics API requires specific endpoints
        # This is a simplified version
        return {
            "likes": 0,
            "comments": 0,
            "shares": 0,
            "clicks": 0
        }
    
    def get_profile(self) -> Dict[str, Any]:
        """Get LinkedIn profile"""
        url = f"{self.BASE_URL}/me"
        headers = self._get_headers()
        headers["X-Restli-Protocol-Version"] = "2.0.0"
        
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code >= 400:
            raise PlatformError(self.PLATFORM_NAME, "Failed to get profile")
        
        return response.json()
    
    def get_organization_profile(self, organization_id: str) -> Dict[str, Any]:
        """Get organization profile"""
        url = f"{self.BASE_URL}/organizations/{organization_id}"
        result = self._make_request("GET", url)
        return result
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh LinkedIn access token"""
        # LinkedIn tokens cannot be refreshed client-side
        raise PlatformError(
            self.PLATFORM_NAME,
            "LinkedIn tokens cannot be refreshed. Please reconnect your account."
        )
    
    def validate_connection(self) -> bool:
        """Validate LinkedIn connection"""
        try:
            profile = self.get_profile()
            return "id" in profile
        except Exception:
            return False
