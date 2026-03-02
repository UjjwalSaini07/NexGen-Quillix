from fastapi import Depends, HTTPException
from jose import jwt
from app.config import settings
from app.database import db

async def get_current_user(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        user = await db.users.find_one({"email": payload["sub"]})
        return user
    except:
        raise HTTPException(status_code=401, detail="Invalid token")