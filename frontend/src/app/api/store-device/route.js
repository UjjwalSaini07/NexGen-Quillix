import { NextResponse } from "next/server";
import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => console.error("Redis Client Error", err));

async function getRedisClient() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

export async function POST(req) {
  try {
    const { cacheKey, cacheData } = await req.json();

    if (!cacheKey || !cacheData) {
      return NextResponse.json(
        { error: "Missing cacheKey or cacheData" },
        { status: 400 }
      );
    }

    const client = await getRedisClient();
    const redisKey = `device_detection:${cacheKey}`;
    await client.json.set(redisKey, "$", cacheData);
    await client.expire(redisKey, 86400); // 24 hours

    return NextResponse.json({
      success: true,
      message: `Device info stored under ${redisKey}`,
    });
  } catch (error) {
    console.error("[store-device] Error:", error);
    return NextResponse.json(
      { error: "Failed to store device info" },
      { status: 500 }
    );
  }
}
