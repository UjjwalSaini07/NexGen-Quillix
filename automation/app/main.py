from fastapi import FastAPI, Request, status
from fastapi.exceptions import HTTPException as FastAPIHTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import logging
import time
import uuid
from typing import Callable

from app.config import settings
from app.database import db_manager, db
from app.core.logging import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger("NexGen-Quillix-Automation")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    
    # Test database connection
    try:
        await db.client.admin.command('ping')
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    db_manager.close()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered social media automation and content publishing platform",
    version=settings.APP_VERSION,
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
    lifespan=lifespan
)

# ==================== Middleware ====================
@app.middleware("http")
async def add_request_id(request: Request, call_next: Callable):
    """Add unique request ID to each request"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next: Callable):
    """Log all incoming requests"""
    start_time = time.time()
    
    # Log request
    logger.info(
        f"Request: {request.method} {request.url.path} "
        f"from {request.client.host if request.client else 'unknown'}"
    )
    
    response = await call_next(request)
    
    # Log response
    process_time = time.time() - start_time
    logger.info(
        f"Response: {request.method} {request.url.path} "
        f"status={response.status_code} duration={process_time:.3f}s"
    )
    
    return response


@app.middleware("http")
async def rate_limit_by_ip(request: Request, call_next: Callable):
    """Simple rate limiting middleware"""
    # Skip for health checks
    if request.url.path in ["/health", "/docs", "/openapi.json", "/redoc"]:
        return await call_next(request)
    
    # Simple in-memory rate limiting (use Redis for production)
    client_ip = request.client.host if request.client else "unknown"

    response = await call_next(request)
    
    # Add rate limit headers
    response.headers["X-RateLimit-Limit"] = str(settings.RATE_LIMIT_PER_MINUTE)
    response.headers["X-RateLimit-Remaining"] = str(settings.RATE_LIMIT_PER_MINUTE - 1)
    
    return response

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining"]
)

# ==================== Exception Handlers ====================
@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "request_id": getattr(request.state, "request_id", None)
        }
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle validation errors"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": str(exc),
            "status_code": 422,
            "request_id": getattr(request.state, "request_id", None)
        }
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions"""
    logger.error(
        f"Unhandled exception: {exc}",
        exc_info=True,
        extra={"request_id": getattr(request.state, "request_id", None)}
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error" if settings.is_production else str(exc),
            "status_code": 500,
            "request_id": getattr(request.state, "request_id", None)
        }
    )


# ==================== Import and Include Routers ====================
from app.routes import auth, posts, social, analytics, ai

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(posts.router, prefix="/posts", tags=["Posts"])
app.include_router(social.router, prefix="/social", tags=["Social Media"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])


# ==================== Health Check ====================
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Check database
    db_status = "healthy"
    try:
        await db.client.admin.command('ping')
    except Exception:
        db_status = "unhealthy"
    
    # Check Redis (if configured)
    redis_status = "not_configured"
    try:
        from app.redis_client import get_redis_client
        redis_client = await get_redis_client()
        await redis_client.ping()
        redis_status = "healthy"
    except Exception:
        redis_status = "not_configured"
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "checks": {
            "database": db_status,
            "redis": redis_status
        }
    }


@app.get("/health/ready")
async def readiness_check():
    """Readiness check for Kubernetes"""
    # Check if database is reachable
    try:
        await db.client.admin.command('ping')
    except Exception:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "not_ready", "reason": "database unavailable"}
        )
    
    return {"status": "ready"}


@app.get("/health/live")
async def liveness_check():
    """Liveness check for Kubernetes"""
    return {"status": "alive"}


# ==================== Root Endpoint ====================
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs" if not settings.is_production else "Documentation not available in production",
        "endpoints": {
            "authentication": "/auth",
            "posts": "/posts",
            "social": "/social",
            "analytics": "/analytics",
            "ai": "/ai",
            "health": "/health"
        },
        "features": [
            "Multi-platform social media management",
            "AI-powered content generation",
            "Scheduled posting",
            "Analytics and insights",
            "Automation rules",
            "OAuth integration"
        ]
    }


# ==================== Run Info ====================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=not settings.is_production,
        log_level=settings.LOG_LEVEL.lower()
    )
