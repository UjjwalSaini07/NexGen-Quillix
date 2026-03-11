from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import auth, posts, social, analytics, ai
from app.core.logging import setup_logging
import logging

setup_logging()
logger = logging.getLogger("NexGenQuillixAutomation")

app = FastAPI(
    title="NexGen-Quillix Automation API",
    description="AI-powered social media automation and content publishing platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://nexgenquillix.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(posts.router, prefix="/posts", tags=["Posts"])
app.include_router(social.router, prefix="/social", tags=["Social"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(ai.router, prefix="/ai", tags=["AI"])

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "NexGen-Quillix Automation API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to NexGen-Quillix Automation API",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth",
            "posts": "/posts",
            "social": "/social",
            "analytics": "/analytics",
            "ai": "/ai"
        }
    }
