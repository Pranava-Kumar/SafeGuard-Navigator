import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getUserById } from "@/lib/auth";
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies or Authorization header
    const cookieStore = cookies();
    const tokenFromCookie = cookieStore.get('saferoute_token')?.value;
    const authHeader = request.headers.get('Authorization');
    const tokenFromHeader = authHeader?.replace('Bearer ', '');
    
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No authentication token provided" },
        { status: 401 }
      );
    }

    // Verify token
    const tokenPayload = verifyToken(token);
    
    if (!tokenPayload) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get user data
    const user = await getUserById(tokenPayload.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
      message: "User authenticated successfully"
    });

  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { message: "User profile endpoint. Use GET to get current user." },
    { status: 405 }
  );
}