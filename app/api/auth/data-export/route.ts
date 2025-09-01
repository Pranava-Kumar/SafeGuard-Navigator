/**
 * SafeRoute User Data Export API
 * DPDP Act 2023 Compliant Data Portability Endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/authService';
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
    const authResult = await authMiddleware(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
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
    const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Initialize AuthService
    const authService = new AuthService();

    // Request data export
    const exportResult = await authService.requestDataExport({
      userId: authResult.user!.id,
      format: data.format,
      includePersonalData: data.includePersonalData,
      includeActivityData: data.includeActivityData,
      includePreferences: data.includePreferences,
      includeReports: data.includeReports,
      includeRoutes: data.includeRoutes,
      reason: data.reason,
      ipAddress,
      userAgent
    });

    if (!exportResult.success) {
      return NextResponse.json(
        { error: exportResult.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data export request submitted successfully',
      requestId: exportResult.requestId,
      estimatedCompletionTime: exportResult.estimatedCompletionTime
    });
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
    const authResult = await authMiddleware(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.message },
        { status: 401 }
      );
    }

    // Get request ID from query parameters
    const requestId = request.nextUrl.searchParams.get('requestId');

    // Initialize AuthService
    const authService = new AuthService();

    if (requestId) {
      // Get specific export request status
      const exportStatus = await authService.getDataExportStatus(requestId, authResult.user!.id);
      
      if (!exportStatus.success) {
        return NextResponse.json(
          { error: exportStatus.message },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        status: exportStatus.status,
        downloadUrl: exportStatus.downloadUrl,
        expiresAt: exportStatus.expiresAt
      });
    } else {
      // Get all export requests for user
      const exportRequests = await authService.getDataExportRequests(authResult.user!.id);

      return NextResponse.json({
        success: true,
        exportRequests
      });
    }
  } catch (error) {
    console.error('Data export status error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while retrieving data export status' },
      { status: 500 }
    );
  }
}