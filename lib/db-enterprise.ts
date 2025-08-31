/**
 * Enterprise Database Configuration and Connection Management
 * PostgreSQL + PostGIS setup for SafeRoute
 */

import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import Redis from 'ioredis';

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

// Enhanced Prisma client with connection pooling
class EnterprisePrismaClient {
  private static instance: PrismaClient;
  private static connectionPool: Pool;
  private static redis: Redis;

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
   */
  public static getPool(): Pool {
    if (!EnterprisePrismaClient.connectionPool) {
      EnterprisePrismaClient.connectionPool = new Pool({
        connectionString: process.env.DATABASE_URL!,
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
    }

    return EnterprisePrismaClient.connectionPool;
  }

  /**
   * Get Redis client for caching
   */
  public static getRedis(): Redis {
    if (!EnterprisePrismaClient.redis) {
      EnterprisePrismaClient.redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0'),
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        lazyConnect: true
      });

      EnterprisePrismaClient.redis.on('error', (error) => {
        console.error('Redis connection error:', error);
      });

      EnterprisePrismaClient.redis.on('connect', () => {
        console.log('Redis connected successfully');
      });
    }

    return EnterprisePrismaClient.redis;
  }

  /**
   * Execute PostGIS spatial queries
   */
  public static async executeGeospatialQuery(
    query: string,
    params: any[] = []
  ): Promise<any[]> {
    const pool = this.getPool();
    const client = await pool.connect();
    
    try {
      const result = await client.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Geospatial query error:', error);
      throw error;
    } finally {
      client.release();
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
      const pool = this.getPool();
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      health.postgres = true;
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

// Database connection event handlers
db.$on('query' as any, (e: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Query: ' + e.query);
    console.log('Duration: ' + e.duration + 'ms');
  }
});

export default db;