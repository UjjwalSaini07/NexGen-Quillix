from datetime import datetime

def post_schema(user_id, content, platforms, media_url=None):
    return {
        "user_id": user_id,
        "content": content,
        "media_url": media_url,
        "platforms": platforms,
        "status": "draft",
        "scheduled_time": None,
        "created_at": datetime.utcnow()
    }