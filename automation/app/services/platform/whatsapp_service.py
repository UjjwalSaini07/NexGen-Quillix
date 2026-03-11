"""
Enhanced WhatsApp Service for NexGen-Quillix Automation Platform
Complete WhatsApp Business API integration with error handling
"""
from typing import Dict, Any, Optional, List
import requests
import logging
from app.services.platform.base import BasePlatformService, PlatformError, TokenExpiredError, RateLimitError
from app.config import settings

logger = logging.getLogger(__name__)


class WhatsAppService(BasePlatformService):
    """WhatsApp Business Platform Service"""
    
    PLATFORM_NAME = "whatsapp"
    API_VERSION = "v19.0"
    BASE_URL = f"https://graph.facebook.com/{API_VERSION}"
    
    def __init__(self, access_token: str, phone_number_id: Optional[str] = None):
        super().__init__(access_token, phone_number_id=phone_number_id)
        self.phone_number_id = phone_number_id or settings.WHATSAPP_PHONE_NUMBER_ID
    
    def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Make API request to WhatsApp Business API"""
        url = f"{self.BASE_URL}/{endpoint}"
        
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            # Handle rate limiting
            if response.status_code == 429:
                raise RateLimitError(self.PLATFORM_NAME)
            
            # Handle errors
            if response.status_code >= 400:
                error_data = response.json()
                error = error_data.get("error", {})
                raise PlatformError(
                    self.PLATFORM_NAME,
                    error.get("message", error_data.get("error", "Unknown error")),
                    error
                )
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"WhatsApp API request failed: {e}")
            raise PlatformError(self.PLATFORM_NAME, f"Request failed: {str(e)}")
    
    def publish(self, post_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Send a WhatsApp message.
        
        Note: WhatsApp doesn't support "posts" like other platforms.
        This sends a message template or text to a recipient.
        
        Args:
            post_data: Dictionary containing:
                - recipient: Phone number to send to
                - content: Message text
                - template_name: Optional template name
                - template_components: Optional template components
                
        Returns:
            Dict with message_id and status
        """
        recipient = post_data.get("recipient")
        content = post_data.get("content", "")
        template_name = post_data.get("template_name")
        
        if not recipient:
            raise PlatformError(self.PLATFORM_NAME, "Recipient phone number is required")
        
        if not self.phone_number_id:
            raise PlatformError(self.PLATFORM_NAME, "Phone number ID not configured")
        
        # Build message payload
        if template_name:
            # Send template message
            payload = {
                "messaging_product": "whatsapp",
                "to": recipient,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": "en_US"},
                    "components": post_data.get("template_components", [])
                }
            }
        else:
            # Send text message
            payload = {
                "messaging_product": "whatsapp",
                "to": recipient,
                "type": "text",
                "text": {"body": content}
            }
        
        result = self._make_request("POST", f"{self.phone_number_id}/messages", data=payload)
        
        messages = result.get("messages", [])
        message_id = messages[0].get("id") if messages else None
        
        return {
            "success": True,
            "post_id": message_id,
            "platform_url": None,
            "raw_response": result
        }
    
    def send_message(
        self, 
        to: str, 
        message: str,
        media_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send a WhatsApp message to a recipient.
        
        Args:
            to: Recipient phone number
            message: Message text
            media_url: Optional media URL to send
            
        Returns:
            Dict with message_id
        """
        if not self.phone_number_id:
            raise PlatformError(self.PLATFORM_NAME, "Phone number ID not configured")
        
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "text",
            "text": {"body": message}
        }
        
        # Add media if provided
        if media_url:
            payload = {
                "messaging_product": "whatsapp",
                "to": to,
                "type": "image",
                "image": {"link": media_url}
            }
        
        result = self._make_request("POST", f"{self.phone_number_id}/messages", data=payload)
        
        messages = result.get("messages", [])
        message_id = messages[0].get("id") if messages else None
        
        return {
            "success": True,
            "message_id": message_id,
            "raw_response": result
        }
    
    def send_template(
        self,
        to: str,
        template_name: str,
        language: str = "en_US",
        components: Optional[List[Dict]] = None
    ) -> Dict[str, Any]:
        """Send a WhatsApp template message"""
        if not self.phone_number_id:
            raise PlatformError(self.PLATFORM_NAME, "Phone number ID not configured")
        
        payload = {
            "messaging_product": "whatsapp",
            "to": to,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": language},
                "components": components or []
            }
        }
        
        result = self._make_request("POST", f"{self.phone_number_id}/messages", data=payload)
        
        messages = result.get("messages", [])
        message_id = messages[0].get("id") if messages else None
        
        return {
            "success": True,
            "message_id": message_id,
            "raw_response": result
        }
    
    def delete_post(self, message_id: str) -> bool:
        """Delete a message (for template messages only)"""
        # WhatsApp doesn't support message deletion
        return False
    
    def get_post(self, message_id: str) -> Dict[str, Any]:
        """Get message status"""
        result = self._make_request("GET", message_id)
        return result
    
    def mark_message_read(self, message_id: str) -> Dict[str, Any]:
        """Mark a message as read"""
        payload = {
            "messaging_product": "whatsapp",
            "status": "read",
            "message_id": message_id
        }
        
        result = self._make_request("POST", f"{self.phone_number_id}/messages", data=payload)
        return {"success": True, "result": result}
    
    def get_profile(self) -> Dict[str, Any]:
        """Get WhatsApp Business account profile"""
        if not self.phone_number_id:
            raise PlatformError(self.PLATFORM_NAME, "Phone number ID not configured")
        
        result = self._make_request("GET", f"{self.phone_number_id}")
        return result
    
    def get_templates(self) -> List[Dict[str, Any]]:
        """Get message templates"""
        business_id = settings.WHATSAPP_BUSINESS_ACCOUNT_ID
        
        if not business_id:
            raise PlatformError(self.PLATFORM_NAME, "Business account ID not configured")
        
        result = self._make_request(
            "GET", 
            f"{business_id}/message_templates",
            params={"access_token": self.access_token}
        )
        
        return result.get("data", [])
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh WhatsApp access token"""
        # WhatsApp uses Meta's token system
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
                "expires_in": result.get("expires_in", 5184000)
            }
        
        raise PlatformError(self.PLATFORM_NAME, "Token refresh failed")
    
    def validate_connection(self) -> bool:
        """Validate WhatsApp connection"""
        try:
            profile = self.get_profile()
            return "id" in profile
        except Exception:
            return False
