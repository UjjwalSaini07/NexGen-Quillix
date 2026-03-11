from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    """Manages MongoDB connections with connection pooling"""
    
    _instance: Optional["DatabaseManager"] = None
    _client: Optional[AsyncIOMotorClient] = None
    _db: Optional[AsyncIOMotorDatabase] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._connect()
    
    def _connect(self):
        """Establish database connection with connection pooling"""
        try:
            # Configure connection with pooling
            self._client = AsyncIOMotorClient(
                settings.MONGO_URL,
                maxPoolSize=50,
                minPoolSize=10,
                maxIdleTimeMS=30000,
                connectTimeoutMS=10000,
                serverSelectionTimeoutMS=10000,
                retryWrites=True,
                retryReads=True
            )
            
            self._db = self._client[settings.MONGO_DB_NAME]
            
            # Test connection
            self._client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {settings.MONGO_DB_NAME}")
            
            # Create indexes
            self._create_indexes()
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    def _create_indexes(self):
        """Create database indexes for optimal performance"""
        try:
            # Users collection indexes
            self._db.users.create_index("email", unique=True)
            self._db.users.create_index("created_at")
            
            # Social accounts indexes
            self._db.social_accounts.create_index(
                [("user_id", 1), ("platform", 1)], 
                unique=True
            )
            self._db.social_accounts.create_index("platform")
            self._db.social_accounts.create_index("expires_at")
            
            # Posts collection indexes
            self._db.posts.create_index("user_id")
            self._db.posts.create_index("status")
            self._db.posts.create_index("scheduled_time")
            self._db.posts.create_index([("user_id", 1), ("created_at", -1)])
            self._db.posts.create_index("platforms")
            
            # Analytics collection indexes
            self._db.analytics.create_index("post_id")
            self._db.analytics.create_index("platform")
            self._db.analytics.create_index([("user_id", 1), ("collected_at", -1)])
            
            # Automation rules indexes
            self._db.automation_rules.create_index("user_id")
            self._db.automation_rules.create_index("platform")
            self._db.automation_rules.create_index("enabled")
            
            # Refresh tokens indexes
            self._db.refresh_tokens.create_index("user_id")
            self._db.refresh_tokens.create_index("expires_at")
            self._db.refresh_tokens.create_index([("user_id", 1), ("created_at", -1)])
            
            # Webhooks indexes
            self._db.webhooks.create_index("user_id")
            self._db.webhooks.create_index("platform")
            self._db.webhooks.create_index("enabled")
            
            # Audit logs indexes
            self._db.audit_logs.create_index("user_id")
            self._db.audit_logs.create_index("action")
            self._db.audit_logs.create_index([("created_at", -1)])
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.warning(f"Index creation error (may already exist): {e}")
    
    @property
    def client(self) -> AsyncIOMotorClient:
        """Get MongoDB client"""
        if self._client is None:
            self._connect()
        return self._client
    
    @property
    def db(self) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if self._db is None:
            self._connect()
        return self._db
    
    def close(self):
        """Close database connection"""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            logger.info("MongoDB connection closed")


# Singleton instance
db_manager = DatabaseManager()

# Export for easy use
client = db_manager.client
db = db_manager.db


# Async context manager for database operations
class DatabaseSession:
    """Async context manager for database sessions"""
    
    def __init__(self):
        self.db = db
    
    async def __aenter__(self):
        return self.db
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        pass


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency for getting database instance"""
    return db
