from celery import Celery
from app.config import settings

celery = Celery(
    "social_ai",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)