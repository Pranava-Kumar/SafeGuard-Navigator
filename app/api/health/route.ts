import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Test connection to backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: "Frontend can connect to backend",
        backendData: data
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Backend is not responding properly",
        status: response.status
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({
      success: false,
      message: "Cannot connect to backend",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}