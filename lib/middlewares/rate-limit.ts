import { NextRequest, NextResponse } from "next/server";
import { Middleware, RateLimitError } from "./types";
import { getRedisClient } from "../redis";
import { requireAuth } from "../auth/session";
import { checkRateLimit } from "../auth/redis-auth";
type RateLimitConfig = {
  max: number;
  windowMs: number;
  message?: string;
  keyGenerator?: (request: NextRequest) => string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
  prefix?: string;
  useUserIdentifier?: boolean;
  action?: string; // For user-based rate limiting
};
/**
 * Redis-based rate limiting middleware with fallback to in-memory
 */

export function withRateLimit(config: RateLimitConfig): Middleware {
  // Fallback in-memory store for when Redis is unavailable
  const memoryStore = new Map<string, { count: number; resetAt: number }>();
  const prefix = config.prefix || "ratelimit";
  const windowSeconds = Math.ceil(config.windowMs / 1000);

  return (handler) => async (request, context) => {
    // Handle user-based rate limiting separately
    if (config.useUserIdentifier) {
      const user = await requireAuth();
      const rateLimit = await checkRateLimit(
        user.email,
        config.action || "default",
        config.max,
        Math.ceil(config.windowMs / 1000)
      );

      if (!rateLimit.allowed) {
        return NextResponse.json(
          {
            error:
              config.message || "Too many requests. Please try again later.",
          },
          { status: 429 }
        );
      }

      // Continue with handler - user passed rate limit
      return handler(request, context);
    }

    // Rest of your existing IP-based rate limiting code
    const identifier =
      config.keyGenerator?.(request) ||
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const key = `${prefix}:${identifier}`;

    let current = 0;
    let resetAt = 0;
    let usingRedis = true;

    try {
      const redis = await getRedisClient();

      const pipeline = redis.multi();
      pipeline.incr(key);
      pipeline.ttl(key);
      pipeline.pExpireAt(key, Date.now() + config.windowMs);

      const results = await pipeline.exec();

      if (results) {
        current = Number(results[0]) || 0;
        const ttl = Number(results[1]) || -2;

        if (ttl === -1) {
          await redis.expire(key, windowSeconds);
          resetAt = Date.now() + config.windowMs;
        } else if (ttl > 0) {
          resetAt = Date.now() + ttl * 1000;
        } else {
          resetAt = Date.now() + config.windowMs;
        }
      }
    } catch (error) {
      console.warn("Redis rate limit failed, falling back to memory:", error);
      usingRedis = false;

      const now = Date.now();
      const record = memoryStore.get(key);

      if (!record || now > record.resetAt) {
        memoryStore.set(key, {
          count: 1,
          resetAt: now + config.windowMs,
        });
        current = 1;
        resetAt = now + config.windowMs;
      } else {
        record.count++;
        current = record.count;
        resetAt = record.resetAt;
      }
    }

    const remaining = Math.max(0, config.max - current);

    if (current > config.max) {
      const error = new RateLimitError(
        config.message || "Too many requests. Please try again later."
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).rateLimit = {
        limit: config.max,
        remaining: 0,
        reset: new Date(resetAt).toISOString(),
        retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
      };

      throw error;
    }

    let response: NextResponse;
    let handlerFailed = false;

    try {
      response = await handler(request, context);
      handlerFailed = !response.ok;
    } catch (error) {
      handlerFailed = true;
      throw error;
    } finally {
      if (
        (config.skipFailedRequests && handlerFailed) ||
        (config.skipSuccessfulRequests && !handlerFailed)
      ) {
        try {
          if (usingRedis) {
            const redis = await getRedisClient();
            await redis.decr(key);
          } else {
            const record = memoryStore.get(key);
            if (record && record.count > 0) {
              record.count--;
            }
          }
        } catch (error) {
          console.warn("Failed to decrement rate limit counter:", error);
        }
      }
    }

    response.headers.set("X-RateLimit-Limit", config.max.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", new Date(resetAt).toISOString());
    response.headers.set(
      "Retry-After",
      Math.ceil((resetAt - Date.now()) / 1000).toString()
    );

    return response;
  };
}
/**
 * Factory function to create route-specific rate limiters
 */
export const createRateLimiter = {
  strict: () =>
    withRateLimit({
      max: 5,
      windowMs: 60 * 1000, // 1 minute
      prefix: "strict",
    }),

  moderate: () =>
    withRateLimit({
      max: 20,
      windowMs: 60 * 1000,
      prefix: "moderate",
    }),

  relaxed: () =>
    withRateLimit({
      max: 100,
      windowMs: 60 * 1000,
      prefix: "relaxed",
    }),

  perUser: (userId: string) =>
    withRateLimit({
      max: 50,
      windowMs: 60 * 1000,
      keyGenerator: () => `user:${userId}`,
      prefix: "user",
    }),
};

// /// usage
// export const POST = withRateLimit({
//   max: 10,
//   windowMs: 60000,
//   keyGenerator: (req) => req.headers.get("authorization") || "anonymous",
// })(async (request) => {
//   // Your handler
// });
// // Using factory
// export const GET = createRateLimiter.strict()(async (request) => {
//   // Your handler
// });
