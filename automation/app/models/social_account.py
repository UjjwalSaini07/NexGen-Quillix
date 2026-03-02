from datetime import datetime

def social_account_schema(user_id, platform, access_token, refresh_token):
    return {
        "user_id": user_id,
        "platform": platform,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_at": None,
        "created_at": datetime.utcnow()
    }