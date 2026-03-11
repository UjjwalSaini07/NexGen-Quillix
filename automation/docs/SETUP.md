# Setup Guide - NexGen-Quillix Automation Platform

This guide covers the complete setup process for the NexGen-Quillix Automation Platform backend.

## Prerequisites

### System Requirements
- **Python**: 3.10 or higher
- **MongoDB**: 5.0 or higher
- **Redis**: 6.0 or higher (optional but recommended)
- **Node.js**: 18+ (for frontend)

### Required Accounts
1. **MongoDB Atlas** or local MongoDB installation
2. **Redis Cloud** or local Redis installation
3. **Groq API Key** (for AI features)
4. **OAuth Credentials** for each social platform:
   - Facebook/Meta Developer Account
   - Google Developer Console (YouTube)
   - LinkedIn Developer Account
   - Twitter/X Developer Account


## Installation Steps

### 1. Clone the Repository

```bash
  git clone https://github.com/UjjwalSaini07/NexGen-Quillix.git
```
```bash
  cd NexGen-Quillix/automation
```

### 2. Create Virtual Environment

```bash
  python -m venv venv
```
```bash
  venv\Scripts\activate
```

### 3. Install Dependencies

```bash
  pip install -r requirements.txt
```


## Environment Variables Configuration

Create a `.env` file in the `automation` directory:

### Application Settings
```env
# Application
APP_NAME="NexGen-Quillix Automation API"
ENVIRONMENT=development  # or production
DEBUG=true

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_REFRESH_EXPIRATION_DAYS=30

# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/nexgen_quillix
MONGO_DB_NAME=nexgen_quillix

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_CACHE_TTL=300
```

### OAuth Credentials (Platform-Specific)

#### Facebook/Meta
```env
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:8000/auth/oauth/facebook/callback
```

#### Instagram
```env
INSTAGRAM_CLIENT_ID=your-instagram-app-id
INSTAGRAM_CLIENT_SECRET=your-instagram-app-secret
INSTAGRAM_REDIRECT_URI=http://localhost:8000/auth/oauth/instagram/callback
```

#### LinkedIn
```env
LINKEDIN_CLIENT_ID=your-linkedin-app-id
LINKEDIN_CLIENT_SECRET=your-linkedin-app-secret
LINKEDIN_REDIRECT_URI=http://localhost:8000/auth/oauth/linkedin/callback
```

#### X (Twitter)
```env
X_CLIENT_ID=your-x-app-id
X_CLIENT_SECRET=your-x-app-secret
X_REDIRECT_URI=http://localhost:8000/auth/oauth/x/callback
```

#### Google (YouTube)
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/oauth/youtube/callback
```

#### WhatsApp
```env
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-whatsapp-business-account-id
```

### AI Services
```env
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key  # optional
```

### Email (Optional - for notifications)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
```

### CORS & Rate Limiting
```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000

# Logging
LOG_LEVEL=INFO
LOG_FILE_PATH=./logs/app.log
```


## Database Setup

### MongoDB Atlas Setup (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Get connection string
5. Add IP to whitelist (0.0.0.0 for development)

### Local MongoDB Setup
```bash
  sudo apt update
```
```bash
  sudo apt install mongodb
```
```bash
  sudo systemctl start mongodb
```
```bash
  mongosh
```

## Redis Setup

### Local Redis
```bash
  # Install Redis (Ubuntu)
  sudo apt update
  sudo apt install redis-server
```
```bash
  # Start Redis
  sudo systemctl start redis-server
```
```bash
  redis-cli ping
```

### Redis Cloud
1. Create Redis Cloud account
2. Create a new subscription
3. Get connection details
4. Update REDIS_URL in .env


## Running the Application

### Development Mode
```bash
# Using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode
```bash
# Using gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Or with systemd service
sudo cp automation.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl start automation
```


## Docker Deployment

### Using Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  automation:
    build: ./automation
    ports:
      - "8000:8000"
    environment:
      - MONGO_URL=mongodb://mongodb:27017/nexgen_quillix
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./automation:/app

volumes:
  mongodb_data:
```

```bash
# Build and run
docker-compose up -d
```


## Verify Installation

### Health Check Endpoints
- Basic health check
```bash
  curl http://localhost:8000/health
```
- Readiness check
```bash
  curl http://localhost:8000/health/ready
```
- Liveness check
```bash
  curl http://localhost:8000/health/live
```

### API Documentation
Access the interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc


## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```bash
  # Check MongoDB status
  mongosh --eval "db.adminCommand('ping')"

  # Verify connection string
  echo $MONGO_URL
```

#### 2. Redis Connection Error
```bash
  # Check Redis
  redis-cli ping

  # Verify connection string
  echo $REDIS_URL
```

#### 3. Import Errors
```bash
  pip install -r requirements.txt --force-reinstall
```

#### 4. OAuth Redirect Issues
- Ensure redirect URIs match exactly in both .env and platform developer console
- For localhost, use `http://127.0.0.1` consistently


## Next Steps

1. Read the [API Reference](./API-REFERENCE.md) for endpoint details
2. Check [OAuth Guide](./OAUTH_GUIDE.md) for platform-specific setup
3. Review [Architecture](./ARCHITECTURE.md) for system design
4. Explore [Design Patterns](./PATTERNS.md) for implementation details
