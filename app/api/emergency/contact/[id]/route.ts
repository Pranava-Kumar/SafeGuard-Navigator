/**
 * SafeRoute Emergency Contact Management API
 * Implements emergency contact update, delete, and verify endpoints
 * Compliant with DPDP Act 2023
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ratelimit } from '@/lib/ratelimit';
import EmergencyAlertService from '@/lib/emergency/emergencyAlertService';
import { authMiddleware } from '@/lib/auth/authMiddleware';

// Initialize services
const emergencyService = new EmergencyAlertService();

// Schema for updating an emergency contact
const updateContactSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().min(5).max(20).optional(),
  email: z.string().email().optional(),
  relationship: z.string().min(1).max(50).optional(),
  notificationPreference: z.array(
    z.enum(['sms', 'call', 'email'])
  ).min(1).optional(),
  isPrimary: z.boolean().optional()
});

// Schema for verifying an emergency contact
const verifyContactSchema = z.object({
  code: z.string().min(6).max(6)
});

/**
 * PUT /api/emergency/contact/[id]
 * Update an emergency contact
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const identifier = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const { success } = await ratelimit.limit(identifier, 10, 60 * 1000, 'emergency_contact_update'); // 10 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Authenticate user
    let userId: string | undefined;
    const authResponse = await authMiddleware(request, async (req) => {
      userId = req.user?.userId;
      return NextResponse.json({ success: true });
    });
    
    // Check if authentication was successful
    if (authResponse.status !== 200) {
      return authResponse;
    }
    
    // Get contact ID from route params
    const contactId = params.id;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateContactSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const updates = validationResult.data;
    
    // Update emergency contact
    const contact = await emergencyService.updateEmergencyContact(contactId, userId!, updates);
    
    return NextResponse.json({ contact });
  } catch (error: unknown) {
    console.error('Error updating emergency contact:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update emergency contact' },
      { status: error instanceof Error && 'status' in error ? (error as Error & { status: number }).status : 500 }
    );
  }
}

/**
 * DELETE /api/emergency/contact/[id]
 * Delete an emergency contact
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const identifier = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const { success } = await ratelimit.limit(identifier, 10, 60 * 1000, 'emergency_contact_delete'); // 10 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Authenticate user
    let userId: string | undefined;
    const authResponse = await authMiddleware(request, async (req) => {
      userId = req.user?.userId;
      return NextResponse.json({ success: true });
    });
    
    // Check if authentication was successful
    if (authResponse.status !== 200) {
      return authResponse;
    }
    
    // Get contact ID from route params
    const contactId = params.id;
    
    // Delete emergency contact
    const deleteSuccess = await emergencyService.deleteEmergencyContact(contactId, userId!);
    
    if (!deleteSuccess) {
      return NextResponse.json(
        { error: 'Failed to delete emergency contact' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting emergency contact:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete emergency contact' },
      { status: error.status || 500 }
    );
  }
}

/**
 * POST /api/emergency/contact/[id]/verify
 * Verify an emergency contact with verification code
 */
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Apply rate limiting
    const identifier = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const { success } = await ratelimit.limit(identifier, 10, 60 * 1000, 'emergency_contact_verify'); // 10 requests per minute
    
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Get contact ID from route params
    const contactId = params.id;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = verifyContactSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const { code } = validationResult.data;
    
    // Verify emergency contact
    const verified = await emergencyService.verifyEmergencyContact(contactId, code);
    
    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true, verified });
  } catch (error: unknown) {
    console.error('Error verifying emergency contact:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to verify emergency contact' },
      { status: 500 }
    );
  }
}