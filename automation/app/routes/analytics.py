"""
Enhanced Analytics Routes for NexGen-Quillix Automation Platform
Complete analytics and reporting functionality
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
import logging

from app.database import db
from app.core.security import get_current_user
from app.models import serialize_doc
from app.services.analytics_service import analytics_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ==================== Response Models ====================

class AnalyticsSummary(BaseModel):
    """Analytics summary response"""
    total_posts: int
    published_posts: int
    scheduled_posts: int
    draft_posts: int
    total_likes: int
    total_comments: int
    total_shares: int
    total_impressions: int
    avg_engagement_rate: float
    platform_breakdown: dict


class PlatformStats(BaseModel):
    """Platform-specific statistics"""
    platform: str
    posts: int
    likes: int
    comments: int
    shares: int
    impressions: int


# ==================== Analytics Endpoints ====================

@router.get("/summary")
async def get_analytics_summary(
    current_user: dict = Depends(get_current_user),
    days: int = Query(30, ge=1, le=365)
):
    """Get analytics summary for the current user"""
    user_id = str(current_user["_id"])
    
    # Calculate date range
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get posts in date range
    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "created_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        }
    ]
    
    status_counts = {}
    async for stat in db.posts.aggregate(pipeline):
        status_counts[stat["_id"]] = stat["count"]
    
    # Get total posts
    total_posts = sum(status_counts.values())
    published_posts = status_counts.get("published", 0)
    scheduled_posts = status_counts.get("scheduled", 0)
    draft_posts = status_counts.get("draft", 0)
    
    # Get analytics data
    analytics_pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "collected_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": None,
                "total_likes": {"$sum": "$likes"},
                "total_comments": {"$sum": "$comments"},
                "total_shares": {"$sum": "$shares"},
                "total_impressions": {"$sum": "$impressions"}
            }
        }
    ]
    
    analytics_result = await db.analytics.aggregate(analytics_pipeline).to_list(length=1)
    
    total_likes = 0
    total_comments = 0
    total_shares = 0
    total_impressions = 0
    
    if analytics_result:
        total_likes = analytics_result[0].get("total_likes", 0)
        total_comments = analytics_result[0].get("total_comments", 0)
        total_shares = analytics_result[0].get("total_shares", 0)
        total_impressions = analytics_result[0].get("total_impressions", 0)
    
    # Calculate engagement rate
    total_engagements = total_likes + total_comments + total_shares
    avg_engagement_rate = (total_engagements / total_impressions * 100) if total_impressions > 0 else 0.0
    
    # Platform breakdown
    platform_pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "collected_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": "$platform",
                "likes": {"$sum": "$likes"},
                "comments": {"$sum": "$comments"},
                "shares": {"$sum": "$shares"},
                "impressions": {"$sum": "$impressions"}
            }
        }
    ]
    
    platform_breakdown = {}
    async for stat in db.analytics.aggregate(platform_pipeline):
        platform_breakdown[stat["_id"]] = {
            "likes": stat.get("likes", 0),
            "comments": stat.get("comments", 0),
            "shares": stat.get("shares", 0),
            "impressions": stat.get("impressions", 0)
        }
    
    return AnalyticsSummary(
        total_posts=total_posts,
        published_posts=published_posts,
        scheduled_posts=scheduled_posts,
        draft_posts=draft_posts,
        total_likes=total_likes,
        total_comments=total_comments,
        total_shares=total_shares,
        total_impressions=total_impressions,
        avg_engagement_rate=round(avg_engagement_rate, 2),
        platform_breakdown=platform_breakdown
    )


@router.get("/platform-stats")
async def get_platform_stats(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    days: int = Query(30, ge=1, le=365)
):
    """Get platform-wise statistics"""
    user_id = str(current_user["_id"])
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = {
        "user_id": user_id,
        "collected_at": {"$gte": start_date}
    }
    
    if platform:
        query["platform"] = platform
    
    pipeline = [
        {"$match": query},
        {
            "$group": {
                "_id": "$platform",
                "posts": {"$sum": 1},
                "likes": {"$sum": "$likes"},
                "comments": {"$sum": "$comments"},
                "shares": {"$sum": "$shares"},
                "impressions": {"$sum": "$impressions"}
            }
        }
    ]
    
    stats = []
    async for stat in db.analytics.aggregate(pipeline):
        stats.append(PlatformStats(
            platform=stat["_id"],
            posts=stat.get("posts", 0),
            likes=stat.get("likes", 0),
            comments=stat.get("comments", 0),
            shares=stat.get("shares", 0),
            impressions=stat.get("impressions", 0)
        ))
    
    return {
        "platforms": stats,
        "period_days": days
    }


@router.get("/performance/{post_id}")
async def get_post_performance(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get performance metrics for a specific post"""
    from bson import ObjectId
    
    user_id = str(current_user["_id"])
    
    try:
        post = await db.posts.find_one({
            "_id": ObjectId(post_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid post ID"
        )
    
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Get analytics for this post
    analytics_pipeline = [
        {
            "$match": {
                "post_id": post_id,
                "user_id": user_id
            }
        },
        {
            "$group": {
                "_id": "$platform",
                "likes": {"$sum": "$likes"},
                "comments": {"$sum": "$comments"},
                "shares": {"$sum": "$shares"},
                "impressions": {"$sum": "$impressions"}
            }
        }
    ]
    
    platform_metrics = {}
    async for stat in db.analytics.aggregate(analytics_pipeline):
        platform_metrics[stat["_id"]] = {
            "likes": stat.get("likes", 0),
            "comments": stat.get("comments", 0),
            "shares": stat.get("shares", 0),
            "impressions": stat.get("impressions", 0)
        }
    
    # Calculate totals
    total_likes = sum(m.get("likes", 0) for m in platform_metrics.values())
    total_comments = sum(m.get("comments", 0) for m in platform_metrics.values())
    total_shares = sum(m.get("shares", 0) for m in platform_metrics.values())
    total_impressions = sum(m.get("impressions", 0) for m in platform_metrics.values())
    
    return serialize_doc({
        "post_id": post_id,
        "content": post.get("content"),
        "platforms": post.get("platforms"),
        "published_at": post.get("published_at"),
        "total_likes": total_likes,
        "total_comments": total_comments,
        "total_shares": total_shares,
        "total_impressions": total_impressions,
        "engagement_rate": round((total_likes + total_comments + total_shares) / total_impressions * 100, 2) if total_impressions > 0 else 0,
        "platform_metrics": platform_metrics
    })


@router.get("/trends")
async def get_engagement_trends(
    current_user: dict = Depends(get_current_user),
    days: int = Query(30, ge=7, le=90),
    interval: str = Query("day", pattern="^(day|week|month)$")
):
    """Get engagement trends over time"""
    user_id = str(current_user["_id"])
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Determine group by interval
    if interval == "day":
        date_format = "%Y-%m-%d"
    elif interval == "week":
        date_format = "%Y-W%V"
    else:
        date_format = "%Y-%m"
    
    pipeline = [
        {
            "$match": {
                "user_id": user_id,
                "collected_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": date_format,
                        "date": "$collected_at"
                    }
                },
                "likes": {"$sum": "$likes"},
                "comments": {"$sum": "$comments"},
                "shares": {"$sum": "$shares"},
                "impressions": {"$sum": "$impressions"}
            }
        },
        {"$sort": {"_id": 1}}
    ]
    
    trends = []
    async for stat in db.analytics.aggregate(pipeline):
        total_engagement = stat.get("likes", 0) + stat.get("comments", 0) + stat.get("shares", 0)
        trends.append({
            "date": stat["_id"],
            "likes": stat.get("likes", 0),
            "comments": stat.get("comments", 0),
            "shares": stat.get("shares", 0),
            "impressions": stat.get("impressions", 0),
            "total_engagement": total_engagement,
            "engagement_rate": round(total_engagement / stat.get("impressions", 1) * 100, 2) if stat.get("impressions", 0) > 0 else 0
        })
    
    return {
        "trends": trends,
        "period_days": days,
        "interval": interval
    }


@router.get("/top-posts")
async def get_top_performing_posts(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    limit: int = Query(10, ge=1, le=50),
    days: int = Query(30, ge=1, le=365)
):
    """Get top performing posts"""
    user_id = str(current_user["_id"])
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Get published posts
    post_query = {
        "user_id": user_id,
        "status": "published",
        "published_at": {"$gte": start_date}
    }
    
    if platform:
        post_query["platforms"] = platform
    
    posts = await db.posts.find(post_query).sort("created_at", -1).limit(limit * 2).to_list(length=limit * 2)
    
    # Get analytics for each post
    top_posts = []
    for post in posts:
        post_id = str(post["_id"])
        
        analytics_pipeline = [
            {"$match": {"post_id": post_id, "user_id": user_id}},
            {
                "$group": {
                    "_id": None,
                    "likes": {"$sum": "$likes"},
                    "comments": {"$sum": "$comments"},
                    "shares": {"$sum": "$shares"},
                    "impressions": {"$sum": "$impressions"}
                }
            }
        ]
        
        analytics_result = await db.analytics.aggregate(analytics_pipeline).to_list(length=1)
        
        if analytics_result:
            likes = analytics_result[0].get("likes", 0)
            comments = analytics_result[0].get("comments", 0)
            shares = analytics_result[0].get("shares", 0)
            impressions = analytics_result[0].get("impressions", 0)
            
            total_engagement = likes + comments + shares
            
            top_posts.append({
                "post_id": post_id,
                "content": post.get("content", "")[:100],
                "platforms": post.get("platforms"),
                "published_at": post.get("published_at"),
                "likes": likes,
                "comments": comments,
                "shares": shares,
                "impressions": impressions,
                "total_engagement": total_engagement,
                "engagement_rate": round(total_engagement / impressions * 100, 2) if impressions > 0 else 0
            })
    
    # Sort by engagement and return top N
    top_posts.sort(key=lambda x: x["total_engagement"], reverse=True)
    
    return {
        "top_posts": top_posts[:limit],
        "period_days": days
    }


@router.post("/track")
async def track_post_metrics(
    post_id: str,
    platform: str,
    metrics: dict,
    current_user: dict = Depends(get_current_user)
):
    """Track metrics for a post"""
    from bson import ObjectId
    
    user_id = str(current_user["_id"])
    
    analytics_doc = {
        "user_id": user_id,
        "post_id": post_id,
        "platform": platform,
        "likes": metrics.get("likes", 0),
        "comments": metrics.get("comments", 0),
        "shares": metrics.get("shares", 0),
        "impressions": metrics.get("impressions", 0),
        "reach": metrics.get("reach", 0),
        "collected_at": datetime.utcnow()
    }
    
    result = await db.analytics.insert_one(analytics_doc)
    
    return {
        "message": "Metrics tracked",
        "analytics_id": str(result.inserted_id)
    }


# ==================== Advanced Analytics Endpoints ====================


@router.get("/time-series")
async def get_time_series_analytics(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    days: int = Query(30, ge=7, le=365),
    granularity: str = Query("daily", pattern="^(daily|weekly|monthly)$")
):
    """
    Get time-series analytics with configurable granularity
    
    Returns daily/weekly/monthly engagement data for charts
    """
    user_id = str(current_user["_id"])
    
    results = await analytics_service.get_time_series_analytics(
        user_id=user_id,
        platform=platform,
        days=days,
        granularity=granularity
    )
    
    return {
        "time_series": results,
        "period_days": days,
        "granularity": granularity
    }


@router.get("/top-posts")
async def get_top_posts(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    days: int = Query(30, ge=7, le=365),
    limit: int = Query(10, ge=1, le=50),
    sort_by: str = Query("engagement", pattern="^(engagement|likes|comments|shares|impressions)$")
):
    """
    Get top performing posts based on engagement metrics
    """
    user_id = str(current_user["_id"])
    
    posts = await analytics_service.get_top_performing_posts(
        user_id=user_id,
        platform=platform,
        days=days,
        limit=limit,
        sort_by=sort_by
    )
    
    return {
        "top_posts": posts,
        "period_days": days,
        "sort_by": sort_by
    }


@router.get("/audience-insights")
async def get_audience_insights(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    days: int = Query(30, ge=7, le=365)
):
    """
    Get audience engagement insights
    
    Returns:
    - Best posting times (hourly)
    - Best posting days (weekly)
    - Platform comparison
    - Content type performance
    """
    user_id = str(current_user["_id"])
    
    insights = await analytics_service.get_audience_insights(
        user_id=user_id,
        platform=platform,
        days=days
    )
    
    return insights


@router.get("/predictions")
async def get_predictive_insights(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    days: int = Query(30, ge=14, le=365)
):
    """
    Get predictive analytics and trend insights
    
    Returns:
    - Trend direction (up/down/stable)
    - Percentage changes in engagement
    - AI-generated predictions
    """
    user_id = str(current_user["_id"])
    
    predictions = await analytics_service.get_predictive_insights(
        user_id=user_id,
        platform=platform,
        days=days
    )
    
    return predictions


@router.get("/engagement-metrics")
async def get_engagement_metrics(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    days: int = Query(30, ge=7, le=365)
):
    """
    Get detailed engagement metrics for charts
    """
    user_id = str(current_user["_id"])
    
    metrics = await analytics_service.get_engagement_metrics(
        user_id=user_id,
        platform=platform,
        days=days
    )
    
    return {
        "metrics": metrics,
        "period_days": days
    }


@router.get("/growth-metrics")
async def get_growth_metrics(
    current_user: dict = Depends(get_current_user),
    platform: Optional[str] = None,
    days: int = Query(30, ge=7, le=365)
):
    """
    Get growth metrics over time
    """
    user_id = str(current_user["_id"])
    
    growth = await analytics_service.get_growth_metrics(
        user_id=user_id,
        platform=platform,
        days=days
    )
    
    return growth


# ==================== Health Check ====================

@router.get("/health")
async def analytics_health():
    """Analytics service health check"""
    return {
        "status": "healthy",
        "service": "analytics"
    }
