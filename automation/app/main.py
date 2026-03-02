from fastapi import FastAPI
from app.routes import auth, posts, social, analytics, ai
from app.core.logging import setup_logging

setup_logging()

app = FastAPI()

app.include_router(auth.router, prefix="/auth")
app.include_router(posts.router, prefix="/posts")
app.include_router(social.router, prefix="/social")
app.include_router(analytics.router, prefix="/analytics")
app.include_router(ai.router, prefix="/ai")