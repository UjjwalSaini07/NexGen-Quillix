from datetime import datetime

def user_schema(email, password_hash):
    return {
        "email": email,
        "password_hash": password_hash,
        "created_at": datetime.utcnow()
    }