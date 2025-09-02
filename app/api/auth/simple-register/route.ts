import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Proxy request to backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    
    // Only send the fields that the backend UserCreate schema expects
    const backendUserData = {
      email: body.email,
      password: body.password,
      first_name: body.firstName,
      last_name: body.lastName,
      phone: body.phone,
      city: body.city,
      state: body.state,
      user_type: body.userType || 'pedestrian',
      language: body.language || 'en',
      data_processing_consent: body.dataProcessingConsent || false,
      consent_version: body.consentVersion || '1.0'
    };
    
    const registerResponse = await fetch(`${backendUrl}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendUserData),
    });

    // Check if registration response is OK before parsing JSON
    if (!registerResponse.ok) {
      let errorMessage = 'Registration failed';
      try {
        const errorData = await registerResponse.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, use the text response
        try {
          const errorText = await registerResponse.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          errorMessage = 'Registration failed with unknown error';
        }
      }

      return NextResponse.json({
        success: false,
        message: errorMessage,
      }, { status: registerResponse.status || 400 });
    }

    const registerData = await registerResponse.json();
    
    // After registration, login the user automatically
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
      let loginErrorMessage = 'Login failed after registration';
      try {
        const loginErrorData = await loginResponse.json();
        loginErrorMessage = loginErrorData.detail || loginErrorMessage;
      } catch (parseError) {
        // If JSON parsing fails, use the text response
        try {
          const loginErrorText = await loginResponse.text();
          loginErrorMessage = loginErrorText || loginErrorMessage;
        } catch (textError) {
          loginErrorMessage = 'Login failed with unknown error';
        }
      }
      
      console.error('Login error:', loginErrorMessage);
      // Still return success for registration even if auto-login fails
      return NextResponse.json({
        success: true,
        message: 'Registration successful. Please login manually.',
        user: {
          id: registerData.id.toString(),
          email: registerData.email,
          firstName: registerData.first_name,
          lastName: registerData.last_name,
          displayName: `${registerData.first_name} ${registerData.last_name}`,
          phone: registerData.phone || null,
          avatar: registerData.avatar || null,
          userType: registerData.user_type || 'pedestrian',
          role: registerData.role || 'user',
          emailVerified: registerData.email_verified || false,
          language: registerData.language || 'en',
          city: registerData.city || null,
          state: registerData.state || null,
          country: registerData.country || 'India',
          subscriptionPlan: registerData.subscription_plan || 'free',
          subscriptionStatus: registerData.subscription_status || 'active',
          dataProcessingConsent: registerData.data_processing_consent || false,
          consentDate: registerData.consent_date || null,
          consentVersion: registerData.consent_version || '1.0',
          locationSharingLevel: registerData.location_sharing_level || 'coarse',
          crowdsourcingParticipation: registerData.crowdsourcing_participation !== undefined ? registerData.crowdsourcing_participation : true,
          personalizedRecommendations: registerData.personalized_recommendations !== undefined ? registerData.personalized_recommendations : true,
          analyticsConcent: registerData.analytics_concent || false,
          marketingConcent: registerData.marketing_concent || false,
          riskTolerance: registerData.risk_tolerance || 50,
          timePreference: registerData.time_preference || 'safety_first',
          lastLoginAt: registerData.last_login_at || null,
          createdAt: registerData.created_at || new Date().toISOString(),
          updatedAt: registerData.updated_at || new Date().toISOString(),
        }
      }, { status: 201 });
    }

    const loginData = await loginResponse.json();

    // Create response with user data and set token cookie
    const nextResponse = NextResponse.json({
      success: true,
      message: 'Registration and login successful',
      user: {
        id: registerData.id.toString(),
        email: registerData.email,
        firstName: registerData.first_name,
        lastName: registerData.last_name,
        displayName: `${registerData.first_name} ${registerData.last_name}`,
        phone: registerData.phone || null,
        avatar: registerData.avatar || null,
        userType: registerData.user_type || 'pedestrian',
        role: registerData.role || 'user',
        emailVerified: registerData.email_verified || false,
        language: registerData.language || 'en',
        city: registerData.city || null,
        state: registerData.state || null,
        country: registerData.country || 'India',
        subscriptionPlan: registerData.subscription_plan || 'free',
        subscriptionStatus: registerData.subscription_status || 'active',
        dataProcessingConsent: registerData.data_processing_consent || false,
        consentDate: registerData.consent_date || null,
        consentVersion: registerData.consent_version || '1.0',
        locationSharingLevel: registerData.location_sharing_level || 'coarse',
        crowdsourcingParticipation: registerData.crowdsourcing_participation !== undefined ? registerData.crowdsourcing_participation : true,
        personalizedRecommendations: registerData.personalized_recommendations !== undefined ? registerData.personalized_recommendations : true,
        analyticsConcent: registerData.analytics_concent || false,
        marketingConcent: registerData.marketing_concent || false,
        riskTolerance: registerData.risk_tolerance || 50,
        timePreference: registerData.time_preference || 'safety_first',
        lastLoginAt: registerData.last_login_at || null,
        createdAt: registerData.created_at || new Date().toISOString(),
        updatedAt: registerData.updated_at || new Date().toISOString(),
      }
    }, { status: 201 });

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
    console.error('Registration API error:', error);
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