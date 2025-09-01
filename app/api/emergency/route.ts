/**
 * SafeRoute Emergency Alert API
 * Implements emergency alert endpoints for the SafeRoute application
 * Compliant with DPDP Act 2023
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ratelimit } from '@/lib/ratelimit';
import EmergencyAlertService from '@/lib/emergency/emergencyAlertService';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/authMiddleware';

// Initialize services
const emergencyService = new EmergencyAlertService();

// Schema for triggering an emergency alert
const triggerAlertSchema = z.object({
  alertType: z.enum(['sos', 'medical', 'fire', 'police', 'custom']),
  deviceId: z.string().min(1).max(100),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    accuracy: z.number().optional(),
    time: z.date().optional()
  }),
  customMessage: z.string().max(500).optional(),
  options: z.object({
    notifyContacts: z.boolean().default(true),
    notifyAuthorities: z.boolean().default(true),
    includeLocation: z.boolean().default(true),
    includeUserProfile: z.boolean().default(false),
    includeHealthInfo: z.boolean().default(false)
  }).optional()
});

// Schema for resolving an emergency alert
const resolveAlertSchema = z.object({
  alertId: z.string().min(1),
  resolution: z.enum(['resolved', 'false_alarm']),
  feedback: z.string().max(500).optional()
});

// Schema for adding an emergency contact
const addContactSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(5).max(20),
  email: z.string().email().optional(),
  relationship: z.string().min(1).max(50),
  notificationPreference: z.array(
    z.enum(['sms', 'call', 'email'])
  ).min(1),
  isPrimary: z.boolean().optional()
});

// Schema for updating an emergency contact
const updateContactSchema = z.object({
  contactId: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(5).max(20).optional(),
  email: z.string().email().optional().nullable(),
  relationship: z.string().min(1).max(50).optional(),
  notificationPreference: z.array(
    z.enum(['sms', 'call', 'email'])
  ).min(1).optional(),
  isPrimary: z.boolean().optional()
});

// Schema for verifying an emergency contact
const verifyContactSchema = z.object({
  contactId: z.string().min(1),
  code: z.string().min(6).max(6)
});

/**
 * POST /api/emergency/alert
 * Trigger an emergency alert
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (strict for emergency alerts to prevent abuse)
    const identifier = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const { success } = await ratelimit.limit(identifier, 5, 60 * 1000, 'emergency_alert'); // 5 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Authenticate user
    let userId: string | null = null;
    const authResult = await authMiddleware(request as AuthenticatedRequest, async (req) => {
      userId = req.user?.userId || null;
      return NextResponse.json({ success: true });
    });
    
    if (authResult.status === 401) {
      return authResult;
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = triggerAlertSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      );
    }
    
    const { alertType, deviceId, location, customMessage, options } = validationResult.data;
    
    // Capture request metadata for audit
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Trigger the alert
    const result = await emergencyService.triggerAlert(
      userId,
      deviceId,
      alertType,
      {
        latitude: location.latitude,
        longitude: location.longitude,
        time: location.time || new Date()
      },
      {
        ...options,
        customMessage
      }
    );
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error triggering emergency alert:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to trigger emergency alert' },
      { status: error.status || 500 }
    );
  }
}

/**
 * GET /api/emergency/alert
 * Get user's emergency alerts
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const { success } = await ratelimit.limit(identifier, 20, 60 * 1000, 'emergency_get'); // 20 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Authenticate user
    let userId: string | null = null;
    const authResult = await authMiddleware(request as AuthenticatedRequest, async (req) => {
      userId = req.user?.userId || null;
      return NextResponse.json({ success: true });
    });
    
    if (authResult.status === 401) {
      return authResult;
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as any;
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Get user's emergency alerts
    const alerts = await emergencyService.getUserEmergencyAlerts(userId, {
      status: status || undefined,
      limit,
      offset
    });
    
    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('Error getting emergency alerts:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to get emergency alerts' },
      { status: error.status || 500 }
    );
  }
}