/**
 * Rate Limiting Utility for Enterprise Auth
 */

import { redis } from './db-enterprise';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

class RateLimit {
  private redis = redis();

  /**
   * Simple rate limiting implementation
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param limit - Maximum number of requests
   * @param windowMs - Time window in milliseconds
   * @param prefix - Redis key prefix
   */
  async limit(
    identifier: string,
    limit: number = 5,
    windowMs: number = 15 * 60 * 1000, // 15 minutes
    prefix: string = 'ratelimit'
  ): Promise<RateLimitResult> {
    const key = `${prefix}:${identifier}`;
    const now = Date.now();
    const window = Math.floor(now / windowMs);
    const windowKey = `${key}:${window}`;

    try {
      // Get current count
      const current = await this.redis.get(windowKey);
      const count = current ? parseInt(current) : 0;

      if (count >= limit) {
        return {
          success: false,
          limit,
          remaining: 0,
          reset: new Date((window + 1) * windowMs)
        };
      }

      // Increment count
      const pipeline = this.redis.pipeline();
      pipeline.incr(windowKey);
      pipeline.expire(windowKey, Math.ceil(windowMs / 1000));
      await pipeline.exec();

      return {
        success: true,
        limit,
        remaining: limit - count - 1,
        reset: new Date((window + 1) * windowMs)
      };
    } catch (error) {
      console.error('Rate limit error:', error);
      // On error, allow the request (fail open)
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: new Date(now + windowMs)
      };
    }
  }
}

// Create rate limiter instances
export const ratelimit = new RateLimit();

// Specific rate limiters for different endpoints
export const authRateLimit = {
  register: (identifier: string) => ratelimit.limit(identifier, 5, 15 * 60 * 1000, 'auth:register'),
  login: (identifier: string) => ratelimit.limit(identifier, 10, 15 * 60 * 1000, 'auth:login'),
  refresh: (identifier: string) => ratelimit.limit(identifier, 20, 15 * 60 * 1000, 'auth:refresh'),
  forgotPassword: (identifier: string) => ratelimit.limit(identifier, 3, 60 * 60 * 1000, 'auth:forgot'), // 3 per hour
};

export const apiRateLimit = {
  safety: (identifier: string) => ratelimit.limit(identifier, 100, 15 * 60 * 1000, 'api:safety'),
  routes: (identifier: string) => ratelimit.limit(identifier, 50, 15 * 60 * 1000, 'api:routes'),
  emergency: (identifier: string) => ratelimit.limit(identifier, 10, 15 * 60 * 1000, 'api:emergency'),
  reports: (identifier: string) => ratelimit.limit(identifier, 20, 15 * 60 * 1000, 'api:reports'),
};