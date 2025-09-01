/**
 * SafeRoute Emergency Alert Management API
 * Implements emergency alert resolution and retrieval endpoints
 * Compliant with DPDP Act 2023
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ratelimit } from '@/lib/ratelimit';
import EmergencyAlertService from '@/lib/emergency/emergencyAlertService';
import { authMiddleware } from '@/lib/auth/authMiddleware';

// Initialize services
const emergencyService = new EmergencyAlertService();

// Schema for resolving an emergency alert
const resolveAlertSchema = z.object({
  resolution: z.enum(['resolved', 'false_alarm']),
  feedback: z.string().max(500).optional()
});

// Helper function to get client IP
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return 'anonymous';
}

/**
 * GET /api/emergency/alert/[id]
 * Get a specific emergency alert
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const identifier = getClientIP(request);
    const { success } = await ratelimit.limit(identifier, 20, 60 * 1000, 'emergency_alert_get'); // 20 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Authenticate user
    return authMiddleware(request, async (authenticatedRequest) => {
      // Get alert ID from route params
      const alertId = params.id;
      
      // Get user info from authenticated request
      const userId = authenticatedRequest.user?.userId;
      
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID not found' },
          { status: 401 }
        );
      }
      
      // Get emergency alert
      const alert = await emergencyService.getEmergencyAlert(alertId, userId);
      
      if (!alert) {
        return NextResponse.json(
          { error: 'Alert not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ alert });
    });
  } catch (error: unknown) {
    console.error('Error getting emergency alert:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get emergency alert' },
      { status: error instanceof Error && 'status' in error ? (error as any).status : 500 }
    );
  }
}

/**
 * PUT /api/emergency/alert/[id]
 * Resolve an emergency alert
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const identifier = getClientIP(request);
    const { success } = await ratelimit.limit(identifier, 10, 60 * 1000, 'emergency_alert_resolve'); // 10 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Authenticate user
    return authMiddleware(request, async (authenticatedRequest) => {
      // Get alert ID from route params
      const alertId = params.id;
      
      // Parse and validate request body
      const body = await request.json();
      const validationResult = resolveAlertSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Invalid request data', details: validationResult.error.format() },
          { status: 400 }
        );
      }
      
      const { resolution, feedback } = validationResult.data;
      
      // Get user info from authenticated request
      const userId = authenticatedRequest.user?.userId;
      
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID not found' },
          { status: 401 }
        );
      }
      
      // Resolve emergency alert
      const resolved = await emergencyService.resolveAlert(alertId, userId, resolution, feedback);
      
      if (!resolved) {
        return NextResponse.json(
          { error: 'Failed to resolve alert' },
          { status: 400 }
        );
      }
      
      return NextResponse.json({ success: true, resolved });
    });
  } catch (error: unknown) {
    console.error('Error resolving emergency alert:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve emergency alert' },
      { status: error instanceof Error && 'status' in error ? (error as any).status : 500 }
    );
  }
}