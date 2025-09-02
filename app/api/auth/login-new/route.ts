/**
 * SafeRoute User Login API
 * DPDP Act 2023 Compliant Login Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authRateLimit } from '@/lib/ratelimit';
import { authService } from '@/lib/auth/authService';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().optional(),
  rememberMe: z.boolean().optional().default(false)
});

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIP(request) || 'anonymous';
    const rateLimitResult = await authRateLimit.login(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many login attempts. Please try again later.',
          retryAfter: rateLimitResult.reset
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Get client information for audit logging
    const ipAddress = getClientIP(request) || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Initialize AuthService
    const authServiceInstance = authService;

    // Authenticate user
    const authResult = await authServiceInstance.login({
      email: data.email,
      password: data.password,
      deviceId: data.deviceId,
      ipAddress,
      userAgent
    });

    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: 401 }
      );
    }

    // Create response with tokens
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: authResult.user,
      token: authResult.token,
      refreshToken: authResult.refreshToken
    });

    // Set secure HTTP-only cookies for tokens if needed
    if (data.rememberMe) {
      response.cookies.set({
        name: 'refreshToken',
        value: authResult.refreshToken!,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });
    }

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}