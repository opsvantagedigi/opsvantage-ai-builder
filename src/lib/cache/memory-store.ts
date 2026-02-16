import { LRUCache } from "lru-cache";
import { Redis } from "@upstash/redis";

const localCache = new LRUCache<string, string>({ max: 500, ttl: 1000 * 60 * 10 });

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  return new Redis({ url, token });
}

export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  }

  const raw = localCache.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
  const serialized = JSON.stringify(value);
  const redis = getRedis();
  if (redis) {
    await redis.set(key, serialized, { ex: ttlSeconds });
    return;
  }

  localCache.set(key, serialized, { ttl: ttlSeconds * 1000 });
}
