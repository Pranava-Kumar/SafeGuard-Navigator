/**
 * SafeRoute User Consent Management API
 * DPDP Act 2023 Compliant Consent Management Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/authService';
import { authMiddleware } from '@/lib/auth/authMiddleware';

// Validation schema for consent update
const consentSchema = z.object({
  consentType: z.enum([
    'dataProcessing',
    'locationSharing',
    'crowdsourcing',
    'personalizedRecommendations',
    'analytics',
    'marketing'
  ]),
  granted: z.boolean(),
  consentVersion: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = consentSchema.safeParse(body);

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

    // Initialize AuthService
    const authService = new AuthService();

    // Update user consent
    const consentResult = await authService.updateConsent({
      userId: authResult.user!.id,
      consentType: data.consentType,
      granted: data.granted,
      consentVersion: data.consentVersion || process.env.CONSENT_VERSION || '1.0',
      ipAddress,
      userAgent
    });

    if (!consentResult.success) {
      return NextResponse.json(
        { error: consentResult.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Consent updated successfully',
      consentType: data.consentType,
      granted: data.granted,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Consent update error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during consent update' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: 401 }
      );
    }

    // Initialize AuthService
    const authService = new AuthService();

    // Get user consent history
    const consentHistory = await authService.getConsentHistory(authResult.user!.id);

    return NextResponse.json({
      success: true,
      consentHistory
    });
  } catch (error) {
    console.error('Consent history error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while retrieving consent history' },
      { status: 500 }
    );
  }
}