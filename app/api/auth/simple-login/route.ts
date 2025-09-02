import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Proxy request to backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const loginResponse = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password
      }),
    });

    // Check if login response is OK before parsing JSON
    if (!loginResponse.ok) {
      let errorMessage = 'Login failed';
      try {
        const errorData = await loginResponse.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, use the text response
        try {
          const errorText = await loginResponse.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          errorMessage = 'Login failed with unknown error';
        }
      }

      return NextResponse.json({
        success: false,
        message: errorMessage,
      }, { status: loginResponse.status || 401 });
    }

    const loginData = await loginResponse.json();
    
    const userResponse = await fetch(`${backendUrl}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch user data',
      }, { status: userResponse.status || 500 });
    }

    const userData = await userResponse.json();

    // Create response with user data and set token cookie
    const nextResponse = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userData.id.toString(),
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        displayName: userData.display_name || `${userData.first_name} ${userData.last_name}`,
        phone: userData.phone || null,
        avatar: userData.avatar || null,
        userType: userData.user_type || 'pedestrian',
        role: userData.role || 'user',
        emailVerified: userData.email_verified || false,
        language: userData.language || 'en',
        city: userData.city || null,
        state: userData.state || null,
        country: userData.country || 'India',
        subscriptionPlan: userData.subscription_plan || 'free',
        subscriptionStatus: userData.subscription_status || 'active',
        dataProcessingConsent: userData.data_processing_consent || false,
        consentDate: userData.consent_date || null,
        consentVersion: userData.consent_version || '1.0',
        locationSharingLevel: userData.location_sharing_level || 'coarse',
        crowdsourcingParticipation: userData.crowdsourcing_participation !== undefined ? userData.crowdsourcing_participation : true,
        personalizedRecommendations: userData.personalized_recommendations !== undefined ? userData.personalized_recommendations : true,
        analyticsConcent: userData.analytics_consent || false,
        marketingConcent: userData.marketing_consent || false,
        riskTolerance: userData.risk_tolerance || 50,
        timePreference: userData.time_preference || 'safety_first',
        lastLoginAt: userData.last_login_at || null,
        createdAt: userData.created_at || new Date().toISOString(),
        updatedAt: userData.updated_at || new Date().toISOString(),
      }
    }, { status: 200 });

    // Set token as HTTP-only cookie
    nextResponse.cookies.set('saferoute_token', loginData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return nextResponse;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Network error. Please try again.'
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