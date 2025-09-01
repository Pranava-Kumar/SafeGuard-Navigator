/**
 * SafeRoute User Logout API
 * DPDP Act 2023 Compliant Logout Endpoint
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod';
import { logoutUser } from "@/lib/auth";

// Validation schema for logout
const logoutSchema = z.object({
  refreshToken: z.string().optional(),
  allDevices: z.boolean().optional().default(false)
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const validationResult = logoutSchema.safeParse(body);
    
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
    
    // Get refresh token from request body or cookies
    let refreshToken = data.refreshToken;
    if (!refreshToken) {
      refreshToken = request.cookies.get('refreshToken')?.value;
    }

    // If no refresh token found, try the old token format
    if (!refreshToken) {
      refreshToken = request.cookies.get('saferoute_token')?.value;
    }

    // Get user ID from token for audit logging
    let userId = null;
    if (refreshToken) {
      // In a real implementation, you would decode the token to get the user ID
      // For now, we'll pass null and let the logoutUser function handle the audit logging differently
    }

    // Get client information for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Logout user
    await logoutUser(userId || 'unknown');

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear refresh token cookie if it exists
    if (request.cookies.has('refreshToken')) {
      response.cookies.set({
        name: 'refreshToken',
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
    }
    
    // Also clear the old token format
    response.cookies.set('saferoute_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: "Logout endpoint. Use POST to logout." },
    { status: 405 }
  );
}