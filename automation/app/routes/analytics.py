from fastapi import APIRouter, HTTPException
from app.database import db
from bson import ObjectId
import json

router = APIRouter()

def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(v) if isinstance(v, (dict, ObjectId)) else v for v in value]
            else:
                result[key] = value
        return result
    return doc

@router.get("/summary")
async def get_summary(user_id: str):
    """Get analytics summary for a user"""
    try:
        posts = []
        async for post in db.posts.find({"user_id": user_id}):
            posts.append(serialize_doc(post))
        return {"total_posts": len(posts), "posts": posts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance/{post_id}")
async def get_post_performance(post_id: str):
    """Get performance metrics for a specific post"""
    try:
        post = await db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        return serialize_doc(post)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/platform-stats")
async def get_platform_stats(user_id: str):
    """Get platform-wise statistics"""
    try:
        pipeline = [
            {"$match": {"user_id": user_id}},
            {"$unwind": "$platforms"},
            {"$group": {"_id": "$platforms", "count": {"$sum": 1}}},
            {"$project": {"platform": "$_id", "count": 1, "_id": 0}}
        ]
        stats = []
        async for stat in db.posts.aggregate(pipeline):
            stats.append(stat)
        return {"platforms": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))