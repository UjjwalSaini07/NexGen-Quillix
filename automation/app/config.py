import os
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator
class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    APP_NAME: str = "NexGen-Quillix Automation API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    ENVIRONMENT: str = Field(default="production", env="ENVIRONMENT")
    
    # Security
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24
    JWT_REFRESH_EXPIRATION_DAYS: int = 30
    
    # OAuth Providers - Load from environment
    # Facebook/Meta
    FACEBOOK_CLIENT_ID: Optional[str] = Field(None, env="FACEBOOK_CLIENT_ID")
    FACEBOOK_CLIENT_SECRET: Optional[str] = Field(None, env="FACEBOOK_CLIENT_SECRET")
    FACEBOOK_REDIRECT_URI: Optional[str] = Field(None, env="FACEBOOK_REDIRECT_URI")
    
    # Google (YouTube)
    GOOGLE_CLIENT_ID: Optional[str] = Field(None, env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = Field(None, env="GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: Optional[str] = Field(None, env="GOOGLE_REDIRECT_URI")
    
    # LinkedIn
    LINKEDIN_CLIENT_ID: Optional[str] = Field(None, env="LINKEDIN_CLIENT_ID")
    LINKEDIN_CLIENT_SECRET: Optional[str] = Field(None, env="LINKEDIN_CLIENT_SECRET")
    LINKEDIN_REDIRECT_URI: Optional[str] = Field(None, env="LINKEDIN_REDIRECT_URI")
    
    # X (Twitter)
    X_CLIENT_ID: Optional[str] = Field(None, env="X_CLIENT_ID")
    X_CLIENT_SECRET: Optional[str] = Field(None, env="X_CLIENT_SECRET")
    X_REDIRECT_URI: Optional[str] = Field(None, env="X_REDIRECT_URI")
    
    # Twitter API Credentials
    TWITTER_API_KEY: Optional[str] = Field(None, env="TWITTER_API_KEY")
    TWITTER_API_SECRET: Optional[str] = Field(None, env="TWITTER_API_SECRET")
    TWITTER_ACCESS_TOKEN: Optional[str] = Field(None, env="TWITTER_ACCESS_TOKEN")
    TWITTER_ACCESS_SECRET: Optional[str] = Field(None, env="TWITTER_ACCESS_SECRET")
    TWITTER_BEARER_TOKEN: Optional[str] = Field(None, env="TWITTER_BEARER_TOKEN")
    
    # Instagram (uses Meta)
    INSTAGRAM_CLIENT_ID: Optional[str] = Field(None, env="INSTAGRAM_CLIENT_ID")
    INSTAGRAM_CLIENT_SECRET: Optional[str] = Field(None, env="INSTAGRAM_CLIENT_SECRET")
    
    # Quillix Image Generation API
    QUILLIX_IMAGE_ACCESS_KEY: Optional[str] = Field(None, env="QUILLIX_IMAGE_ACCESS_KEY")
    INSTAGRAM_REDIRECT_URI: Optional[str] = Field(None, env="INSTAGRAM_REDIRECT_URI")
    
    # WhatsApp (Business API)
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = Field(None, env="WHATSAPP_PHONE_NUMBER_ID")
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = Field(None, env="WHATSAPP_BUSINESS_ACCOUNT_ID")
    
    # Database
    MONGO_URL: str = Field(..., env="MONGO_URL")
    MONGO_DB_NAME: str = Field("nexgen_quillix", env="MONGO_DB_NAME")
    
    # Redis
    REDIS_URL: str = Field(..., env="REDIS_URL")
    REDIS_CACHE_TTL: int = 300  # 5 minutes
    
    # AI Services
    GROQ_API_KEY: Optional[str] = Field(None, env="GROQ_API_KEY")
    OPENAI_API_KEY: Optional[str] = Field(None, env="OPENAI_API_KEY")
    
    # Stock Media APIs
    UNSPLASH_ACCESS_KEY: Optional[str] = Field(None, env="UNSPLASH_ACCESS_KEY")
    PIXABAY_API_KEY: Optional[str] = Field(None, env="PIXABAY_API_KEY")
    
    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: Optional[str] = Field(None, env="CLOUDINARY_CLOUD_NAME")
    CLOUDINARY_API_KEY: Optional[str] = Field(None, env="CLOUDINARY_API_KEY")
    CLOUDINARY_API_SECRET: Optional[str] = Field(None, env="CLOUDINARY_API_SECRET")
    CLOUDINARY_UPLOAD_PRESET: Optional[str] = Field(None, env="CLOUDINARY_UPLOAD_PRESET")
    CLOUDINARY_UPLOAD_FOLDER: str = Field("Quillix-Engine", env="CLOUDINARY_UPLOAD_FOLDER")
    
    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://127.0.0.1:3000"],
        env="CORS_ORIGINS"
    )
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # Logging
    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")
    LOG_FILE_PATH: Optional[str] = Field(None, env="LOG_FILE_PATH")
    
    # Email (for notifications)
    SMTP_HOST: Optional[str] = Field(None, env="SMTP_HOST")
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = Field(None, env="SMTP_USER")
    SMTP_PASSWORD: Optional[str] = Field(None, env="SMTP_PASSWORD")
    SMTP_FROM_EMAIL: Optional[str] = Field(None, env="SMTP_FROM_EMAIL")
    
    # OAuth scopes per platform
    FACEBOOK_SCOPES: str = "pages_manage_posts,pages_read_engagement,instagram_basic,instagram_manage_insights"
    INSTAGRAM_SCOPES: str = "user_profile,user_media,instagram_basic,instagram_manage_insights"
    LINKEDIN_SCOPES: str = "r_liteprofile,w_member_social,r_emailaddress"
    X_SCOPES: str = "tweet.read tweet.write users.read offline.access"
    YOUTUBE_SCOPES: str = "https://www.googleapis.com/auth/youtube.force-ssl"
    WHATSAPP_SCOPES: str = "whatsapp_business_management,whatsapp_business_messaging"
    
    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


settings = get_settings()
