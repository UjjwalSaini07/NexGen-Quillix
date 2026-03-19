"""
Cloudinary Service for NexGen-Quillix Automation Platform
Handles image uploads to Cloudinary with expiration support
"""
import os
import logging
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import base64
import hashlib
import time

from app.config import settings

logger = logging.getLogger(__name__)


class CloudinaryService:
    """Service for uploading images to Cloudinary"""
    
    def __init__(self):
        self.cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME") or getattr(settings, 'CLOUDINARY_CLOUD_NAME', None)
        self.api_key = os.environ.get("CLOUDINARY_API_KEY") or getattr(settings, 'CLOUDINARY_API_KEY', None)
        self.api_secret = os.environ.get("CLOUDINARY_API_SECRET") or getattr(settings, 'CLOUDINARY_API_SECRET', None)
        self.upload_preset = os.environ.get("CLOUDINARY_UPLOAD_PRESET") or getattr(settings, 'CLOUDINARY_UPLOAD_PRESET', None)
        self.upload_folder = getattr(settings, 'CLOUDINARY_UPLOAD_FOLDER', 'Quillix-Engine')
        
        self.is_configured = bool(self.cloud_name and self.api_key and self.api_secret)
        
        if self.is_configured:
            try:
                import cloudinary
                cloudinary.config(
                    cloud_name=self.cloud_name,
                    api_key=self.api_key,
                    api_secret=self.api_secret,
                    secure=True
                )
                logger.info("Cloudinary service initialized")
            except ImportError:
                logger.warning("Cloudinary package not installed")
                self.is_configured = False
            except Exception as e:
                logger.error(f"Failed to initialize Cloudinary: {e}")
                self.is_configured = False
        else:
            logger.warning("Cloudinary credentials not configured")
    
    def is_available(self) -> bool:
        """Check if Cloudinary service is available"""
        return self.is_configured
    
    def upload_image(
        self,
        image_data: str,
        public_id: Optional[str] = None,
        expiration_hours: int = 1,
        tags: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Upload an image to Cloudinary
        
        Args:
            image_data: Base64 encoded image data (data:image/xxx;base64,xxxxx) or URL
            public_id: Optional custom public ID for the image
            expiration_hours: Hours until the image should be deleted (for temp uploads)
            tags: Optional list of tags for the image
            
        Returns:
            Dictionary with upload result including secure_url, public_id, etc.
        """
        if not self.is_configured:
            logger.error("Cloudinary not configured")
            return {
                "success": False,
                "error": "Cloudinary not configured"
            }
        
        try:
            import cloudinary
            from cloudinary import uploader
            
            # Generate unique public_id if not provided
            if not public_id:
                timestamp = int(time.time())
                unique_id = str(uuid.uuid4())[:8]
                public_id = f"{self.upload_folder}/quillix_{timestamp}_{unique_id}"
            
            # Extract base64 data if it's a data URL
            if image_data.startswith('data:'):
                # It's a data URL, extract the base64 part
                header, encoded = image_data.split(',', 1)
                # Extract format from header (e.g., "data:image/png;base64")
                img_format = header.split(';')[0].split('/')[-1]
                file_name = f"quillix_image.{img_format}"
                
                upload_params = {
                    "public_id": public_id,
                    "folder": self.upload_folder,
                    "resource_type": "image",
                    "tags": tags or ["quillix", "generated"],
                }
                
                # Add expiration if requested (using incoming transformation)
                if expiration_hours > 0:
                    # Note: Cloudinary doesn't have built-in auto-delete
                    # We store the expiration time in tags or metadata
                    expiration_time = (datetime.utcnow() + timedelta(hours=expiration_hours)).isoformat()
                    upload_params["tags"] = (tags or ["quillix", "generated"]) + [f"expires:{expiration_time}"]
                
                # Upload from base64 data
                result = uploader.upload(
                    f"data:image/{img_format};base64,{encoded}",
                    **upload_params
                )
            else:
                # It's a URL
                upload_params = {
                    "public_id": public_id,
                    "folder": self.upload_folder,
                    "resource_type": "image",
                    "tags": tags or ["quillix", "generated"],
                }
                
                if expiration_hours > 0:
                    expiration_time = (datetime.utcnow() + timedelta(hours=expiration_hours)).isoformat()
                    upload_params["tags"] = (tags or ["quillix", "generated"]) + [f"expires:{expiration_time}"]
                
                result = uploader.upload(image_url, **upload_params)
            
            logger.info(f"Image uploaded to Cloudinary: {result.get('secure_url')}")
            
            return {
                "success": True,
                "url": result.get("secure_url"),
                "public_id": result.get("public_id"),
                "format": result.get("format"),
                "width": result.get("width"),
                "height": result.get("height"),
                "expires_at": (datetime.utcnow() + timedelta(hours=expiration_hours)).isoformat() if expiration_hours > 0 else None
            }
            
        except Exception as e:
            logger.error(f"Cloudinary upload error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def upload_base64_image(
        self,
        base64_data: str,
        scheduled_time: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Upload a base64 image to Cloudinary with smart expiration
        
        Args:
            base64_data: Base64 encoded image data
            scheduled_time: ISO format datetime string for scheduled post
                           If provided, image expires at scheduled_time + 1 hour
            
        Returns:
            Dictionary with upload result
        """
        # Calculate expiration
        if scheduled_time:
            try:
                # Parse scheduled time
                sched_dt = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00'))
                # Add 1 hour to scheduled time
                expires_at = sched_dt + timedelta(hours=1)
                # Calculate hours from now until expiration
                now = datetime.utcnow()
                expiration_hours = max(1, int((expires_at - now).total_seconds() / 3600))
            except Exception as e:
                logger.warning(f"Could not parse scheduled_time: {e}, using default 1 hour")
                expiration_hours = 1
        else:
            # Default: 1 hour for immediate posts
            expiration_hours = 1
        
        return self.upload_image(
            image_data=base64_data,
            expiration_hours=expiration_hours,
            tags=["quillix", "generated", "temp"]
        )
    
    def delete_image(self, public_id: str) -> Dict[str, Any]:
        """
        Delete an image from Cloudinary
        
        Args:
            public_id: The public ID of the image to delete
            
        Returns:
            Dictionary with deletion result
        """
        if not self.is_configured:
            return {"success": False, "error": "Cloudinary not configured"}
        
        try:
            from cloudinary import uploader
            result = uploader.destroy(public_id)
            return {
                "success": result.get("result") == "ok",
                "result": result
            }
        except Exception as e:
            logger.error(f"Cloudinary delete error: {e}")
            return {"success": False, "error": str(e)}
    
    def generate_signed_url(self, public_id: str, expiration_seconds: int = 3600) -> str:
        """
        Generate a signed URL that expires
        
        Args:
            public_id: The public ID of the image
            expiration_seconds: Seconds until URL expires
            
        Returns:
            Signed URL string
        """
        if not self.is_configured:
            return ""
        
        try:
            import cloudinary
            from cloudinary import utils
            
            signature = utils.api_sign_request(
                {
                    "public_id": public_id,
                    "timestamp": int(time.time())
                },
                self.api_secret
            )
            
            url = cloudinary.utils.cloudinary_url(
                public_id,
                signature=signature,
                timestamp=int(time.time()),
                sign=True
            )[0]
            
            return url
        except Exception as e:
            logger.error(f"Error generating signed URL: {e}")
            return ""


# Singleton instance
cloudinary_service = CloudinaryService()
