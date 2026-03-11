# API Reference - NexGen-Quillix Automation Platform

Complete API reference for all endpoints with request/response examples.

## Base URL
```
http://localhost:8000
```

## Authentication

All endpoints (except public ones) require JWT authentication via Bearer token:
```
Authorization: Bearer <access_token>
```


## 1. Authentication Endpoints

### 1.1 Register User
**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "username": "johndoe"
}
```

**Response (201 Created):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "full_name": "John Doe",
  "username": "johndoe",
  "is_active": true,
  "is_verified": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Validation Rules:**
- Email: Valid email format required
- Password: Minimum 8 characters, must contain uppercase, lowercase, digit, and special character
- Username: Optional, 3-30 characters, alphanumeric + underscore


### 1.2 Login
**POST** `/auth/login`

Authenticate and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400
}
```


### 1.3 Refresh Token
**POST** `/auth/refresh`

Refresh expired access token.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| refresh_token | string | The refresh token |

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400
}
```


### 1.4 Logout
**POST** `/auth/logout`

Logout user and revoke tokens.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```


### 1.5 Get Current User
**GET** `/auth/me`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "full_name": "John Doe",
  "username": "johndoe",
  "avatar_url": "https://...",
  "is_active": true,
  "is_verified": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```


### 1.6 Update Profile
**PUT** `/auth/me`

Update user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "full_name": "John Updated",
  "bio": "Software Developer",
  "timezone": "Asia/Kolkata"
}
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "full_name": "John Updated",
  "bio": "Software Developer",
  "timezone": "Asia/Kolkata"
}
```


### 1.7 Get OAuth URL
**GET** `/auth/oauth/{provider}`

Get OAuth authorization URL for a platform.

**Path Parameters:**
| Parameter | Description |
|-----------|-------------|
| provider | Platform name (facebook, instagram, linkedin, x, youtube, whatsapp) |

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "provider": "facebook",
  "oauth_url": "https://www.facebook.com/v19.0/dialog/oauth?client_id=...",
  "state": "eyJhbGciOiJIUzI1NiIs...",
  "scopes": ["pages_manage_posts", "pages_read_engagement"]
}
```


## 2. Social Media Endpoints

### 2.1 Get Supported Platforms
**GET** `/social/platforms`

Get list of supported social platforms.

**Response (200 OK):**
```json
{
  "platforms": ["facebook", "instagram", "linkedin", "x", "youtube", "whatsapp"],
  "count": 6,
  "scopes": {
    "facebook": "pages_manage_posts,pages_read_engagement,instagram_basic",
    "instagram": "user_profile,user_media,...",
    ...
  }
}
```


### 2.2 Get OAuth URL for Platform
**GET** `/social/platforms/{platform}/oauth-url`

Get OAuth URL for a specific platform.

**Path Parameters:**
| Parameter | Description |
|-----------|-------------|
| platform | Platform name |

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "platform": "facebook",
  "oauth_url": "https://www.facebook.com/v19.0/dialog/oauth?...",
  "state": "...",
  "scopes": ["pages_manage_posts", "pages_read_engagement"]
}
```


### 2.3 Connect Platform Account
**POST** `/social/platforms/{platform}/connect`

Connect a social media account.

**Path Parameters:**
| Parameter | Description |
|-----------|-------------|
| platform | Platform name |

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "platform": "facebook",
  "access_token": "EAAC...",
  "refresh_token": "AQ...",
  "platform_user_id": "123456789",
  "platform_username": "myfacebookpage",
  "expires_in": 5184000
}
```

**Response (200 OK):**
```json
{
  "message": "facebook account connected successfully",
  "platform": "facebook",
  "account_id": "507f1f77bcf86cd799439011",
  "status": "connected"
}
```


### 2.4 Get Connected Accounts
**GET** `/social/accounts`

Get all connected social media accounts.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| platform | string | Filter by platform |
| include_inactive | boolean | Include inactive accounts |

**Response (200 OK):**
```json
{
  "accounts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "platform": "facebook",
      "platform_username": "myfacebookpage",
      "is_active": true,
      "connected_at": "2024-01-15T10:30:00Z",
      "needs_reauth": false
    }
  ],
  "count": 1
}
```


### 2.5 Get Specific Account
**GET** `/social/accounts/{platform}`

Get a specific connected account.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "platform": "facebook",
  "platform_username": "myfacebookpage",
  "is_active": true,
  "connected_at": "2024-01-15T10:30:00Z",
  "expires_at": "2024-06-15T10:30:00Z",
  "needs_reauth": false
}
```


### 2.6 Disconnect Account
**DELETE** `/social/accounts/{platform}`

Disconnect a social media account.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "message": "facebook account disconnected successfully"
}
```


### 2.7 Create Post
**POST** `/social/posts`

Create a new post.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "content": "Check out our new product launch! 🚀",
  "platforms": ["facebook", "instagram"],
  "media_urls": ["https://example.com/image.jpg"],
  "media_type": "image",
  "is_draft": false,
  "enable_analytics": true
}
```

**Response (201 Created):**
```json
{
  "message": "Post created successfully",
  "post_id": "507f1f77bcf86cd799439011",
  "status": "pending",
  "scheduled_time": null
}
```


### 2.8 Get Posts
**GET** `/social/posts`

Get user's posts with pagination.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status_filter | string | Filter by status (draft, scheduled, published) |
| platform_filter | string | Filter by platform |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20, max: 100) |

**Response (200 OK):**
```json
{
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```


### 2.9 Get Single Post
**GET** `/social/posts/{post_id}`

Get a specific post.

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "content": "Check out our new product!",
  "platforms": ["facebook", "instagram"],
  "status": "published",
  "created_at": "2024-01-15T10:30:00Z"
}
```


### 2.10 Publish Post
**POST** `/social/posts/{post_id}/publish`

Publish a post immediately.

**Response (200 OK):**
```json
{
  "message": "Post published",
  "results": [
    {
      "platform": "facebook",
      "status": "success",
      "post_id": "fb_123456"
    }
  ],
  "overall_status": "success"
}
```


## 3. Automation Rules Endpoints

### 3.1 Create Automation Rule
**POST** `/social/automation/rules`

Create an automation rule.

**Request Body:**
```json
{
  "name": "Auto-reply to comments",
  "platform": "instagram",
  "trigger": "new_comment",
  "action": "auto_reply",
  "message_template": "Thanks for your comment! 🎉",
  "is_active": true,
  "priority": 5
}
```


### 3.2 Get Automation Rules
**GET** `/social/automation/rules`

Get all automation rules.

**Response (200 OK):**
```json
{
  "rules": [
    {
      "_id": "...",
      "name": "Auto-reply to comments",
      "platform": "instagram",
      "trigger": "new_comment",
      "action": "auto_reply",
      "is_active": true
    }
  ],
  "count": 1
}
```


## 4. Analytics Endpoints

### 4.1 Get Analytics Summary
**GET** `/analytics/summary`

Get analytics summary.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| days | integer | Number of days (default: 30, max: 365) |

**Response (200 OK):**
```json
{
  "total_posts": 150,
  "published_posts": 120,
  "scheduled_posts": 20,
  "draft_posts": 10,
  "total_likes": 5000,
  "total_comments": 1200,
  "total_shares": 300,
  "total_impressions": 100000,
  "avg_engagement_rate": 6.5,
  "platform_breakdown": {
    "facebook": { "likes": 2000, "comments": 500, ... },
    "instagram": { "likes": 3000, "comments": 700, ... }
  }
}
```


### 4.2 Get Platform Stats
**GET** `/analytics/platform-stats`

Get platform-wise statistics.



### 4.3 Get Post Performance
**GET** `/analytics/performance/{post_id}`

Get performance metrics for a specific post.


### 4.4 Get Engagement Trends
**GET** `/analytics/trends`

Get engagement trends over time.

**Query Parameters:**
| Parameter | Description |
|-----------|-------------|
| days | Number of days (7-90) |
| interval | day, week, or month |


### 4.5 Get Top Posts
**GET** `/analytics/top-posts`

Get top performing posts.


## 5. AI Endpoints

### 5.1 Generate Post
**POST** `/ai/generate-post`

Generate a social media post using AI.

**Request Body:**
```json
{
  "niche": "technology",
  "tone": "professional",
  "platform": "linkedin",
  "include_emoji": true,
  "include_cta": true,
  "include_hashtags": true,
  "length": "medium"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "content": "🚀 Exciting developments in AI technology...",
  "niche": "technology",
  "tone": "professional"
}
```


### 5.2 Generate Reply
**POST** `/ai/generate-reply`

Generate a reply to a comment.

**Request Body:**
```json
{
  "comment": "Great product! How does it work?",
  "tone": "friendly",
  "platform": "instagram"
}
```


### 5.3 Generate Hashtags
**POST** `/ai/generate-hashtags`

Generate relevant hashtags.



### 5.4 Optimize Content
**POST** `/ai/optimize-content`

Optimize content for a specific platform.

**Request Body:**
```json
{
  "content": "Long content here...",
  "target_platform": "twitter",
  "improve_engagement": true,
  "shorten": true
}
```


### 5.5 Analyze Sentiment
**POST** `/ai/analyze-sentiment`

Analyze sentiment of text.

**Request Body:**
```json
{
  "text": "I absolutely love this product!"
}
```


## 6. Error Responses

### Standard Error Format
```json
{
  "error": "Error message",
  "status_code": 400,
  "request_id": "uuid"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |


## Rate Limiting

Rate limits are applied per IP/user:

- **Default**: 60 requests per minute
- **Auth endpoints**: 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
```


## Webhooks

For real-time notifications, configure webhooks in the platform settings.
