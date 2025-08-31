import { NextRequest, NextResponse } from "next/server";
import { logoutUser } from "@/lib/auth";
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request (you'll need to implement auth middleware for this)
    // For now, we'll get it from the request body or JWT token
    let userId: string | null = null;
    
    try {
      const body = await request.json();
      userId = body.userId;
    } catch (error) {
      // No body provided, that's ok for logout
    }

    // Create audit log if we have user ID
    if (userId) {
      await logoutUser(userId);
    }

    // Clear the authentication cookie
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" }
    );

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