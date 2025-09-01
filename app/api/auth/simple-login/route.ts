import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const loginData = {
      email: body.email,
      password: body.password
    };

    const result = await loginUser(loginData);
    
    if (result.success) {
      const response = NextResponse.json({
        success: true,
        message: result.message,
        user: result.user
      }, { status: 200 });
      
      // Set token as HTTP-only cookie
      if (result.token) {
        response.cookies.set('saferoute_token', result.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60, // 7 days
          path: '/'
        });
      }
      
      return response;
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        errors: result.errors
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({
      success: false,
      message: 'Network error. Please try again.'
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}