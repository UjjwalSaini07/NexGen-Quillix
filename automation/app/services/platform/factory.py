"""
Enhanced Platform Factory for NexGen-Quillix Automation Platform
Factory pattern for creating platform-specific service instances
"""
from typing import Dict, Any, Optional
from app.services.platform.base import BasePlatformService, PlatformNotConnectedError
import logging

logger = logging.getLogger(__name__)

# Import platform services
from app.services.platform.facebook_service import FacebookService
from app.services.platform.instagram_service import InstagramService
from app.services.platform.linkedin_service import LinkedInService
from app.services.platform.x_service import XService
from app.services.platform.youtube_service import YouTubeService
from app.services.platform.whatsapp_service import WhatsAppService


class PlatformFactory:
    """
    Factory class for creating platform-specific service instances.
    
    Supports lazy loading and caching of service instances.
    """
    
    # Platform service mapping
    _services: Dict[str, type] = {
        "facebook": FacebookService,
        "instagram": InstagramService,
        "linkedin": LinkedInService,
        "x": XService,
        "twitter": XService,  # Alias
        "youtube": YouTubeService,
        "whatsapp": WhatsAppService
    }
    
    # Service instance cache
    _cache: Dict[str, BasePlatformService] = {}
    
    # Supported platforms
    SUPPORTED_PLATFORMS = list(_services.keys())
    
    @classmethod
    def get_service(cls, platform: str, access_token: str, **kwargs) -> BasePlatformService:
        """
        Get a platform service instance.
        
        Args:
            platform: Platform name (facebook, instagram, linkedin, etc.)
            access_token: OAuth access token
            **kwargs: Additional platform-specific parameters
            
        Returns:
            Platform-specific service instance
            
        Raises:
            ValueError: If platform is not supported
        """
        platform = platform.lower()
        
        if platform not in cls._services:
            raise ValueError(
                f"Unsupported platform: {platform}. "
                f"Supported platforms: {cls.SUPPORTED_PLATFORMS}"
            )
        
        # Create service instance
        service_class = cls._services[platform]
        
        try:
            service = service_class(access_token, **kwargs)
            return service
        except Exception as e:
            logger.error(f"Error creating {platform} service: {e}")
            raise
    
    @classmethod
    def register_service(cls, platform: str, service_class: type):
        """
        Register a custom platform service.
        
        Args:
            platform: Platform name
            service_class: Service class (must inherit from BasePlatformService)
        """
        if not issubclass(service_class, BasePlatformService):
            raise ValueError("Service class must inherit from BasePlatformService")
        
        cls._services[platform.lower()] = service_class
        cls.SUPPORTED_PLATFORMS.append(platform.lower())
        logger.info(f"Registered custom service for platform: {platform}")
    
    @classmethod
    def is_supported(cls, platform: str) -> bool:
        """Check if a platform is supported"""
        return platform.lower() in cls._services
    
    @classmethod
    def get_supported_platforms(cls) -> list:
        """Get list of supported platforms"""
        return cls.SUPPORTED_PLATFORMS.copy()
    
    @classmethod
    def create_all_services(cls, accounts: list) -> Dict[str, BasePlatformService]:
        """
        Create service instances for multiple accounts.
        
        Args:
            accounts: List of account dictionaries with 'platform' and 'access_token' keys
            
        Returns:
            Dict mapping platform name to service instance
        """
        services = {}
        
        for account in accounts:
            platform = account.get("platform", "").lower()
            token = account.get("access_token_encrypted") or account.get("access_token")
            
            if platform and token and cls.is_supported(platform):
                try:
                    services[platform] = cls.get_service(platform, token)
                except Exception as e:
                    logger.error(f"Failed to create {platform} service: {e}")
        
        return services


class PlatformValidator:
    """Validates platform-specific constraints"""
    
    # Platform character limits
    CHARACTER_LIMITS = {
        "facebook": 63206,
        "instagram": 2200,
        "linkedin": 3000,
        "x": 280,
        "youtube": 10000,
        "whatsapp": 4096
    }
    
    # Platform media requirements
    MEDIA_REQUIREMENTS = {
        "facebook": {
            "image": {"max_size": 45_000_000, "formats": ["jpg", "png", "gif"]},
            "video": {"max_size": 4_000_000_000, "formats": ["mp4", "mov"]}
        },
        "instagram": {
            "image": {"max_size": 30_000_000, "formats": ["jpg", "png"]},
            "video": {"max_size": 650_000_000, "formats": ["mp4", "mov"]}
        },
        "linkedin": {
            "image": {"max_size": 5_000_000, "formats": ["jpg", "png"]},
            "video": {"max_size": 5_000_000_000, "formats": ["mp4"]}
        },
        "x": {
            "image": {"max_size": 5_000_000, "formats": ["jpg", "png", "gif", "webp"]},
            "video": {"max_size": 512_000_000, "formats": ["mp4", "mov"]}
        },
        "youtube": {
            "video": {"max_size": 128_000_000_000, "formats": ["mp4", "mov", "avi", "mkv"]}
        },
        "whatsapp": {
            "image": {"max_size": 16_000_000, "formats": ["jpg", "png"]},
            "video": {"max_size": 64_000_000, "formats": ["mp4", "3gp"]}
        }
    }
    
    @classmethod
    def validate_content_length(cls, platform: str, content: str) -> tuple[bool, Optional[str]]:
        """Validate content length for platform"""
        limit = cls.CHARACTER_LIMITS.get(platform.lower())
        if limit and len(content) > limit:
            return False, f"Content exceeds {platform} limit of {limit} characters"
        return True, None
    
    @classmethod
    def validate_media(cls, platform: str, media_type: str, media_size: int) -> tuple[bool, Optional[str]]:
        """Validate media for platform"""
        platform_req = cls.MEDIA_REQUIREMENTS.get(platform.lower(), {})
        type_req = platform_req.get(media_type.lower())
        
        if not type_req:
            return False, f"{media_type} is not supported on {platform}"
        
        if media_size > type_req.get("max_size", float("inf")):
            max_mb = type_req["max_size"] / 1_000_000
            return False, f"Media size exceeds {platform} limit of {max_mb}MB"
        
        return True, None
    
    @classmethod
    def get_character_limit(cls, platform: str) -> int:
        """Get character limit for platform"""
        return cls.CHARACTER_LIMITS.get(platform.lower(), 10000)
    
    @classmethod
    def format_for_platform(cls, platform: str, content: str) -> str:
        """Format content for platform-specific display"""
        limit = cls.get_character_limit(platform)
        if len(content) > limit:
            return content[:limit - 3] + "..."
        return content
