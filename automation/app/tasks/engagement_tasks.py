from app.tasks.worker import celery
from app.services.platform.factory import PlatformFactory
from app.services.engagement.engagement_engine import EngagementEngine
from app.database import db

@celery.task
def monitor_engagement(user_id):

    accounts = db.social_accounts.find({"user_id": user_id})
    engine = EngagementEngine()

    for account in accounts:
        service = PlatformFactory.get_service(account["platform"], account)
        comments = service.fetch_comments()

        for comment in comments:
            engine.process_comment(service, comment)