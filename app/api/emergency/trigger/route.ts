import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { EnterpriseAuth } from '@/lib/auth-enterprise';
import { db } from '@/lib/db-enterprise';

// Validation schema for emergency trigger
const emergencyTriggerSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  emergencyType: z.enum(['medical', 'crime', 'accident', 'personal_safety', 'natural_disaster']),
  severity: z.number().min(1).max(5),
  description: z.string().optional(),
  media: z.array(z.string().url()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Get user from auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await EnterpriseAuth.verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Fetch user and emergency contacts together
    const [user, emergencyContacts] = await Promise.all([
      db.user.findUnique({
        where: { id: payload.userId }
      }),
      db.emergencyContact.findMany({
        where: { userId: payload.userId }
      })
    ]);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = emergencyTriggerSchema.safeParse(body);

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
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create emergency alert with sub-3-second target
    const startTime = Date.now();
    
    // Create emergency alert in database
    const emergencyAlert = await db.emergencyAlert.create({
      data: {
        userId: user.id,
        latitude: data.latitude,
        longitude: data.longitude,
        alertType: data.emergencyType,
        message: data.description,
        status: 'active',
        contacts: JSON.stringify(emergencyContacts || []),
      }
    });

    // Trigger 112 emergency service integration (mock implementation)
    const emergency112Response = await trigger112Service({
      userId: user.id,
      location: {
        latitude: data.latitude,
        longitude: data.longitude
      },
      emergencyType: data.emergencyType,
      severity: data.severity,
      userInfo: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        phone: user.phone,
        emergencyContacts: emergencyContacts || []
      }
    });

    // Update emergency alert with 112 response
    await db.emergencyAlert.update({
      where: { id: emergencyAlert.id },
      data: {
        contacts: JSON.stringify({
          emergencyContacts: emergencyContacts || [],
          emergency112: emergency112Response
        })
      }
    });

    // Notify emergency contacts
    await notifyEmergencyContacts({
      userId: user.id,
      alertId: emergencyAlert.id,
      location: {
        latitude: data.latitude,
        longitude: data.longitude
      },
      emergencyType: data.emergencyType,
      severity: data.severity
    });

    // Log emergency trigger event
    await EnterpriseAuth.logAuditEvent(
      user.id,
      'emergency_triggered',
      'emergency',
      ipAddress,
      userAgent,
      {
        alertId: emergencyAlert.id,
        emergencyType: data.emergencyType,
        severity: data.severity,
        responseTime: Date.now() - startTime
      }
    );

    // Ensure sub-3-second response
    const responseTime = Date.now() - startTime;
    if (responseTime > 3000) {
      console.warn(`Emergency response took ${responseTime}ms - exceeds 3-second target`);
    }

    return NextResponse.json(
      {
        success: true,
        alertId: emergencyAlert.id,
        message: 'Emergency alert triggered successfully',
        responseTime: responseTime,
        emergency112: emergency112Response
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Emergency trigger error:', error);
    return NextResponse.json(
      { error: 'Failed to trigger emergency alert' },
      { status: 500 }
    );
  }
}

// Mock 112 emergency service integration
async function trigger112Service(data: any) {
  // In a real implementation, this would integrate with India's 112 emergency service
  // This is a mock implementation for demonstration purposes
  
  console.log('Triggering 112 emergency service:', data);
  
  // Simulate API call to 112 service
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    contacted: true,
    requestId: `112-${Date.now()}`,
    dispatchTime: new Date(),
    eta: Math.floor(Math.random() * 5) + 3, // 3-8 minutes
    status: 'dispatched'
  };
}

// Mock emergency contact notification
async function notifyEmergencyContacts(data: any) {
  // In a real implementation, this would send notifications to emergency contacts
  // This is a mock implementation for demonstration purposes
  
  console.log('Notifying emergency contacts:', data);
  
  // Simulate sending notifications
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return {
    notified: true,
    notificationsSent: data.userId ? 1 : 0
  };
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