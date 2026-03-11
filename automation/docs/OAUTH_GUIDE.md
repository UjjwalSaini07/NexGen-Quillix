# OAuth Guide - NexGen-Quillix Automation Platform

Complete guide to OAuth implementation for all supported platforms.


## 1. OAuth Overview

The platform supports OAuth 2.0 authentication for the following social media platforms:

| Platform | Provider | API Version | Status |
|----------|----------|-------------|--------|
| Facebook | Meta | v19.0 | ✅ Supported |
| Instagram | Meta | v19.0 | ✅ Supported |
| LinkedIn | LinkedIn | v2 | ✅ Supported |
| X (Twitter) | X | v2 | ✅ Supported |
| YouTube | Google | v3 | ✅ Supported |
| WhatsApp | Meta | v19.0 | ✅ Supported |


## 2. OAuth Flow

### 2.1 Authorization Code Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      OAuth Flow                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. User clicks "Connect [Platform]"                            │
│         │                                                       │
│         ▼                                                       │
│  2. GET /auth/oauth/{platform}                                  │
│     (Generate state, return auth URL)                           │
│         │                                                       │
│         ▼                                                       │
│  3. Redirect to Platform OAuth URL                              │
│         │                                                       │
│         ▼                                                       │
│  4. User authorizes on Platform                                 │
│         │                                                       │
│         ▼                                                       │
│  5. Platform redirects to callback URL                          │
│     with authorization code                                     │
│         │                                                       │
│         ▼                                                       │
│  6. POST /auth/oauth/{platform}/callback                        |
│     (Exchange code for tokens)                                  │
│         │                                                       │
│         ▼                                                       │
│  7. Store tokens, return success                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Platform Configuration

### 3.1 Facebook

#### Create Facebook App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app (Type: Consumer)
3. Add "Facebook Login" product
4. Configure redirect URI

#### Required Scopes
```
pages_manage_posts
pages_read_engagement
instagram_basic
```

#### Environment Variables
```env
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/auth/oauth/facebook/callback
```

#### OAuth URL Format
```
https://www.facebook.com/v19.0/dialog/oauth?
  client_id=YOUR_APP_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=pages_manage_posts,pages_read_engagement&
  response_type=code&
  state=STATE_TOKEN
```


### 3.2 Instagram

#### Create Instagram App

1. Create Facebook app (required)
2. Add "Instagram Graph API" product
3. Add Instagram tester

#### Required Scopes
```
user_profile
user_media
instagram_basic
instagram_manage_insights
```

#### Environment Variables
```env
INSTAGRAM_CLIENT_ID=your_app_id
INSTAGRAM_CLIENT_SECRET=your_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:8000/auth/oauth/instagram/callback
```


### 3.3 LinkedIn

#### Create LinkedIn App

1. Go to [LinkedIn Developer Console](https://www.linkedin.com/developers/apps)
2. Create new app
3. Configure redirect URLs

#### Required Scopes
```
r_liteprofile
w_member_social
r_emailaddress
```

#### Environment Variables
```env
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/auth/oauth/linkedin/callback
```

#### OAuth URL Format
```
https://www.linkedin.com/oauth/v2/authorization?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=r_liteprofile,w_member_social&
  response_type=code&
  state=STATE_TOKEN
```


### 3.4 X (Twitter)

#### Create X App

1. Go to [X Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create new project/app
3. Enable OAuth 2.0

#### Required Scopes
```
tweet.read
tweet.write
users.read
offline.access
```

#### Environment Variables
```env
X_CLIENT_ID=your_client_id
X_CLIENT_SECRET=your_client_secret
X_REDIRECT_URI=http://localhost:8000/auth/oauth/x/callback
```

#### OAuth URL Format
```
https://twitter.com/i/oauth2/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=tweet.read tweet.write users.read offline.access&
  response_type=code&
  state=STATE_TOKEN&
  code_challenge=challenge&
  code_challenge_method=plain
```


### 3.5 YouTube

#### Create Google Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable YouTube Data API v3
4. Configure OAuth consent screen

#### Required Scopes
```
https://www.googleapis.com/auth/youtube.force-ssl
https://www.googleapis.com/auth/youtube.upload
```

#### Environment Variables
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/oauth/youtube/callback
```

#### OAuth URL Format
```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=https://www.googleapis.com/auth/youtube.force-ssl&
  response_type=code&
  access_type=offline&
  prompt=consent
```


### 3.6 WhatsApp

#### Create WhatsApp Business App

1. Create Facebook app (same as Facebook)
2. Add "WhatsApp Business" product
3. Configure phone numbers

#### Required Scopes
```
whatsapp_business_management
whatsapp_business_messaging
```

#### Additional Configuration
```env
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
```


## 4. Token Management

### 4.1 Token Storage

Tokens are stored encrypted in MongoDB:

```python
{
  "user_id": "...",
  "platform": "facebook",
  "access_token_encrypted": "encrypted_token",
  "refresh_token_encrypted": "encrypted_refresh",
  "expires_at": "2024-06-15T10:30:00Z",
  "connected_at": "2024-01-15T10:30:00Z"
}
```

### 4.2 Token Refresh

#### Auto Refresh Flow
```
1. API call made with access token
         │
         ▼
2. Platform returns 401 (token expired)
         │
         ▼
3. Check if refresh token exists
         │
         ▼
4. Call platform's refresh endpoint
         │
         ▼
5. Update tokens in database
         │
         ▼
6. Retry original request
```

#### Manual Refresh

```bash
POST /social/accounts/{platform}/refresh
Authorization: Bearer <access_token>
```

### 4.3 Token Expiration

| Platform | Access Token | Refresh Token |
|----------|--------------|---------------|
| Facebook | ~2 hours | 60 days |
| Instagram | ~2 hours | 60 days |
| LinkedIn | ~10 minutes | Never (re-auth required) |
| X | ~2 hours | 6 months |
| YouTube | ~1 hour | ~6 months |
| WhatsApp | ~2 hours | 60 days |


## 5. Implementation Details

### 5.1 OAuth State Management

```python
# Generate secure state token
def generate_oauth_state(user_id: str, provider: str) -> str:
    state_data = {
        "user_id": user_id,
        "provider": provider,
        "nonce": secrets.token_urlsafe(16),
        "exp": (datetime.utcnow() + timedelta(minutes=10)).timestamp()
    }
    return jwt.encode(state_data, settings.JWT_SECRET)
```

### 5.2 Token Exchange

```python
async def exchange_code_for_token(platform: str, code: str) -> dict:
    # Platform-specific token exchange
    if platform == "facebook":
        return await exchange_facebook_token(code)
    elif platform == "linkedin":
        return await exchange_linkedin_token(code)
    # ... etc
```

### 5.3 Error Handling

```python
class OAuthError(Exception):
    def __init__(self, platform: str, message: str):
        self.platform = platform
        self.message = message

# Common errors
- AUTHORIZATION_PENDING: User hasn't completed auth
- INVALID_GRANT: Code expired or invalid
- INVALID_CLIENT: Client credentials invalid
- INVALID_SCOPE: Requested scope not granted
```


## 6. Testing OAuth

### 6.1 Testing in Development

1. Use ngrok for local testing:
```bash
ngrok http 8000
```

2. Update redirect URIs in platform console to use ngrok URL

3. Test OAuth flow

### 6.2 Testing Token Refresh

```bash
# Get initial token
curl -X POST /auth/login

# Use refresh endpoint
curl -X POST /auth/refresh?refresh_token=TOKEN
```


## 7. Security Best Practices

### 7.1 Token Security

- ✅ Encrypt tokens at rest
- ✅ Use HTTPS for all OAuth traffic
- ✅ Implement state parameter to prevent CSRF
- ✅ Short-lived access tokens
- ✅ Secure token storage

### 7.2 Scope Best Practices

- ✅ Request minimum required scopes
- ✅ Document why each scope is needed
- ✅ Handle scope denial gracefully
- ✅ Provide scope explanation to users

### 7.3 Error Handling

```python
try:
    # OAuth operation
except TokenExpiredError:
    # Trigger refresh
except InvalidScopeError:
    # Request additional scope
except UserDeniedError:
    # Handle user cancellation
```


## 8. Common Issues

### 8.1 Redirect URI Mismatch

**Error**: `redirect_uri does not match`

**Solution**: Ensure exact match between:
- Platform console redirect URI
- .env redirect URI
- Current server URL

### 8.2 Scope Not Granted

**Error**: `insufficient scope`

**Solution**: 
1. Remove app from connected apps
2. Re-authorize with requested scope

### 8.3 Token Expired

**Error**: `OAuth token expired`

**Solution**: 
1. Implement automatic refresh
2. Request `offline_access` scope

### 8.4 Rate Limiting

**Error**: `OAuth rate limit exceeded`

**Solution**:
1. Implement exponential backoff
2. Cache tokens properly


## 9. Postman Collection

### 9.1 Facebook OAuth Flow

```bash
# Step 1: Get OAuth URL
GET /social/platforms/facebook/oauth-url
Authorization: Bearer <user_token>

# Step 2: Use the URL in browser to authorize
# After authorization, platform redirects to callback

# Step 3: Callback is handled automatically
# Account is connected
```

### 9.2 Complete Flow Example

```bash
# 1. Login to get user token
POST /auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

# 2. Get OAuth URL
GET /social/platforms/facebook/oauth-url
Authorization: Bearer <access_token>

# 3. In browser, navigate to oauth_url
# Authorize the app

# 4. Verify account is connected
GET /social/accounts
Authorization: Bearer <access_token>
```


## 10. Production Checklist

Before going to production:

- [ ] HTTPS configured
- [ ] Redirect URIs updated to production URLs
- [ ] Token encryption enabled
- [ ] Token refresh implemented
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Rate limiting enabled
- [ ] Scope documentation complete
- [ ] Terms of Service URL provided
- [ ] Privacy Policy URL provided
