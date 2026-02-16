import { Redis } from "@upstash/redis";

const SUBSCRIPTIONS_KEY = "marz:push:subscriptions";

type PushSubscriptionRecord = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

const localStore = new Map<string, PushSubscriptionRecord>();

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return null;
  }
  return new Redis({ url, token });
}

export async function savePushSubscription(subscription: PushSubscriptionRecord) {
  const redis = getRedisClient();
  if (redis) {
    await redis.hset(SUBSCRIPTIONS_KEY, { [subscription.endpoint]: JSON.stringify(subscription) });
    return;
  }
  localStore.set(subscription.endpoint, subscription);
}

export async function listPushSubscriptions(): Promise<PushSubscriptionRecord[]> {
  const redis = getRedisClient();
  if (redis) {
    const raw = await redis.hgetall<Record<string, string>>(SUBSCRIPTIONS_KEY);
    return Object.values(raw || {}).map((value) => {
      try {
        return JSON.parse(String(value));
      } catch {
        return null;
      }
    }).filter((item): item is PushSubscriptionRecord => Boolean(item));
  }

  return [...localStore.values()];
}

export async function deletePushSubscription(endpoint: string) {
  const redis = getRedisClient();
  if (redis) {
    await redis.hdel(SUBSCRIPTIONS_KEY, endpoint);
    return;
  }

  localStore.delete(endpoint);
}
