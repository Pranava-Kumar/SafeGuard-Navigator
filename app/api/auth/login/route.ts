/**
 * Enterprise User Login API
 * DPDP Act 2023 Compliant Login Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EnterpriseAuth } from '@/lib/auth-enterprise';
import { authRateLimit } from '@/lib/ratelimit';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().optional(),
  rememberMe: z.boolean().optional().default(false)
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
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
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Authenticate user
    const { user, tokens } = await EnterpriseAuth.login(
      {
        email: data.email,
        password: data.password,
        deviceId: data.deviceId,
        rememberMe: data.rememberMe
      },
      ipAddress,
      userAgent
    );

    // Prepare safe user response (exclude sensitive data)
    const safeUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      phone: user.phone,
      avatar: user.avatar,
      userType: user.userType,
      role: user.role,
      emailVerified: user.emailVerified,
      language: user.language,
      city: user.city,
      state: user.state,
      country: user.country,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionStatus: user.subscriptionStatus,
      dataProcessingConsent: user.dataProcessingConsent,
      consentDate: user.consentDate,
      consentVersion: user.consentVersion,
      locationSharingLevel: user.locationSharingLevel,
      crowdsourcingParticipation: user.crowdsourcingParticipation,
      personalizedRecommendations: user.personalizedRecommendations,
      analyticsConsent: user.analyticsConsent,
      marketingConsent: user.marketingConsent,
      riskTolerance: user.riskTolerance,
      timePreference: user.timePreference,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Create response with access token
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: safeUser,
        tokens: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
          tokenType: tokens.tokenType
        }
      },
      { status: 200 }
    );

    // Set refresh token as HTTP-only cookie
    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: data.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days if remember me, otherwise 7 days
      path: '/'
    });

    return response;

  } catch (error: unknown) {
    console.error('Login error:', error);
    
    // Handle specific errors
    if (error.message.includes('Invalid email or password')) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (error.message.includes('Account is locked')) {
      return NextResponse.json(
        { error: error.message },
        { status: 423 } // Locked
      );
    }

    if (error.message.includes('Account has been locked')) {
      return NextResponse.json(
        { error: error.message },
        { status: 423 } // Locked
      );
    }

    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}