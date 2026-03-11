"""
Redis Client for NexGen-Quillix Automation Platform
Caching and session management
"""
import redis.asyncio as redis
from typing import Optional
import logging
from app.config import settings

logger = logging.getLogger(__name__)

_redis_client: Optional[redis.Redis] = None


async def get_redis_client() -> redis.Redis:
    """Get Redis client instance"""
    global _redis_client
    
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                max_connections=50
            )
            await _redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Redis connection failed: {e}")
            raise
    
    return _redis_client


async def close_redis_client():
    """Close Redis connection"""
    global _redis_client
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
        logger.info("Redis connection closed")


# ==================== Cache Functions ====================
async def get_cached(key: str) -> Optional[str]:
    """Get value from cache"""
    try:
        client = await get_redis_client()
        return await client.get(key)
    except Exception as e:
        logger.warning(f"Cache get failed: {e}")
        return None


async def set_cached(key: str, value: str, ttl: int = None):
    """Set value in cache"""
    try:
        client = await get_redis_client()
        if ttl:
            await client.setex(key, ttl, value)
        else:
            await client.set(key, value)
    except Exception as e:
        logger.warning(f"Cache set failed: {e}")


async def delete_cached(key: str):
    """Delete value from cache"""
    try:
        client = await get_redis_client()
        await client.delete(key)
    except Exception as e:
        logger.warning(f"Cache delete failed: {e}")


# ==================== Rate Limiting ====================
async def check_rate_limit(key: str, limit: int, window: int) -> tuple[bool, int]:
    """
    Check rate limit for a key.
    
    Returns:
        (is_allowed, remaining)
    """
    try:
        client = await get_redis_client()
        
        # Increment counter
        current = await client.incr(key)
        
        # Set expiry on first request
        if current == 1:
            await client.expire(key, window)
        
        remaining = max(0, limit - current)
        is_allowed = current <= limit
        
        return is_allowed, remaining
    except Exception:
        # If Redis fails, allow the request
        return True, limit


# ==================== Session Management ====================
async def store_session(session_id: str, data: dict, ttl: int = 86400):
    """Store session data"""
    try:
        client = await get_redis_client()
        import json
        await client.setex(f"session:{session_id}", ttl, json.dumps(data))
    except Exception as e:
        logger.warning(f"Session store failed: {e}")


async def get_session(session_id: str) -> Optional[dict]:
    """Get session data"""
    try:
        client = await get_redis_client()
        import json
        data = await client.get(f"session:{session_id}")
        return json.loads(data) if data else None
    except Exception as e:
        logger.warning(f"Session get failed: {e}")
        return None


async def delete_session(session_id: str):
    """Delete session"""
    try:
        client = await get_redis_client()
        await client.delete(f"session:{session_id}")
    except Exception as e:
        logger.warning(f"Session delete failed: {e}")
