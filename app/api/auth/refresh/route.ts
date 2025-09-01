/**
 * SafeRoute Token Refresh API
 * DPDP Act 2023 Compliant Token Refresh Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/auth/authService';
import { authRateLimit } from '@/lib/ratelimit';

// Validation schema for token refresh
const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
  deviceId: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimitResult = await authRateLimit.refresh(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many refresh attempts. Please try again later.',
          retryAfter: rateLimitResult.reset
        },
        { status: 429 }
      );
    }

    // Get refresh token from request body or cookies
    let refreshToken: string | undefined;
    let deviceId: string | undefined;
    
    // Try to get from request body
    try {
      const body = await request.json();
      const validationResult = refreshSchema.safeParse(body);
      
      if (validationResult.success) {
        refreshToken = validationResult.data.refreshToken;
        deviceId = validationResult.data.deviceId;
      }
    } catch {
      // If body parsing fails, try cookies
      refreshToken = request.cookies.get('refreshToken')?.value;
    }

    // If no refresh token found
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    // Get client information for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Use the imported authService instance
    const refreshResult = await authService.refreshToken(refreshToken);

    if (!refreshResult.success) {
      return NextResponse.json(
        { error: refreshResult.message },
        { status: 401 }
      );
    }

    // Create response with new tokens
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      token: refreshResult.token,
      refreshToken: refreshResult.refreshToken
    });

    // Update refresh token cookie if it was originally provided via cookie
    if (request.cookies.has('refreshToken')) {
      response.cookies.set({
        name: 'refreshToken',
        value: refreshResult.refreshToken!,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });
    }

    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during token refresh' },
      { status: 500 }
    );
  }
}