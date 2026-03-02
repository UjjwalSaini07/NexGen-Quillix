from datetime import datetime

def analytics_schema(post_id, platform, metrics):
    return {
        "post_id": post_id,
        "platform": platform,
        "likes": metrics.get("likes", 0),
        "comments": metrics.get("comments", 0),
        "shares": metrics.get("shares", 0),
        "impressions": metrics.get("impressions", 0),
        "collected_at": datetime.utcnow()
    }