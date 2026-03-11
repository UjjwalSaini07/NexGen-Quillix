# NexGen-Quillix Automation Platform - Documentation Index

Welcome to the comprehensive documentation for the NexGen-Quillix Automation Platform backend.

## 📚 Documentation Files

### Getting Started
- **[SETUP.md](./SETUP.md)** - Installation and Configuration
  - Prerequisites
  - Environment Variables
  - Database Setup
  - Running the Application
  - Docker Deployment

### Architecture
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System Architecture
  - High-Level Overview
  - Technology Stack
  - Directory Structure
  - Component Diagram
  - Data Flow

### API Reference
- **[API-REFERENCE.md](./API-REFERENCE.md)** - Complete API Documentation
  - Authentication Endpoints
  - Social Media Management
  - Post Management
  - Analytics
  - AI Services
  - Request/Response Examples

### Design Patterns
- **[PATTERNS.md](./PATTERNS.md)** - Design Patterns & Best Practices
  - Factory Pattern
  - Repository Pattern
  - Dependency Injection
  - Error Handling
  - Logging Strategy

### Technical Details
- **[COMPLEXITY.md](./COMPLEXITY.md)** - Complexity Analysis
  - Time Complexity
  - Space Complexity
  - Performance Considerations
  - Optimization Strategies
  - Scalability Analysis

### OAuth Implementation
- **[OAUTH_GUIDE.md](./OAUTH_GUIDE.md)** - OAuth Implementation Guide
  - Supported Platforms
  - OAuth Flow
  - Token Management
  - Platform-Specific Configuration
  - Troubleshooting


## 🚀 Quick Links

| Resource | URL |
|----------|-----|
| API Base URL | `http://localhost:8000` |
| Swagger UI | `http://localhost:8000/docs` |
| ReDoc | `http://localhost:8000/redoc` |
| Health Check | `http://localhost:8000/health` |


## 📋 API Endpoints Overview

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user
- `GET /auth/oauth/{provider}` - Get OAuth URL
- `GET /auth/oauth/{provider}/callback` - OAuth callback

### Social Media (`/social`)
- `GET /social/platforms` - Get supported platforms
- `POST /social/platforms/{platform}/connect` - Connect account
- `GET /social/accounts` - Get connected accounts
- `DELETE /social/accounts/{platform}` - Disconnect account
- `POST /social/posts` - Create post
- `GET /social/posts` - Get posts
- `POST /social/posts/{post_id}/publish` - Publish post

### Analytics (`/analytics`)
- `GET /analytics/summary` - Get analytics summary
- `GET /analytics/platform-stats` - Get platform stats
- `GET /analytics/performance/{post_id}` - Get post performance
- `GET /analytics/trends` - Get engagement trends

### AI Services (`/ai`)
- `POST /ai/generate-post` - Generate AI post
- `POST /ai/generate-reply` - Generate reply
- `POST /ai/generate-hashtags` - Generate hashtags
- `POST /ai/optimize-content` - Optimize content


## 🔧 Environment Variables

Required environment variables:

```env
# Application
APP_NAME=NexGen-Quillix Automation API
ENVIRONMENT=development

# Security
JWT_SECRET=your-secret-key

# Database
MONGO_URL=mongodb://localhost:27017/nexgen_quillix
MONGO_DB_NAME=nexgen_quillix

# Redis
REDIS_URL=redis://localhost:6379/0

# AI
GROQ_API_KEY=your-groq-api-key
```


## 📦 Supported Platforms

| Platform | Status | Version |
|----------|--------|---------|
| Facebook | ✅ | v19.0 |
| Instagram | ✅ | v19.0 |
| LinkedIn | ✅ | v2 |
| X (Twitter) | ✅ | v2 |
| YouTube | ✅ | v3 |
| WhatsApp | ✅ | v19.0 |


## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

```bash
# Include in request headers
Authorization: Bearer <access_token>
```

Token types:
- **Access Token**: Valid for 24 hours
- **Refresh Token**: Valid for 30 days


## 📊 Rate Limits

| Endpoint | Limit |
|----------|-------|
| General API | 60/minute |
| Authentication | 10/minute |
| AI Generation | 20/minute |


## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check `MONGO_URL` in environment
   - Verify MongoDB is running

2. **Redis Connection Error**
   - Check `REDIS_URL` in environment
   - Verify Redis is running

3. **OAuth Errors**
   - Verify redirect URIs match exactly
   - Check platform developer console

4. **401 Unauthorized**
   - Token expired - use refresh endpoint
   - Invalid token - login again


## 📞 Support

For issues and questions:
- Check [API-REFERENCE.md](./API-REFERENCE.md) for endpoint details
- Review [SETUP.md](./SETUP.md) for configuration
- See [OAUTH_GUIDE.md](./OAUTH_GUIDE.md) for OAuth issues
- Review [COMPLEXITY.md](./COMPLEXITY.md) for performance


## 📄 License

Copyright © 2026 NexGen-Quillix. All rights reserved.
