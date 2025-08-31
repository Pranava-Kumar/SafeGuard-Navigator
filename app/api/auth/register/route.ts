/**
 * Enterprise User Registration API
 * DPDP Act 2023 Compliant Registration Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EnterpriseAuth } from '@/lib/auth-enterprise';
import { authRateLimit } from '@/lib/ratelimit';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  phone: z.string().optional(),
  userType: z.enum(['pedestrian', 'two_wheeler', 'cyclist', 'public_transport']),
  
  // DPDP Act 2023 Compliance Fields
  dataProcessingConsent: z.boolean().refine(val => val === true, {
    message: 'Data processing consent is required under DPDP Act 2023'
  }),
  locationSharingLevel: z.enum(['precise', 'coarse', 'city_only']),
  crowdsourcingParticipation: z.boolean().optional().default(true),
  personalizedRecommendations: z.boolean().optional().default(true),
  analyticsConsent: z.boolean().optional().default(false),
  marketingConsent: z.boolean().optional().default(false),
  
  // Additional fields
  language: z.enum(['en', 'ta', 'hi']).optional().default('en'),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'Terms of service must be accepted'
  }),
  privacyPolicyAccepted: z.boolean().refine(val => val === true, {
    message: 'Privacy policy must be accepted'
  })
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = await authRateLimit.register(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: rateLimitResult.reset
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

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
    
    // Get client information for DPDP compliance
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Register user with DPDP compliance
    const { user, tokens } = await EnterpriseAuth.register(
      {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        userType: data.userType,
        dataProcessingConsent: data.dataProcessingConsent,
        locationSharingLevel: data.locationSharingLevel,
        language: data.language
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
      userType: user.userType,
      role: user.role,
      language: user.language,
      emailVerified: user.emailVerified,
      dataProcessingConsent: user.dataProcessingConsent,
      locationSharingLevel: user.locationSharingLevel,
      createdAt: user.createdAt
    };

    // Set secure HTTP-only cookie for refresh token
    const response = NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: safeUser,
        tokens: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
          tokenType: tokens.tokenType
        }
      },
      { status: 201 }
    );

    // Set refresh token as HTTP-only cookie
    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle specific errors
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    if (error.message.includes('Password validation failed')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error.message.includes('consent is required')) {
      return NextResponse.json(
        { error: 'Data processing consent is required under DPDP Act 2023' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
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