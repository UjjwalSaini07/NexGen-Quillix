from fastapi import APIRouter
from app.database import db
from datetime import datetime

router = APIRouter()

@router.post("/create")
async def create_post(data: dict):
    data["status"] = "draft"
    data["created_at"] = datetime.utcnow()
    result = await db.posts.insert_one(data)
    return {"id": str(result.inserted_id)}