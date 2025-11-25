// src/lib/redis.ts
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

let redisClient: ReturnType<typeof createClient> | null = null;
let started = false;

if (redisUrl) {
  redisClient = createClient({ url: redisUrl });
  redisClient.on("error", (err) => console.error("Redis Client Error:", err));
}

export function getClient() {
  return redisClient;
}

export const redis = {
  async get(key: string): Promise<string | null> {
    if (!redisClient) return null;
    if (!started) await ensureRedis();
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  },

  // FIX: Added 'options' parameter to support TTL (EX)
  async set(key: string, value: string, options?: any): Promise<void> {
    if (!redisClient) return;
    if (!started) await ensureRedis();
    try {
      // Pass the options (like { EX: 86400 }) to the real Redis client
      await redisClient.set(key, value, options);
    } catch (error) {
      console.error("Redis set error:", error);
    }
  },
};

export async function ensureRedis() {
  if (!redisClient) return;
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