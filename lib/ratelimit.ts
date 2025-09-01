/**
 * Rate Limiting Utility for Enterprise Auth
 * Supports both Redis and in-memory fallback
 */

import { redis } from './db-enterprise';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

// In-memory store for fallback when Redis is not available
const memoryStore = new Map<string, { count: number; resetTime: number }>();

class RateLimit {
  private redis = redis();
  private isRedisAvailable = false; // Default to false since Redis is not available

  constructor() {
    // Skip Redis availability check since it's not installed
    console.log('Rate limiting using in-memory store (Redis not available)');
  }

  /**
   * Memory-based rate limiting fallback
   */
  private async limitInMemory(
    identifier: string,
    limit: number,
    windowMs: number,
    prefix: string
  ): Promise<RateLimitResult> {
    const key = `${prefix}:${identifier}`;
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const resetTime = windowStart + windowMs;
    
    const current = memoryStore.get(key);
    
    // Clean up expired entries
    if (current && current.resetTime <= now) {
      memoryStore.delete(key);
    }
    
    const entry = memoryStore.get(key) || { count: 0, resetTime };
    
    if (entry.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: new Date(entry.resetTime)
      };
    }
    
    // Increment count
    entry.count += 1;
    memoryStore.set(key, entry);
    
    return {
      success: true,
      limit,
      remaining: limit - entry.count,
      reset: new Date(entry.resetTime)
    };
  }

  /**
   * Rate limiting with Redis or memory fallback
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
    // Use memory fallback if Redis is not available
    if (!this.isRedisAvailable) {
      return this.limitInMemory(identifier, limit, windowMs, prefix);
    }

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
      console.error('Redis rate limit error, falling back to memory:', error);
      this.isRedisAvailable = false;
      // Fallback to memory store
      return this.limitInMemory(identifier, limit, windowMs, prefix);
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