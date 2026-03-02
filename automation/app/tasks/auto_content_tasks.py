from app.tasks.worker import celery
from app.services.ai.groq_service import GroqService
from app.database import db
from datetime import datetime

@celery.task
def generate_auto_content(user_id, niche, tone, platforms):

    ai = GroqService()
    content = ai.generate_post(niche, tone)

    post = {
        "user_id": user_id,
        "content": content,
        "platforms": platforms,
        "status": "scheduled",
        "scheduled_time": datetime.utcnow(),
        "created_at": datetime.utcnow()
    }

    db.posts.insert_one(post)