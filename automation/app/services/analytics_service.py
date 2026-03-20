import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from collections import defaultdict
from app.database import db
from app.models import serialize_doc

logger = logging.getLogger(__name__)


class AdvancedAnalyticsService:
    """Advanced analytics service for comprehensive insights"""
    
    async def get_time_series_analytics(
        self,
        user_id: str,
        platform: Optional[str] = None,
        days: int = 30,
        granularity: str = "daily"
    ) -> List[Dict[str, Any]]:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Build match query
        match_query = {
            "user_id": user_id,
            "collected_at": {"$gte": start_date}
        }
        if platform:
            match_query["platform"] = platform
        
        # Determine group format based on granularity
        if granularity == "daily":
            date_format = "%Y-%m-%d"
        elif granularity == "weekly":
            date_format = "%Y-W%W"
        elif granularity == "monthly":
            date_format = "%Y-%m"
        else:
            date_format = "%Y-%m-%d"
        
        pipeline = [
            {"$match": match_query},
            {
                "$group": {
                    "_id": {
                        "date": {"$dateToString": {"format": date_format, "date": "$collected_at"}},
                        "platform": "$platform"
                    },
                    "posts_count": {"$sum": 1},
                    "total_likes": {"$sum": "$likes"},
                    "total_comments": {"$sum": "$comments"},
                    "total_shares": {"$sum": "$shares"},
                    "total_impressions": {"$sum": "$impressions"},
                    "total_reach": {"$sum": "$reach"},
                    "total_saves": {"$sum": "$saves"},
                }
            },
            {"$sort": {"_id.date": 1}}
        ]
        
        results = []
        async for doc in db.analytics.aggregate(pipeline):
            total_engagement = (
                doc.get("total_likes", 0) + 
                doc.get("total_comments", 0) + 
                doc.get("total_shares", 0)
            )
            impressions = doc.get("total_impressions", 0)
            
            results.append({
                "date": doc["_id"]["date"],
                "platform": doc["_id"]["platform"],
                "posts_count": doc.get("posts_count", 0),
                "likes": doc.get("total_likes", 0),
                "comments": doc.get("total_comments", 0),
                "shares": doc.get("total_shares", 0),
                "saves": doc.get("total_saves", 0),
                "impressions": impressions,
                "reach": doc.get("total_reach", 0),
                "engagement": total_engagement,
                "engagement_rate": round((total_engagement / impressions * 100), 2) if impressions > 0 else 0
            })
        
        return results
    
    async def get_top_performing_posts(
        self,
        user_id: str,
        platform: Optional[str] = None,
        days: int = 30,
        limit: int = 10,
        sort_by: str = "engagement"
    ) -> List[Dict[str, Any]]:
        """
        Get top performing posts based on engagement metrics
        
        Args:
            user_id: The user ID
            platform: Optional platform filter
            days: Number of days to look back
            limit: Number of posts to return
            sort_by: Metric to sort by (engagement, likes, comments, shares, impressions)
        """
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get posts with their analytics
        pipeline = [
            {
                "$match": {
                    "user_id": user_id,
                    "status": "published",
                    "published_at": {"$gte": start_date}
                }
            },
            {
                "$lookup": {
                    "from": "analytics",
                    "let": {"post_id": "$_id"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {"$eq": ["$post_id", "$$post_id"]},
                                "collected_at": {"$gte": start_date}
                            }
                        },
                        {
                            "$group": {
                                "_id": None,
                                "total_likes": {"$sum": "$likes"},
                                "total_comments": {"$sum": "$comments"},
                                "total_shares": {"$sum": "$shares"},
                                "total_impressions": {"$sum": "$impressions"},
                                "total_reach": {"$sum": "$reach"},
                                "total_saves": {"$sum": "$saves"},
                                "record_count": {"$sum": 1}
                            }
                        }
                    ],
                    "as": "analytics_data"
                }
            },
            {"$unwind": {"path": "$analytics_data", "preserveNullAndEmptyArrays": True}},
            {
                "$addFields": {
                    "engagement": {
                        "$add": [
                            {"$ifNull": ["$analytics_data.total_likes", 0]},
                            {"$ifNull": ["$analytics_data.total_comments", 0]},
                            {"$ifNull": ["$analytics_data.total_shares", 0]}
                        ]
                    }
                }
            },
            {"$sort": {sort_by: -1}},
            {"$limit": limit},
            {
                "$project": {
                    "_id": 1,
                    "content": 1,
                    "platforms": 1,
                    "published_at": 1,
                    "media_urls": 1,
                    "likes": {"$ifNull": ["$analytics_data.total_likes", 0]},
                    "comments": {"$ifNull": ["$analytics_data.total_comments", 0]},
                    "shares": {"$ifNull": ["$analytics_data.total_shares", 0]},
                    "impressions": {"$ifNull": ["$analytics_data.total_impressions", 0]},
                    "reach": {"$ifNull": ["$analytics_data.total_reach", 0]},
                    "saves": {"$ifNull": ["$analytics_data.total_saves", 0]},
                    "engagement": 1,
                    "engagement_rate": {
                        "$cond": {
                            "if": {"$gt": ["$analytics_data.total_impressions", 0]},
                            "then": {
                                "$multiply": [
                                    {"$divide": ["$engagement", "$analytics_data.total_impressions"]},
                                    100
                                ]
                            },
                            "else": 0
                        }
                    }
                }
            }
        ]
        
        results = []
        async for doc in db.posts.aggregate(pipeline):
            results.append(serialize_doc(doc))
        
        return results
    
    async def get_audience_insights(
        self,
        user_id: str,
        platform: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get audience engagement insights
        
        Returns insights on:
        - Best posting times
        - Content type performance
        - Hashtag performance
        - Platform comparison
        """
        start_date = datetime.utcnow() - timedelta(days=days)
        
        match_query = {
            "user_id": user_id,
            "collected_at": {"$gte": start_date}
        }
        if platform:
            match_query["platform"] = platform
        
        # 1. Best posting times (hour of day)
        hourly_pipeline = [
            {"$match": match_query},
            {
                "$group": {
                    "_id": {"$hour": "$collected_at"},
                    "total_engagement": {
                        "$sum": {"$add": ["$likes", "$comments", "$shares"]}
                    },
                    "total_impressions": {"$sum": "$impressions"},
                    "post_count": {"$sum": 1}
                }
            },
            {"$sort": {"total_engagement": -1}},
            {"$limit": 10}
        ]
        
        hourly_insights = []
        async for doc in db.analytics.aggregate(hourly_pipeline):
            hourly_insights.append({
                "hour": doc["_id"],
                "engagement": doc.get("total_engagement", 0),
                "impressions": doc.get("total_impressions", 0),
                "posts": doc.get("post_count", 0)
            })
        
        # 2. Best posting days
        daily_pipeline = [
            {"$match": match_query},
            {
                "$group": {
                    "_id": {"$dayOfWeek": "$collected_at"},
                    "total_engagement": {
                        "$sum": {"$add": ["$likes", "$comments", "$shares"]}
                    },
                    "total_impressions": {"$sum": "$impressions"},
                    "post_count": {"$sum": 1}
                }
            },
            {"$sort": {"total_engagement": -1}}
        ]
        
        day_names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        daily_insights = []
        async for doc in db.analytics.aggregate(daily_pipeline):
            daily_insights.append({
                "day": day_names[doc["_id"] - 1],
                "day_num": doc["_id"],
                "engagement": doc.get("total_engagement", 0),
                "impressions": doc.get("total_impressions", 0),
                "posts": doc.get("post_count", 0)
            })
        
        # 3. Platform comparison
        platform_pipeline = [
            {"$match": match_query},
            {
                "$group": {
                    "_id": "$platform",
                    "total_likes": {"$sum": "$likes"},
                    "total_comments": {"$sum": "$comments"},
                    "total_shares": {"$sum": "$shares"},
                    "total_impressions": {"$sum": "$impressions"},
                    "post_count": {"$sum": 1}
                }
            },
            {"$sort": {"total_impressions": -1}}
        ]
        
        platform_insights = []
        async for doc in db.analytics.aggregate(platform_pipeline):
            engagement = doc.get("total_likes", 0) + doc.get("total_comments", 0) + doc.get("total_shares", 0)
            platform_insights.append({
                "platform": doc["_id"],
                "likes": doc.get("total_likes", 0),
                "comments": doc.get("total_comments", 0),
                "shares": doc.get("total_shares", 0),
                "impressions": doc.get("total_impressions", 0),
                "engagement": engagement,
                "engagement_rate": round((engagement / doc.get("total_impressions", 1)) * 100, 2) if doc.get("total_impressions", 0) > 0 else 0,
                "posts": doc.get("post_count", 0)
            })
        
        # 4. Content type performance
        content_pipeline = [
            {"$match": match_query},
            {
                "$group": {
                    "_id": "$content_type",
                    "total_likes": {"$sum": "$likes"},
                    "total_comments": {"$sum": "$comments"},
                    "total_shares": {"$sum": "$shares"},
                    "total_impressions": {"$sum": "$impressions"},
                    "post_count": {"$sum": 1}
                }
            },
            {"$sort": {"total_impressions": -1}}
        ]
        
        content_insights = []
        async for doc in db.analytics.aggregate(content_pipeline):
            engagement = doc.get("total_likes", 0) + doc.get("total_comments", 0) + doc.get("total_shares", 0)
            content_insights.append({
                "type": doc["_id"] or "post",
                "likes": doc.get("total_likes", 0),
                "comments": doc.get("total_comments", 0),
                "shares": doc.get("total_shares", 0),
                "impressions": doc.get("total_impressions", 0),
                "engagement": engagement,
                "posts": doc.get("post_count", 0)
            })
        
        return {
            "best_posting_times": hourly_insights,
            "best_posting_days": daily_insights,
            "platform_comparison": platform_insights,
            "content_type_performance": content_insights,
            "period_days": days
        }
    
    async def get_predictive_insights(
        self,
        user_id: str,
        platform: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get predictive insights based on historical data
        """
        start_date = datetime.utcnow() - timedelta(days=days)
        
        match_query = {
            "user_id": user_id,
            "collected_at": {"$gte": start_date}
        }
        if platform:
            match_query["platform"] = platform
        
        # Get recent trends (last 7 days vs previous 7 days)
        recent_start = datetime.utcnow() - timedelta(days=7)
        older_start = datetime.utcnow() - timedelta(days=14)
        
        # Recent period
        recent_pipeline = [
            {"$match": {**match_query, "collected_at": {"$gte": recent_start}}},
            {
                "$group": {
                    "_id": None,
                    "total_likes": {"$sum": "$likes"},
                    "total_comments": {"$sum": "$comments"},
                    "total_shares": {"$sum": "$shares"},
                    "total_impressions": {"$sum": "$impressions"},
                    "post_count": {"$sum": 1}
                }
            }
        ]
        
        # Older period
        older_pipeline = [
            {"$match": {**match_query, "collected_at": {"$gte": older_start, "$lt": recent_start}}},
            {
                "$group": {
                    "_id": None,
                    "total_likes": {"$sum": "$likes"},
                    "total_comments": {"$sum": "$comments"},
                    "total_shares": {"$sum": "$shares"},
                    "total_impressions": {"$sum": "$impressions"},
                    "post_count": {"$sum": 1}
                }
            }
        ]
        
        recent_data = await db.analytics.aggregate(recent_pipeline).to_list(length=1)
        older_data = await db.analytics.aggregate(older_pipeline).to_list(length=1)
        
        recent = recent_data[0] if recent_data else {}
        older = older_data[0] if older_data else {}
        
        def calc_change(current, previous):
            if previous == 0:
                return 100.0 if current > 0 else 0.0
            return round(((current - previous) / previous) * 100, 2)
        
        # Calculate trends
        likes_change = calc_change(recent.get("total_likes", 0), older.get("total_likes", 0))
        comments_change = calc_change(recent.get("total_comments", 0), older.get("total_comments", 0))
        shares_change = calc_change(recent.get("total_shares", 0), older.get("total_shares", 0))
        impressions_change = calc_change(recent.get("total_impressions", 0), older.get("total_impressions", 0))
        
        # Determine trend direction
        avg_change = (likes_change + comments_change + shares_change + impressions_change) / 4
        
        trend_direction = "up" if avg_change > 5 else "down" if avg_change < -5 else "stable"
        
        return {
            "trend_direction": trend_direction,
            "overall_change": round(avg_change, 2),
            "likes_change": likes_change,
            "comments_change": comments_change,
            "shares_change": shares_change,
            "impressions_change": impressions_change,
            "recent_period": {
                "likes": recent.get("total_likes", 0),
                "comments": recent.get("total_comments", 0),
                "shares": recent.get("total_shares", 0),
                "impressions": recent.get("total_impressions", 0),
                "posts": recent.get("post_count", 0)
            },
            "previous_period": {
                "likes": older.get("total_likes", 0),
                "comments": older.get("total_comments", 0),
                "shares": older.get("total_shares", 0),
                "impressions": older.get("total_impressions", 0),
                "posts": older.get("post_count", 0)
            },
            "prediction": self._generate_prediction(trend_direction, avg_change),
            "period_days": days
        }
    
    def _generate_prediction(self, trend_direction: str, change: float) -> str:
        """Generate a prediction based on trend data"""
        if trend_direction == "up":
            return "Your engagement is trending upward! Continue your current strategy for better results."
        elif trend_direction == "down":
            return "Engagement is declining. Consider varying your content type or posting times."
        else:
            return "Engagement is stable. Try new content formats or engagement strategies to boost growth."

    async def get_engagement_metrics(
        self,
        user_id: str,
        platform: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get detailed engagement metrics for charts
        """
        start_date = datetime.utcnow() - timedelta(days=days)
        
        match_query = {
            "user_id": user_id,
            "collected_at": {"$gte": start_date}
        }
        if platform:
            match_query["platform"] = platform
        
        pipeline = [
            {"$match": match_query},
            {
                "$group": {
                    "_id": {
                        "date": {"$dateToString": {"format": "%Y-%m-%d", "date": "$collected_at"}},
                        "platform": "$platform"
                    },
                    "likes": {"$sum": "$likes"},
                    "comments": {"$sum": "$comments"},
                    "shares": {"$sum": "$shares"},
                    "impressions": {"$sum": "$impressions"},
                    "reach": {"$sum": "$reach"},
                    "saves": {"$sum": "$saves"},
                }
            },
            {"$sort": {"_id.date": 1}}
        ]
        
        results = []
        async for doc in db.analytics.aggregate(pipeline):
            engagement = doc.get("likes", 0) + doc.get("comments", 0) + doc.get("shares", 0)
            impressions = doc.get("impressions", 0) or 1
            results.append({
                "date": doc["_id"]["date"],
                "platform": doc["_id"]["platform"],
                "likes": doc.get("likes", 0),
                "comments": doc.get("comments", 0),
                "shares": doc.get("shares", 0),
                "saves": doc.get("saves", 0),
                "impressions": doc.get("impressions", 0),
                "reach": doc.get("reach", 0),
                "engagement": engagement,
                "engagement_rate": round((engagement / impressions) * 100, 2)
            })
        
        return results
    
    async def get_growth_metrics(
        self,
        user_id: str,
        platform: Optional[str] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """
        Get growth metrics over time
        """
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get follower growth (simulated - would need real API data)
        match_query = {
            "user_id": user_id,
            "collected_at": {"$gte": start_date}
        }
        if platform:
            match_query["platform"] = platform
        
        pipeline = [
            {"$match": match_query},
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$collected_at"}},
                    "total_impressions": {"$sum": "$impressions"},
                    "total_reach": {"$sum": "$reach"},
                    "total_engagement": {"$sum": {"$add": ["$likes", "$comments", "$shares"]}},
                    "post_count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}}
        ]
        
        results = []
        cumulative_impressions = 0
        cumulative_reach = 0
        
        async for doc in db.analytics.aggregate(pipeline):
            cumulative_impressions += doc.get("total_impressions", 0)
            cumulative_reach += doc.get("total_reach", 0)
            results.append({
                "date": doc["_id"],
                "impressions": doc.get("total_impressions", 0),
                "reach": doc.get("total_reach", 0),
                "engagement": doc.get("total_engagement", 0),
                "posts": doc.get("post_count", 0),
                "cumulative_impressions": cumulative_impressions,
                "cumulative_reach": cumulative_reach
            })
        
        # Calculate growth rate
        if len(results) > 1:
            first_period = results[0]["cumulative_impressions"] or 1
            last_period = results[-1]["cumulative_impressions"]
            growth_rate = ((last_period - first_period) / first_period) * 100 if first_period > 0 else 0
        else:
            growth_rate = 0
        
        return {
            "daily_data": results,
            "growth_rate": round(growth_rate, 2),
            "total_impressions": cumulative_impressions,
            "total_reach": cumulative_reach
        }


# Singleton instance
analytics_service = AdvancedAnalyticsService()
