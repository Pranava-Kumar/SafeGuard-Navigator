import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies or Authorization header
    const cookieStore = await cookies();
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

    // Proxy request to backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // If unauthorized, clear the cookie
      if (response.status === 401) {
        const nextResponse = NextResponse.json(
          { success: false, message: "Invalid or expired token" },
          { status: 401 }
        );
        nextResponse.cookies.set('saferoute_token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 0,
          path: '/'
        });
        return nextResponse;
      }
      
      return NextResponse.json(
        { success: false, message: "Failed to fetch user data" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform backend response to match frontend expectations
    const user = {
      id: data.id.toString(),
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      displayName: data.display_name || `${data.first_name} ${data.last_name}`,
      phone: data.phone || null,
      avatar: data.avatar || null,
      userType: data.user_type || 'pedestrian',
      role: data.role || 'user',
      emailVerified: data.email_verified || false,
      language: data.language || 'en',
      city: data.city || null,
      state: data.state || null,
      country: data.country || 'India',
      subscriptionPlan: data.subscription_plan || 'free',
      subscriptionStatus: data.subscription_status || 'active',
      dataProcessingConsent: data.data_processing_consent || false,
      consentDate: data.consent_date || null,
      consentVersion: data.consent_version || '1.0',
      locationSharingLevel: data.location_sharing_level || 'coarse',
      crowdsourcingParticipation: data.crowdsourcing_participation !== undefined ? data.crowdsourcing_participation : true,
      personalizedRecommendations: data.personalized_recommendations !== undefined ? data.personalized_recommendations : true,
      analyticsConsent: data.analytics_consent || false,
      marketingConsent: data.marketing_consent || false,
      riskTolerance: data.risk_tolerance || 50,
      timePreference: data.time_preference || 'safety_first',
      lastLoginAt: data.last_login_at || null,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    };

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