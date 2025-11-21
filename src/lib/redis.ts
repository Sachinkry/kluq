// src/lib/redis.ts
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

let redisClient: ReturnType<typeof createClient> | null = null;
let started = false;

// Create Redis client if URL is provided
if (redisUrl) {
  redisClient = createClient({ url: redisUrl });
  
  redisClient.on("error", (err) => {
    console.error("Redis Client Error:", err);
  });
}

export const redis = {
  async get(key: string): Promise<string | null> {
    if (!redisClient) {
      console.warn("Redis not configured. PDF serving will not work. Set REDIS_URL environment variable.");
      return null;
    }
    if (!started) {
      await ensureRedis();
    }
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  },
  async set(key: string, value: string): Promise<void> {
    if (!redisClient) {
      console.warn("Redis not configured. PDF storage will not work. Set REDIS_URL environment variable.");
      return;
    }
    if (!started) {
      await ensureRedis();
    }
    try {
      await redisClient.set(key, value);
    } catch (error) {
      console.error("Redis set error:", error);
    }
  },
};

export async function ensureRedis() {
  if (!redisClient) {
    console.warn("Redis not configured. Set REDIS_URL environment variable to enable PDF storage.");
    return;
  }
  if (!started) {
    try {
      await redisClient.connect();
      started = true;
      console.log("Redis connected successfully");
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      throw error;
    }
  }
}
  