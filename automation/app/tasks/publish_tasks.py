from app.tasks.worker import celery
from app.database import db
from datetime import datetime

@celery.task
def publish_scheduled_posts():

    now = datetime.utcnow()

    posts = db.posts.find({
        "status": "scheduled",
        "scheduled_time": {"$lte": now}
    })

    for post in posts:
        # dynamically call platform service
        pass