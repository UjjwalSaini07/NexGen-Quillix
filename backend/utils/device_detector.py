import os
import platform
import psutil
import aiohttp
from redis import Redis
import orjson
from datetime import datetime
from dotenv import load_dotenv
from redis.commands.json.path import Path

load_dotenv()

redis_client = Redis.from_url(os.getenv("REDIS_URL"))

async def fetch_ip_info():
    url = "https://ipapi.co/json/"
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def detect_and_store_device(request, linked_post_cache_key: str):
    ip_data = await fetch_ip_info()

    device_info = {
        "userAgent": request.headers.get("user-agent", "Unknown"),
        "platform": platform.system(),
        "language": request.headers.get("accept-language", "*"),
        "screenResolution": "Unknown to Record",
        "timezone": datetime.now().astimezone().tzname(),
        "connection": request.headers.get("connection", "Unknown"),
        "memory": f"{round(psutil.virtual_memory().total / (1024**3))} GB",
        "cpuCores": f"{psutil.cpu_count(logical=True)} Cores",
        "os": platform.platform(),
    }

    location_info = {
        "ip": ip_data.get("ip", "Unknown"),
        "city": ip_data.get("city", "Unknown"),
        "country": ip_data.get("country_name", "Unknown"),
        "isp": ip_data.get("org", "Unknown ISP"),
    }

    cache_data = {
        "device": device_info,
        "location": location_info,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "linked_post": linked_post_cache_key,
    }

    # Store JSON in Redis with 24-hour expiry
    device_cache_key = f"device_detection:{linked_post_cache_key}"
    redis_client.json().set(device_cache_key, Path.root_path(), cache_data)
    redis_client.expire(device_cache_key, 86400)  # 24 hours

    print(f"[DeviceDetector] Device info stored under {device_cache_key}")
