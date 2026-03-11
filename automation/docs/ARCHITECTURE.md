# Architecture - NexGen-Quillix Automation Platform

This document provides an in-depth look at the system architecture of the NexGen-Quillix Automation Platform.


## 1. High-Level Overview

The NexGen-Quillix Automation Platform is a **microservices-ready** REST API built with **FastAPI** that provides:

- **Multi-platform social media management**
- **AI-powered content generation**
- **Scheduled posting and automation**
- **Analytics and insights**
- **OAuth authentication**

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  FastAPI Application                        │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │  Social  │  │  Posts   │  │   AI     │  │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │              │              │              │         │
│  ┌────▼─────────────▼──────────────▼──────────────▼────┐   │
│  │              Services Layer                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐   │   │
│  │  │  Platform  │  │     AI     │  │ Scheduler  │   │   │
│  │  │  Services  │  │  Service   │  │  Service   │   │   │
│  │  └────────────┘  └────────────┘  └────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Data Access Layer                          │   │
│  │         (Motor + Pydantic)                          │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   MongoDB     │   │    Redis      │   │   External    │
│  (Database)   │   │   (Cache)     │   │   APIs        │
└───────────────┘   └───────────────┘   └───────────────┘
```


## 2. Technology Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | FastAPI | 0.109+ | REST API |
| ASGI Server | Uvicorn | 0.27+ | Production server |
| Database | MongoDB | 5.0+ | Primary data store |
| ODM | Motor | 3.3+ | Async MongoDB driver |
| Cache | Redis | 6.0+ | Session & rate limiting |
| Auth | JWT | - | Token-based auth |
| AI | Groq/LangChain | - | Content generation |

### Supporting Libraries

```python
# Security
python-jose[cryptography]  # JWT handling
passlib[bcrypt]            # Password hashing

# Configuration
pydantic-settings          # Environment config
python-dotenv              # .env support

# HTTP
requests                   # External API calls
httpx                      # Async HTTP

# Utilities
python-dateutil            # Date handling
email-validator            # Email validation
```


## 3. Directory Structure

```
automation/
├── app/
│   ├── config.py              # Configuration management
│   ├── database.py            # MongoDB connection
│   ├── redis_client.py        # Redis client
│   ├── main.py                # FastAPI application
│   ├── dependencies.py        # FastAPI dependencies
│   │
│   ├── core/
│   │   ├── security.py        # JWT & OAuth
│   │   ├── exceptions.py       # Custom exceptions
│   │   └── logging.py         # Logging setup
│   │
│   ├── models/
│   │   └── __init__.py        # Pydantic models
│   │
│   ├── routes/
│   │   ├── auth.py            # Authentication
│   │   ├── social.py           # Social media
│   │   ├── posts.py           # Post management
│   │   ├── analytics.py       # Analytics
│   │   └── ai.py              # AI services
│   │
│   ├── services/
│   │   ├── platform/          # Platform integrations
│   │   │   ├── base.py        # Base service
│   │   │   ├── factory.py     # Service factory
│   │   │   ├── facebook_service.py
│   │   │   ├── instagram_service.py
│   │   │   ├── linkedin_service.py
│   │   │   ├── x_service.py
│   │   │   ├── youtube_service.py
│   │   │   ├── whatsapp_service.py
│   │   │   └── token_refresh.py
│   │   │
│   │   ├── ai/
│   │   │   └── groq_service.py
│   │   │
│   │   ├── scheduler/
│   │   │   └── smart_scheduler.py
│   │   │
│   │   └── engagement/
│   │       └── engagement_engine.py
│   │
│   └── tasks/
│       ├── worker.py
│       ├── auto_content_tasks.py
│       ├── engagement_tasks.py
│       └── publish_tasks.py
│
├── docs/                      # Documentation
├── requirements.txt           # Python dependencies
└── .env.example              # Environment template
```


## 4. Component Design

### 4.1 API Layer (Routes)

Routes handle HTTP requests/responses and delegate to services.

```python
# Example: routes/auth.py
@router.post("/register")
async def register(user_data: UserCreate):
    # Validate input
    # Call service
    # Return response
```

**Key Principles:**
- Single responsibility per endpoint
- Input validation via Pydantic
- Error handling with proper HTTP codes
- Async/await throughout

### 4.2 Service Layer

Services contain business logic and interact with data/external APIs.

```python
# Example: services/platform/facebook_service.py
class FacebookService(BasePlatformService):
    def publish(self, post_data):
        # Platform-specific logic
        # API calls
        # Error handling
```

**Services:**
| Service | Responsibility |
|---------|----------------|
| PlatformFactory | Create platform instances |
| FacebookService | Facebook API operations |
| InstagramService | Instagram API operations |
| LinkedInService | LinkedIn API operations |
| XService | Twitter/X API operations |
| YouTubeService | YouTube API operations |
| WhatsAppService | WhatsApp API operations |
| GroqService | AI content generation |

### 4.3 Data Layer

MongoDB with Motor for async operations.

```python
# Example: database.py
client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.MONGO_DB_NAME]
```

**Collections:**
- `users` - User accounts
- `social_accounts` - Connected platforms
- `posts` - Created posts
- `analytics` - Engagement metrics
- `automation_rules` - Automation rules
- `refresh_tokens` - JWT refresh tokens

### 4.4 Security Layer

JWT-based authentication with OAuth 2.0 support.

```
┌─────────────────┐
│   User Login    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Verify creds  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate JWT    │
│ + Refresh Token │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Return tokens  │
└─────────────────┘
```


## 5. Data Flow

### 5.1 Post Creation Flow

```
1. User creates post via POST /social/posts
          │
          ▼
2. Validate platforms are connected
          │
          ▼
3. Save to MongoDB (status: draft/pending)
          │
          ▼
4. If immediate publish:
   a. For each platform:
      - Get service via PlatformFactory
      - Call platform API
      - Store result
   b. Update post status
          │
          ▼
5. Return post_id to user
```

### 5.2 OAuth Flow

```
1. User requests OAuth URL via GET /auth/oauth/{provider}
          │
          ▼
2. Generate state token with user_id
          │
          ▼
3. Return OAuth URL to frontend
          │
          ▼
4. User authorizes on platform
          │
          ▼
5. Platform redirects to /auth/oauth/{provider}/callback
          │
          ▼
6. Exchange code for access token
          │
          ▼
7. Save social account to database
          │
          ▼
8. Return success to user
```


## 6. Scalability Considerations

### 6.1 Horizontal Scaling

- **Stateless Design**: All state stored in MongoDB/Redis
- **Load Balancer Ready**: No local state dependencies
- **Container Ready**: Docker/Kubernetes compatible

### 6.2 Database Optimization

- **Indexing**: Automatic indexes on frequently queried fields
- **Connection Pooling**: MongoDB connection pooling
- **Caching**: Redis for frequently accessed data

### 6.3 API Optimization

- **Async Throughout**: Non-blocking I/O
- **Rate Limiting**: Per-user rate limits
- **Pagination**: All list endpoints support pagination



## 7. Security Architecture

### 7.1 Authentication Flow

```
Request with JWT
       │
       ▼
Extract Bearer token
       │
       ▼
Decode & validate JWT
       │
       ▼
Verify user exists & active
       │
       ▼
Add user to request state
       │
       ▼
Process request
```

### 7.2 Token Security

- **Access Token**: 24 hours expiry
- **Refresh Token**: 30 days expiry, stored in DB
- **Secure Storage**: Tokens encrypted at rest
- **Revocation**: Token revocation on logout

### 7.3 OAuth Security

- **State Parameter**: CSRF protection
- **Token Encryption**: Tokens stored encrypted
- **Scope Limitation**: Minimal required scopes


## 8. Monitoring & Observability

### 8.1 Logging

- Structured JSON logging
- Request ID tracking
- Error stack traces
- Performance metrics

### 8.2 Health Checks

| Endpoint | Purpose |
|----------|---------|
| `/health` | Overall health |
| `/health/ready` | Readiness for traffic |
| `/health/live` | Liveness probe |


## 9. Future Enhancements

### Planned Features

1. **WebSocket Support**: Real-time updates
2. **GraphQL API**: Flexible queries
3. **Multi-tenant**: Organization support
4. **Advanced Analytics**: ML-powered insights
5. **Webhooks**: Event-driven notifications

### Scalability Improvements

1. **CDN Integration**: Static asset delivery
2. **Message Queue**: Background job processing
3. **Microservices**: Service decomposition
4. **GraphQL Federation**: Unified API gateway
