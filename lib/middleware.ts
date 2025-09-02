import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserById } from "./auth";
import { z } from "zod";
import { cookies } from "next/headers";
import { SafeRouteUser } from "./auth";

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface AuthenticatedRequest extends NextRequest {
  user?: SafeRouteUser;
}

/**
 * Authentication middleware for API routes
 */
export async function withAuth(
  request: NextRequest,
  requiredRole?: string
): Promise<{ user: SafeRouteUser | null; error?: NextResponse }> {
  try {
    // Get token from cookies or Authorization header
    const cookieStore = await cookies();
    const tokenFromCookie = cookieStore.get('saferoute_token')?.value;
    const authHeader = request.headers.get('Authorization');
    const tokenFromHeader = authHeader?.replace('Bearer ', '');
    
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, message: "Authentication required" },
          { status: 401 }
        )
      };
    }

    // Verify token
    const tokenPayload = verifyToken(token);
    
    if (!tokenPayload) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 401 }
        )
      };
    }

    // Get user data
    const user = await getUserById(tokenPayload.userId);

    if (!user) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        )
      };
    }

    // Check role-based access if required
    if (requiredRole && !checkRoleAccess(user.role, requiredRole)) {
      return {
        user: null,
        error: NextResponse.json(
          { success: false, message: "Insufficient permissions" },
          { status: 403 }
        )
      };
    }

    return { user };

  } catch (error) {
    console.error('Authentication middleware error:', error);
    return {
      user: null,
      error: NextResponse.json(
        { success: false, message: "Authentication failed" },
        { status: 500 }
      )
    };
  }
}

/**
 * Role hierarchy check
 */
function checkRoleAccess(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    'user': 1,
    'trusted_reporter': 2,
    'premium': 3,
    'civic_partner': 4,
    'admin': 5
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMinutes: number = 15
): { allowed: boolean; error?: NextResponse } {
  const key = `rate_${identifier}`;
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  
  const record = rateLimitStore.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }
  
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      error: NextResponse.json(
        { 
          success: false, 
          message: "Rate limit exceeded. Please try again later.",
          retryAfter: Math.ceil((record.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
          }
        }
      )
    };
  }
  
  record.count++;
  return { allowed: true };
}

/**
 * Input validation middleware using Zod schemas
 */
export function validateInput<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): { data: T; error?: NextResponse } {
  try {
    const validatedData = schema.parse(data);
    return { data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.reduce((acc: Record<string, string>, err: z.ZodIssue) => {
        const path = err.path.join('.');
        acc[path] = err.message;
        return acc;
      }, {} as Record<string, string>);
      
      return {
        data: null as T,
        error: NextResponse.json(
          {
            success: false,
            message: "Validation failed",
            errors
          },
          { status: 400 }
        )
      };
    }

    return {
      data: null as T,
      error: NextResponse.json(
        { success: false, message: "Invalid input data" },
        { status: 400 }
      )
    };
  }
}

/**
 * CORS middleware for API routes
 */
export function withCORS(response: NextResponse): NextResponse {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://saferoute.app', // Production domain
  ];
  
  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', allowedOrigins[0]); // In production, check origin
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

/**
 * Security headers middleware
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.openweathermap.org https://overpass-api.de;"
  );
  
  return response;
}

/**
 * Get client IP address for rate limiting
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback to connection remote address
  return request.headers.get('x-forwarded-for') || 'unknown';
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate geographic coordinates
 */
export const CoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

/**
 * Standard API response wrapper
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
  meta?: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

/**
 * Create standardized API response
 */
export function createAPIResponse<T>(
  success: boolean,
  data?: T,
  message?: string,
  errors?: Record<string, string>
): APIResponse<T> {
  return {
    success,
    data,
    message,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      requestId: crypto.randomUUID()
    }
  };
}

/**
 * Error handling wrapper for API routes
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse> {
  return handler().catch((error) => {
    console.error('API Error:', error);
    
    // Log error details for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      createAPIResponse(false, null, "Internal server error"),
      { status: 500 }
    );
  });
}