from fastapi import APIRouter
from app.database import db

router = APIRouter()

@router.get("/summary")
async def get_summary(user_id: str):
    posts = db.posts.find({"user_id": user_id})
    return [post async for post in posts]