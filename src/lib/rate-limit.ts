import type { NextRequest } from "next/server";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type InMemoryBucket = {
  count: number;
  resetAt: number;
};

const globalState = globalThis as typeof globalThis & {
  __rateLimitBuckets?: Map<string, InMemoryBucket>;
  __rateLimiters?: Map<string, Ratelimit>;
  __upstashRedis?: Redis;
};

function getClientIp(request: Request | NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  if (!globalState.__upstashRedis) {
    globalState.__upstashRedis = new Redis({ url, token });
  }

  return globalState.__upstashRedis;
}

function getInMemoryBuckets() {
  const buckets = globalState.__rateLimitBuckets ?? new Map<string, InMemoryBucket>();
  globalState.__rateLimitBuckets = buckets;
  return buckets;
}

function getLimiter(cacheKey: string, limit: number, windowMs: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const ratelimiters = globalState.__rateLimiters ?? new Map<string, Ratelimit>();
  globalState.__rateLimiters = ratelimiters;

  const existing = ratelimiters.get(cacheKey);
  if (existing) return existing;

  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const created = new Ratelimit({
    redis,
    prefix: cacheKey,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
  });
  ratelimiters.set(cacheKey, created);
  return created;
}

function applyInMemoryLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const buckets = getInMemoryBuckets();
  const now = Date.now();

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, limit - 1), retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)) };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  return {
    allowed: true,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

export async function applyRateLimit(
  request: Request | NextRequest,
  options: {
    keyPrefix: string;
    limit: number;
    windowMs: number;
  }
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const key = `${options.keyPrefix}:${ip}`;

  const limiterKey = `rl:${options.keyPrefix}:${options.limit}:${options.windowMs}`;
  const limiter = getLimiter(limiterKey, options.limit, options.windowMs);
  if (!limiter) {
    return applyInMemoryLimit(key, options.limit, options.windowMs);
  }

  const result = await limiter.limit(key);
  const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
  return {
    allowed: result.success,
    remaining: result.remaining,
    retryAfterSeconds,
  };
}

type RateLimitOptions = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export function rateLimit(options?: RateLimitOptions) {
  const maxUniqueTokens = options?.uniqueTokenPerInterval || 500;
  const windowMs = options?.interval || 60_000;

  const limiterKey = `rl:token:${maxUniqueTokens}:${windowMs}`;
  const limiter = getLimiter(limiterKey, maxUniqueTokens, windowMs);

  return {
    check: async (limit: number, token: string) => {
      if (!token) {
        throw new Error("Rate limit token missing");
      }

      if (!limiter) {
        const memory = applyInMemoryLimit(`token:${token}`, limit, windowMs);
        if (!memory.allowed) {
          throw new Error("Rate limit exceeded");
        }
        return;
      }

      const result = await limiter.limit(`token:${token}`);
      if (!result.success || (limit > 0 && result.remaining < 0)) {
        throw new Error("Rate limit exceeded");
      }
    },
  };
}
