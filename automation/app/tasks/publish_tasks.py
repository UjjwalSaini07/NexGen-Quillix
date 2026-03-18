from app.tasks.worker import celery
from app.database import db
from datetime import datetime
from bson import ObjectId
import pytz

@celery.task
def publish_scheduled_posts():
    """Publish scheduled posts that have reached their scheduled time"""
    
    # Use local timezone for comparison
    try:
        local_tz = pytz.timezone('Asia/Calcutta')  # Default to India timezone
    except:
        local_tz = pytz.UTC
    
    now_utc = datetime.utcnow()
    
    # Get all scheduled posts first (we'll filter in Python for local time handling)
    posts = list(db.posts.find({
        "status": "scheduled"
    }))
    
    # Filter posts that are due (considering local time)
    due_posts = []
    for post in posts:
        scheduled_time = post.get("scheduled_time")
        if not scheduled_time:
            continue
        
        # Convert scheduled_time to UTC for comparison
        if isinstance(scheduled_time, str):
            if 'Z' in scheduled_time or '+' in scheduled_time or scheduled_time.endswith('+00:00'):
                # Already has timezone info
                try:
                    scheduled_time_utc = datetime.fromisoformat(scheduled_time.replace('Z', '+00:00')).astimezone(pytz.UTC)
                except:
                    continue
            else:
                # Parse as naive datetime (local time from frontend)
                try:
                    scheduled_time_naive = datetime.strptime(scheduled_time, '%Y-%m-%dT%H:%M:%S')
                    scheduled_time_utc = local_tz.localize(scheduled_time_naive).astimezone(pytz.UTC)
                except:
                    continue
        elif hasattr(scheduled_time, 'tzinfo') and scheduled_time.tzinfo is not None:
            scheduled_time_utc = scheduled_time.astimezone(pytz.UTC)
        else:
            # Naive datetime, treat as local
            scheduled_time_utc = local_tz.localize(scheduled_time).astimezone(pytz.UTC)
        
        # Check if scheduled time has passed
        if scheduled_time_utc <= now_utc:
            due_posts.append(post)
    
    results = []
    for post in due_posts:
        try:
            post_id = str(post["_id"])
            user_id = post["user_id"]
            platforms = post.get("platforms", [])
            content = post.get("content", "")
            media_urls = post.get("media_urls", [])
            
            publish_results = []
            all_success = True
            
            for platform in platforms:
                try:
                    # Get the social account for this platform
                    account = db.social_accounts.find_one({
                        "user_id": user_id,
                        "platform": platform,
                        "is_active": True
                    })
                    
                    if not account:
                        publish_results.append({
                            "platform": platform,
                            "status": "error",
                            "message": f"{platform} account not connected"
                        })
                        all_success = False
                        continue
                    
                    # Publish based on platform
                    if platform == "facebook":
                        result = publish_to_facebook(account, content, media_urls)
                    elif platform == "instagram":
                        result = publish_to_instagram(account, content, media_urls)
                    elif platform == "linkedin":
                        result = publish_to_linkedin(account, content, media_urls)
                    elif platform == "x":
                        result = publish_to_x(account, content, media_urls)
                    elif platform == "youtube":
                        result = publish_to_youtube(account, content, media_urls)
                    elif platform == "whatsapp":
                        result = publish_to_whatsapp(account, content, media_urls)
                    else:
                        result = {"status": "error", "message": f"Unsupported platform: {platform}"}
                    
                    publish_results.append({
                        "platform": platform,
                        "status": "success",
                        "result": result
                    })
                    
                except Exception as e:
                    publish_results.append({
                        "platform": platform,
                        "status": "error",
                        "message": str(e)
                    })
                    all_success = False
            
            # Update post status
            new_status = "published" if all_success else "partial_failure"
            db.posts.update_one(
                {"_id": post["_id"]},
                {"$set": {
                    "status": new_status,
                    "publish_results": publish_results,
                    "published_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }}
            )
            
            results.append({
                "post_id": post_id,
                "status": new_status,
                "success": True
            })
            
        except Exception as e:
            results.append({
                "post_id": str(post["_id"]),
                "status": "error",
                "success": False,
                "message": str(e)
            })
    
    return results


def publish_to_facebook(account, content, media_urls):
    """Publish to Facebook"""
    import requests
    
    access_token = account.get("access_token")
    page_id = account.get("platform_user_id")
    
    url = f"https://graph.facebook.com/v18.0/{page_id}/feed"
    
    data = {"message": content, "access_token": access_token}
    
    if media_urls:
        # For posts with media, we'd need to use the photos endpoint
        # This is simplified
        pass
    
    response = requests.post(url, data=data)
    
    if response.status_code == 200:
        return {"status": "success", "post_id": response.json().get("id")}
    else:
        raise Exception(f"Facebook API error: {response.text}")


def publish_to_instagram(account, content, media_urls):
    """Publish to Instagram"""
    import requests
    
    access_token = account.get("access_token")
    ig_user_id = account.get("platform_user_id")
    
    # Create media container
    url = f"https://graph.facebook.com/v18.0/{ig_user_id}/media"
    data = {
        "caption": content,
        "access_token": access_token
    }
    
    if media_urls:
        data["image_url"] = media_urls[0]
    
    response = requests.post(url, data=data)
    
    if response.status_code == 200:
        creation_id = response.json().get("id")
        # Publish the media
        publish_url = f"https://graph.facebook.com/v18.0/{ig_user_id}/media_publish"
        publish_data = {"creation_id": creation_id, "access_token": access_token}
        publish_response = requests.post(publish_url, data=publish_data)
        
        if publish_response.status_code == 200:
            return {"status": "success", "post_id": publish_response.json().get("id")}
    
    raise Exception(f"Instagram API error: {response.text}")


def publish_to_linkedin(account, content, media_urls):
    """Publish to LinkedIn"""
    import requests
    
    access_token = account.get("access_token")
    person_id = account.get("platform_user_id")
    
    url = f"https://api.linkedin.com/v2/ugcPosts"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "author": f"urn:li:person:{person_id}",
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {"text": content},
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }
    
    if media_urls:
        data["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
        data["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = [{
            "status": "READY",
            "media": img
        } for img in media_urls]
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code in [200, 201]:
        return {"status": "success", "post_id": response.json().get("id")}
    else:
        raise Exception(f"LinkedIn API error: {response.text}")


def publish_to_x(account, content, media_urls):
    """Publish to X (Twitter)"""
    import requests
    
    bearer_token = account.get("bearer_token")
    
    url = "https://api.twitter.com/2/tweets"
    
    headers = {
        "Authorization": f"Bearer {bearer_token}",
        "Content-Type": "application/json"
    }
    
    data = {"text": content}
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 201:
        return {"status": "success", "post_id": response.json().get("data", {}).get("id")}
    else:
        raise Exception(f"X API error: {response.text}")


def publish_to_youtube(account, content, media_urls):
    """Publish to YouTube (not fully implemented - requires video upload)"""
    raise Exception("YouTube posting requires video upload API - not implemented")


def publish_to_whatsapp(account, content, media_urls):
    """Publish to WhatsApp (not fully implemented)"""
    raise Exception("WhatsApp posting requires business API - not implemented")
