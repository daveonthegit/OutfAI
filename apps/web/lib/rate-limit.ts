import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/** Route-specific limits (per IP + route key). */
export const RATE_LIMIT_POLICIES = {
  "product-recommendations": { max: 40, windowMs: 60_000 },
  "style-insights": { max: 30, windowMs: 60_000 },
  "analyze-garment-image": { max: 20, windowMs: 60_000 },
  weather: { max: 120, windowMs: 60_000 },
} as const;

export type RateLimitRoute = keyof typeof RATE_LIMIT_POLICIES;

const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimitMemory(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const b = memoryBuckets.get(key);
  if (!b || now > b.resetAt) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= max) return false;
  b.count += 1;
  return true;
}

export function rateLimitKey(request: NextRequest, route: string): string {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return `${ip}:${route}`;
}

const limiterCache = new Map<RateLimitRoute, Ratelimit>();

function getUpstashLimiter(route: RateLimitRoute): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const cached = limiterCache.get(route);
  if (cached) return cached;
  const policy = RATE_LIMIT_POLICIES[route];
  const windowSec = Math.max(1, Math.floor(policy.windowMs / 1000));
  const redis = new Redis({ url, token });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(policy.max, `${windowSec} s`),
    prefix: `outfai:rl:${route}`,
  });
  limiterCache.set(route, limiter);
  return limiter;
}

/**
 * Returns a 429 NextResponse when over limit, or null when allowed.
 * Uses Upstash when UPSTASH_REDIS_REST_* are set; otherwise in-memory (dev / single instance).
 */
export async function enforceRateLimit(
  request: NextRequest,
  route: RateLimitRoute
): Promise<NextResponse | null> {
  const policy = RATE_LIMIT_POLICIES[route];
  const key = rateLimitKey(request, route);
  const limiter = getUpstashLimiter(route);

  if (limiter) {
    const { success, reset } = await limiter.limit(key);
    if (!success) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((reset - Date.now()) / 1000)
      );
      return NextResponse.json(
        {
          error: "Too many requests",
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSeconds),
            "X-RateLimit-Backend": "upstash",
          },
        }
      );
    }
    return null;
  }

  if (!checkRateLimitMemory(key, policy.max, policy.windowMs)) {
    const retryAfterSeconds = Math.ceil(policy.windowMs / 1000);
    return NextResponse.json(
      {
        error: "Too many requests",
        retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSeconds),
          "X-RateLimit-Backend": "memory",
        },
      }
    );
  }
  return null;
}
