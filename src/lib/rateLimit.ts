import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = process.env.UPSTASH_REDIS_REST_URL ? Redis.fromEnv() : null

/**
 * Creates a rate limiter with the given config.
 * Returns null if Redis is not configured (dev mode).
 */
export function createRateLimit(prefix: string, requests: number, window: string) {
  if (!redis) return null
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    prefix: `ratelimit:${prefix}`,
  })
}
