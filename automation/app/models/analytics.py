from datetime import datetime
from typing import Dict, Any, Optional


def analytics_schema(post_id: str, platform: str, metrics: Dict[str, Any], user_id: str = None) -> Dict[str, Any]:
    """
    Create analytics schema for post metrics
    
    Args:
        post_id: The ID of the post
        platform: The social media platform
        metrics: Dictionary containing likes, comments, shares, impressions, reach, etc.
        user_id: Optional user ID for the analytics record
    """
    return {
        "post_id": post_id,
        "platform": platform,
        "user_id": user_id,
        # Engagement metrics
        "likes": metrics.get("likes", 0),
        "comments": metrics.get("comments", 0),
        "shares": metrics.get("shares", 0),
        "saves": metrics.get("saves", 0),
        "views": metrics.get("views", 0),
        # Reach metrics
        "impressions": metrics.get("impressions", 0),
        "reach": metrics.get("reach", 0),
        "follower_count": metrics.get("follower_count", 0),
        # Engagement rates
        "engagement_rate": metrics.get("engagement_rate", 0.0),
        "like_rate": metrics.get("like_rate", 0.0),
        "comment_rate": metrics.get("comment_rate", 0.0),
        "share_rate": metrics.get("share_rate", 0.0),
        # Video metrics (if applicable)
        "video_views": metrics.get("video_views", 0),
        "video_watches": metrics.get("video_watches", 0),
        "avg_watch_time": metrics.get("avg_watch_time", 0),
        # Content info
        "content_type": metrics.get("content_type", "post"),  # post, story, reel, video
        "media_count": metrics.get("media_count", 0),
        "has_hashtags": metrics.get("has_hashtags", False),
        "has_mentions": metrics.get("has_mentions", False),
        "has_links": metrics.get("has_links", False),
        # Timing
        "posted_hour": metrics.get("posted_hour", 0),
        "posted_day": metrics.get("posted_day", 0),
        # Collection time
        "collected_at": datetime.utcnow(),
        "created_at": datetime.utcnow()
    }


def engagement_trend_schema(platform: str, period: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create engagement trend schema for time-series analytics
    """
    return {
        "platform": platform,
        "period": period,  # daily, weekly, monthly
        "date": metrics.get("date"),
        "posts_count": metrics.get("posts_count", 0),
        "total_likes": metrics.get("total_likes", 0),
        "total_comments": metrics.get("total_comments", 0),
        "total_shares": metrics.get("total_shares", 0),
        "total_impressions": metrics.get("total_impressions", 0),
        "total_reach": metrics.get("total_reach", 0),
        "avg_engagement_rate": metrics.get("avg_engagement_rate", 0.0),
        "created_at": datetime.utcnow()
    }


def audience_insight_schema(
    platform: str,
    insight_type: str,
    data: Dict[str, Any],
    user_id: str = None
) -> Dict[str, Any]:
    """
    Create audience insight schema
    """
    return {
        "platform": platform,
        "user_id": user_id,
        "insight_type": insight_type,  # demographics, growth, peak_times, etc.
        "data": data,
        "collected_at": datetime.utcnow()
    }
