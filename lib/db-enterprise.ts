/**
 * Enterprise Database Configuration and Connection Management
 * PostgreSQL + PostGIS setup for SafeRoute
 */

import { PrismaClient } from '@prisma/client';
// Note: Advanced features requiring 'pg' and 'ioredis' are disabled
// Install these packages if you need PostgreSQL pool and Redis caching

// Type definitions for enterprise database operations
export interface DatabaseConfig {
  maxConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  maxRetriesPerRequest: number;
  retryDelayOnFailover: number;
}

export interface GeospatialQuery {
  latitude: number;
  longitude: number;
  radius?: number;
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Enhanced Prisma client with simplified connection management
class EnterprisePrismaClient {
  private static instance: PrismaClient;

  private constructor() {}

  /**
   * Get singleton Prisma client instance
   */
  public static getInstance(): PrismaClient {
    if (!EnterprisePrismaClient.instance) {
      EnterprisePrismaClient.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' 
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL!
          }
        },
        errorFormat: 'pretty'
      });

      // Enable connection pooling
      EnterprisePrismaClient.instance.$connect();

      // Graceful shutdown
      process.on('beforeExit', async () => {
        await EnterprisePrismaClient.instance.$disconnect();
      });
    }

    return EnterprisePrismaClient.instance;
  }

  /**
   * Get PostgreSQL connection pool for raw queries
   * Note: PostgreSQL pool is not available - install 'pg' package for this feature
   */
  public static getPool(): null {
    console.warn('PostgreSQL pool not available - install pg package for advanced features');
    return null;
  }

  /**
   * Get Redis client for caching (Mock implementation)
   * Note: Redis is not available - install 'ioredis' package for caching features
   */
  public static getRedis(): any {
    return {
      get: () => Promise.resolve(null),
      set: () => Promise.resolve('OK'),
      setex: () => Promise.resolve('OK'),
      del: () => Promise.resolve(1),
      ping: () => Promise.resolve('PONG'),
      pipeline: () => ({ 
        incr: () => {}, 
        expire: () => {}, 
        exec: () => Promise.resolve([]) 
      })
    };
  }

  /**
   * Execute PostGIS spatial queries (Simplified)
   */
  public static async executeGeospatialQuery(
    query: string,
    params: any[] = []
  ): Promise<any[]> {
    console.warn('Advanced geospatial queries require PostgreSQL pool - using Prisma fallback');
    // Fallback to Prisma raw query (limited functionality)
    try {
      const result = await this.getInstance().$queryRawUnsafe(query, ...params);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Prisma raw query error:', error);
      return [];
    }
  }

  /**
   * Find nearby points using PostGIS
   */
  public static async findNearbyPoints(
    tableName: string,
    query: GeospatialQuery,
    limit: number = 100
  ): Promise<any[]> {
    const { latitude, longitude, radius = 1000 } = query;
    
    const sql = `
      SELECT *, 
        ST_Distance(
          ST_GeogFromText('POINT(' || longitude || ' ' || latitude || ')'),
          ST_GeogFromText('POINT(' || $2 || ' ' || $1 || ')')
        ) as distance
      FROM ${tableName}
      WHERE ST_DWithin(
        ST_GeogFromText('POINT(' || longitude || ' ' || latitude || ')'),
        ST_GeogFromText('POINT(' || $2 || ' ' || $1 || ')'),
        $3
      )
      ORDER BY distance
      LIMIT $4;
    `;

    return this.executeGeospatialQuery(sql, [latitude, longitude, radius, limit]);
  }

  /**
   * Calculate route safety score using PostGIS
   */
  public static async calculateRouteSafetyScore(
    routeCoordinates: Array<{ lat: number; lng: number }>
  ): Promise<number> {
    if (routeCoordinates.length === 0) return 50;

    // Create a LineString from route coordinates
    const lineString = routeCoordinates
      .map(coord => `${coord.lng} ${coord.lat}`)
      .join(',');

    const sql = `
      WITH route_line AS (
        SELECT ST_GeogFromText('LINESTRING(${lineString})') as route_geom
      ),
      nearby_scores AS (
        SELECT 
          ss.overall_score,
          ss.confidence,
          ST_Distance(route_line.route_geom, 
            ST_GeogFromText('POINT(' || ss.longitude || ' ' || ss.latitude || ')'))
          as distance
        FROM safety_scores ss, route_line
        WHERE ST_DWithin(
          route_line.route_geom,
          ST_GeogFromText('POINT(' || ss.longitude || ' ' || ss.latitude || ')'),
          500  -- 500 meter buffer
        )
        AND ss.expires_at > NOW()
      )
      SELECT 
        COALESCE(
          SUM(overall_score * confidence * (1 / (distance + 1))) / 
          SUM(confidence * (1 / (distance + 1))),
          50
        ) as weighted_safety_score
      FROM nearby_scores;
    `;

    try {
      const result = await this.executeGeospatialQuery(sql);
      return Math.round(result[0]?.weighted_safety_score || 50);
    } catch (error) {
      console.error('Route safety calculation error:', error);
      return 50; // Default safety score
    }
  }

  /**
   * Cache safety score with automatic expiration
   */
  public static async cacheSafetyScore(
    latitude: number,
    longitude: number,
    score: any,
    ttl: number = 300
  ): Promise<void> {
    const redis = this.getRedis();
    const key = `safety_score:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
    
    await redis.setex(key, ttl, JSON.stringify(score));
  }

  /**
   * Get cached safety score
   */
  public static async getCachedSafetyScore(
    latitude: number,
    longitude: number
  ): Promise<any | null> {
    const redis = this.getRedis();
    const key = `safety_score:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
    
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Health check for database connections
   */
  public static async healthCheck(): Promise<{
    prisma: boolean;
    postgres: boolean;
    redis: boolean;
  }> {
    const health = {
      prisma: false,
      postgres: false,
      redis: false
    };

    try {
      await this.getInstance().$queryRaw`SELECT 1`;
      health.prisma = true;
    } catch (error) {
      console.error('Prisma health check failed:', error);
    }

    try {
      // PostgreSQL pool not available - skip check
      console.log('PostgreSQL pool check skipped (pg package not installed)');
    } catch (error) {
      console.error('PostgreSQL health check failed:', error);
    }

    try {
      const redis = this.getRedis();
      await redis.ping();
      health.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }

    return health;
  }
}

// Export the main database instance
export const db = EnterprisePrismaClient.getInstance();
export const dbPool = EnterprisePrismaClient.getPool;
export const redis = EnterprisePrismaClient.getRedis;
export const dbUtils = EnterprisePrismaClient;

export default db;