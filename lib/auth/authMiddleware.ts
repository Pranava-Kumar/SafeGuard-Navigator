import { NextRequest, NextResponse } from 'next/server';
import { authService, TokenPayload } from './authService';

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload;
}

/**
 * Authentication middleware for API routes
 * Verifies JWT token and attaches user to request
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Missing or invalid token' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Missing token' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = authService.verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Attach user to request
    req.user = decoded;

    // Call the handler
    return handler(req);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Role-based authorization middleware
 * Ensures user has required role
 */
export function authorizeRoles(roles: string[]) {
  return async function (
    req: AuthenticatedRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      // First apply auth middleware
      return authMiddleware(req, async (authenticatedReq) => {
        // Check if user has required role
        const userRole = authenticatedReq.user?.role;
        if (!userRole || !roles.includes(userRole)) {
          return NextResponse.json(
            { success: false, message: 'Forbidden: Insufficient permissions' },
            { status: 403 }
          );
        }

        // Call the handler
        return handler(authenticatedReq);
      });
    } catch (error) {
      console.error('Authorization middleware error:', error);
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * DPDP Act 2023 consent verification middleware
 * Ensures user has given required consent
 */
export function verifyConsent(consentType: string) {
  return async function (
    req: AuthenticatedRequest,
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      // First apply auth middleware
      return authMiddleware(req, async (authenticatedReq) => {
        const userId = authenticatedReq.user?.userId;
        if (!userId) {
          return NextResponse.json(
            { success: false, message: 'Unauthorized: User not authenticated' },
            { status: 401 }
          );
        }

        // Get user from database to check consent
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return NextResponse.json(
            { success: false, message: 'Unauthorized: User not found' },
            { status: 401 }
          );
        }

        // Check consent based on type
        let hasConsent = false;
        switch (consentType) {
          case 'data_processing':
            hasConsent = user.dataProcessingConsent;
            break;
          case 'location_sharing':
            hasConsent = user.locationSharingLevel !== 'city_only';
            break;
          case 'crowdsourcing':
            hasConsent = user.crowdsourcingParticipation;
            break;
          case 'personalized_recommendations':
            hasConsent = user.personalizedRecommendations;
            break;
          case 'analytics':
            hasConsent = user.analyticsConsent;
            break;
          case 'marketing':
            hasConsent = user.marketingConsent;
            break;
          default:
            return NextResponse.json(
              { success: false, message: 'Invalid consent type' },
              { status: 400 }
            );
        }

        if (!hasConsent) {
          return NextResponse.json(
            {
              success: false,
              message: `Consent required: User has not provided consent for ${consentType}`,
              consentRequired: true,
              consentType,
            },
            { status: 403 }
          );
        }

        // Create audit log for consent verification
        await prisma.auditLog.create({
          data: {
            userId,
            action: 'consent_verification',
            resource: consentType,
            metadata: JSON.stringify({
              consentType,
              granted: true,
            }),
          },
        });

        // Call the handler
        return handler(authenticatedReq);
      });
    } catch (error) {
      console.error('Consent verification middleware error:', error);
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Import PrismaClient
import { PrismaClient } from '@prisma/client';