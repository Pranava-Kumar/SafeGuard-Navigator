/**
 * SafeRoute Emergency Contact API
 * Implements emergency contact management endpoints
 * Compliant with DPDP Act 2023
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ratelimit } from '@/lib/ratelimit';
import EmergencyAlertService from '@/lib/emergency/emergencyAlertService';
import { authMiddleware } from '@/lib/auth/authMiddleware';

// Initialize services
const emergencyService = new EmergencyAlertService();

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
 * POST /api/emergency/contact
 * Add a new emergency contact
 */
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = getClientIP(request);
    const { success } = await ratelimit.limit(identifier, 10, 60 * 1000, 'emergency_contact_add'); // 10 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Authenticate user
    return authMiddleware(request, async (authenticatedRequest) => {
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = addContactSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const contactData = validationResult.data;
    
    // Ensure isPrimary has a default value
    const contactDataWithDefaults = {
      ...contactData,
      isPrimary: contactData.isPrimary ?? false
    };
    
      // Get user info from authenticated request
      const userId = authenticatedRequest.user?.userId;
      
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID not found' },
          { status: 401 }
        );
      }
      
      // Add emergency contact
      const contact = await emergencyService.addEmergencyContact(userId, contactDataWithDefaults);
      
      return NextResponse.json({ contact });
    });
  } catch (error: unknown) {
    console.error('Error adding emergency contact:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add emergency contact' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/emergency/contact
 * Get user's emergency contacts
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const identifier = getClientIP(request);
    const { success } = await ratelimit.limit(identifier, 20, 60 * 1000, 'emergency_contact_get'); // 20 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Authenticate user
    return authMiddleware(request, async (authenticatedRequest) => {
    
      // Get user info from authenticated request
      const userId = authenticatedRequest.user?.userId;
      
      if (!userId) {
        return NextResponse.json(
          { error: 'User ID not found' },
          { status: 401 }
        );
      }
      
      // Get user's emergency contacts
      const contacts = await emergencyService.getUserEmergencyContacts(userId);
      
      return NextResponse.json({ contacts });
    });
  } catch (error: unknown) {
    console.error('Error getting emergency contacts:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get emergency contacts' },
      { status: 500 }
    );
  }
}

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
