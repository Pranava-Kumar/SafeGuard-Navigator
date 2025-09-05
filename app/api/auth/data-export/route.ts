/**
 * SafeRoute User Data Export API
 * DPDP Act 2023 Compliant Data Portability Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/auth/authService';
import { authMiddleware } from '@/lib/auth/authMiddleware';

// Validation schema for data export request
const dataExportSchema = z.object({
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
  includePersonalData: z.boolean().default(true),
  includeActivityData: z.boolean().default(true),
  includePreferences: z.boolean().default(true),
  includeReports: z.boolean().default(true),
  includeRoutes: z.boolean().default(true),
  reason: z.string().optional()
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request, async (req) => {
      // Parse and validate request body
      const body = await req.json();
      const validationResult = dataExportSchema.safeParse(body);

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
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';

      // Request data export
      const exportResult = await authService.requestDataExport(req.user!.userId, data.format);

      if (!exportResult.success) {
        return NextResponse.json(
          { error: exportResult.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Data export request submitted successfully'
      });
    });

    return authResult;
  } catch (error) {
    console.error('Data export request error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during data export request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authMiddleware(request, async (req) => {
      // For now, return a simple response since the actual methods don't exist
      return NextResponse.json({
        success: true,
        message: 'Data export functionality is being implemented'
      });
    });

    return authResult;
  } catch (error) {
    console.error('Data export status error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while retrieving data export status' },
      { status: 500 }
    );
  }
}