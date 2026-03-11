# Design Patterns - NexGen-Quillix Automation Platform

This document describes the design patterns and best practices used in the automation backend.


## 1. Factory Pattern

The Factory pattern is extensively used for creating platform-specific service instances.

### Implementation

```python
# services/platform/factory.py
class PlatformFactory:
    _services: Dict[str, type] = {
        "facebook": FacebookService,
        "instagram": InstagramService,
        "linkedin": LinkedInService,
        "x": XService,
        "youtube": YouTubeService,
        "whatsapp": WhatsAppService
    }
    
    @classmethod
    def get_service(cls, platform: str, access_token: str, **kwargs):
        if platform not in cls._services:
            raise ValueError(f"Unsupported platform: {platform}")
        
        service_class = cls._services[platform]
        return service_class(access_token, **kwargs)
```

### Usage

```python
# In routes
account = await db.social_accounts.find_one({"platform": "facebook"})
service = PlatformFactory.get_service("facebook", account["access_token"])
result = service.publish(post_data)
```

### Benefits
- **Loose Coupling**: Routes don't know about specific platform implementations
- **Easy Extension**: Add new platforms by registering new service classes
- **Testability**: Mock platform services easily


## 2. Repository Pattern

Database operations are abstracted through repository-like patterns.

### Implementation

```python
# routes/posts.py
class PostRepository:
    @staticmethod
    async def create(post_data: dict):
        result = await db.posts.insert_one(post_data)
        return result.inserted_id
    
    @staticmethod
    async def get_by_id(post_id: str):
        return await db.posts.find_one({"_id": ObjectId(post_id)})
    
    @staticmethod
    async def get_by_user(user_id: str, page: int, limit: int):
        skip = (page - 1) * limit
        return await db.posts.find(
            {"user_id": user_id}
        ).skip(skip).limit(limit).to_list()
```

### Benefits
- **Abstraction**: Routes don't directly interact with database
- **Testability**: Mock repositories for unit tests
- **Reusability**: Shared database logic across endpoints


## 3. Dependency Injection

FastAPI's dependency injection system is used throughout.

### Implementation

```python
# core/security.py
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    # Verify token and return user
    return await verify_access_token(credentials)

# routes/auth.py
@router.post("/posts")
async def create_post(
    post_data: PostCreate,
    current_user: Dict = Depends(get_current_user)
):
    # Use current_user in endpoint
    user_id = str(current_user["_id"])
```

### Benefits
- **Clean Code**: Separation of auth logic from business logic
- **Reusability**: Use same dependency across multiple routes
- **Testability**: Override dependencies in tests


## 4. Singleton Pattern

Used for database and configuration management.

### Implementation

```python
# database.py
class DatabaseManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def _connect(self):
        # Single connection initialization
        pass

# Usage
db_manager = DatabaseManager()
```


## 5. Strategy Pattern

Platform services implement a common interface (Strategy).

### Implementation

```python
# services/platform/base.py
class BasePlatformService(ABC):
    @abstractmethod
    def publish(self, post_data: Dict) -> Dict:
        pass
    
    @abstractmethod
    def delete_post(self, post_id: str) -> bool:
        pass
    
    @abstractmethod
    def get_post(self, post_id: str) -> Dict:
        pass

# Each platform implements the interface
class FacebookService(BasePlatformService):
    def publish(self, post_data):
        # Facebook-specific implementation
        pass
```

## 6. Error Handling Patterns

### Custom Exceptions

```python
# core/exceptions.py
class PlatformError(Exception):
    def __init__(self, platform: str, message: str):
        self.platform = platform
        self.message = message
        super().__init__(self.message)

class TokenExpiredError(PlatformError):
    pass

class RateLimitError(PlatformError):
    pass
```

### Global Exception Handler

```python
# main.py
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}
    )
```


## 7. Logging Strategy

### Structured Logging

```python
# core/logging.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
        }
        
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        return json.dumps(log_data)
```

### Usage

```python
logger.info(
    "Post created",
    extra={
        "user_id": user_id,
        "post_id": post_id,
        "platforms": platforms
    }
)
```


## 8. Validation Patterns

### Pydantic Models

```python
# models/__init__.py
class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    platforms: List[str] = Field(..., min_items=1)
    media_urls: List[str] = Field(default_factory=list)
    scheduled_time: Optional[datetime] = None
    
    @validator("platforms")
    def validate_platforms(cls, v):
        valid = ["facebook", "instagram", "linkedin", "x", "youtube", "whatsapp"]
        for platform in v:
            if platform not in valid:
                raise ValueError(f"Invalid platform: {platform}")
        return v
```


## 9. Pagination Pattern

### Standard Pagination

```python
@router.get("/posts")
async def get_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    skip = (page - 1) * limit
    total = await db.posts.count_documents(query)
    
    posts = await db.posts.find(query).skip(skip).limit(limit).to_list()
    
    return {
        "posts": posts,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }
```


## 10. Caching Pattern

### Redis Caching

```python
# redis_client.py
async def get_cached(key: str) -> Optional[str]:
    try:
        client = await get_redis_client()
        return await client.get(key)
    except Exception:
        return None

async def set_cached(key: str, value: str, ttl: int = 300):
    try:
        client = await get_redis_client()
        await client.setex(key, ttl, value)
    except Exception:
        pass
```

### Usage

```python
@router.get("/platforms")
async def get_platforms():
    cache_key = "platforms:all"
    
    # Check cache
    cached = await get_cached(cache_key)
    if cached:
        return json.loads(cached)
    
    # Fetch from database
    platforms = await get_platforms_from_db()
    
    # Cache result
    await set_cached(cache_key, json.dumps(platforms), ttl=3600)
    
    return platforms
```


## 11. Rate Limiting Pattern

### Token Bucket Algorithm

```python
# redis_client.py
async def check_rate_limit(key: str, limit: int, window: int):
    client = await get_redis_client()
    current = await client.incr(key)
    
    if current == 1:
        await client.expire(key, window)
    
    return current <= limit, max(0, limit - current)
```

### Usage

```python
@router.post("/posts")
async def create_post(request: Request, ...):
    client_ip = request.client.host
    is_allowed, remaining = await check_rate_limit(
        f"rate:{client_ip}",
        limit=60,
        window=60
    )
    
    if not is_allowed:
        raise HTTPException(429, "Rate limit exceeded")
```


## 12. Configuration Pattern

### Environment-Based Config

```python
# config.py
class Settings(BaseSettings):
    JWT_SECRET: str = Field(..., env="JWT_SECRET")
    MONGO_URL: str = Field(..., env="MONGO_URL")
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
```


## Best Practices Summary

| Pattern | Use Case | Benefit |
|---------|----------|---------|
| Factory | Platform services | Easy to add new platforms |
| Repository | Database operations | Clean separation |
| Dependency Injection | Auth, DB | Testable code |
| Singleton | Config, DB | Resource management |
| Strategy | Platform APIs | Consistent interface |
| Exception Handling | Errors | User-friendly errors |
| Pydantic Validation | Input data | Type safety |
| Pagination | List endpoints | Performance |
| Caching | Frequently accessed data | Speed |
| Rate Limiting | API protection | Security |
