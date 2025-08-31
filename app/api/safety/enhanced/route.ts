import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth, withRateLimit, validateInput, getClientIP, createAPIResponse, withErrorHandling, CoordinatesSchema } from "@/lib/middleware";
import { getSafetyScore } from "@/lib/safety-score";
import { dataIntegration } from "@/lib/data-integration";
import { db } from "@/lib/db";

// Request validation schemas
const SafetyScoreRequestSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  userType: z.enum(['pedestrian', 'two_wheeler', 'cyclist', 'public_transport']).optional().default('pedestrian'),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional().default('afternoon'),
  refreshData: z.boolean().optional().default(false)
});

const BatchSafetyScoreSchema = z.object({
  locations: z.array(CoordinatesSchema).max(50), // Limit batch size
  userType: z.enum(['pedestrian', 'two_wheeler', 'cyclist', 'public_transport']).optional().default('pedestrian'),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional().default('afternoon')
});

type SafetyScoreRequest = z.infer<typeof SafetyScoreRequestSchema>;
type BatchSafetyScoreRequest = z.infer<typeof BatchSafetyScoreSchema>;





/**
 * Generate safety recommendations based on safety score result
 */
function generateSafetyRecommendations(safetyResult: any): string[] {
  const recommendations: string[] = [];
  const { overall, factors } = safetyResult;

  // Overall score recommendations
  if (overall < 40) {
    recommendations.push("High risk area - avoid if possible, especially at night");
    recommendations.push("Travel with others and use main roads only");
    recommendations.push("Keep emergency contacts readily accessible");
  } else if (overall < 60) {
    recommendations.push("Moderate risk - stay alert and aware of surroundings");
    recommendations.push("Use well-lit paths and avoid shortcuts");
    recommendations.push("Share your location with trusted contacts");
  } else if (overall < 80) {
    recommendations.push("Generally safe - maintain normal precautions");
    recommendations.push("Stay aware of your surroundings");
  } else {
    recommendations.push("Safe area for normal activities");
    recommendations.push("Maintain basic safety awareness");
  }

  // Factor-specific recommendations
  if (factors.lighting.score < 50) {
    recommendations.push("Poor lighting - use flashlight and avoid dark areas");
  }
  
  if (factors.footfall.score < 40) {
    recommendations.push("Low pedestrian activity - avoid isolated areas");
  }
  
  if (factors.hazards.score > 60) {
    recommendations.push("Recent incidents reported - exercise extra caution");
  }
  
  if (factors.proximityToHelp.score < 40) {
    recommendations.push("Emergency services far - have backup communication plan");
  }

  return recommendations.slice(0, 6); // Limit to 6 recommendations
}



/**
 * POST /api/safety/enhanced
 * Calculate safety score with optional batch processing
 */
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = withRateLimit(clientIP, 50, 15); // 50 requests per 15 minutes for POST
    if (!rateLimitResult.allowed) {
      return rateLimitResult.error!;
    }

    // Authentication required for POST
    const { user, error: authError } = await withAuth(request);
    if (authError) {
      return authError;
    }

    try {
      const body = await request.json();
      
      // Check if it's a batch request
      if (body.locations && Array.isArray(body.locations)) {
        // Batch processing
        const { data: validatedData, error: validationError } = validateInput(
          body,
          BatchSafetyScoreSchema
        );

        if (validationError) {
          return validationError;
        }

        const { locations, userType, timeOfDay } = validatedData;
        const results = [];

        for (const location of locations) {
          try {
            const safetyResult = await getSafetyScore(
              location.latitude,
              location.longitude,
              userType as any,
              timeOfDay as any
            );
            
            results.push({
              location: {
                latitude: location.latitude,
                longitude: location.longitude
              },
              score: safetyResult.overall,
              factors: safetyResult.factors,
              confidence: safetyResult.confidence,
              recommendations: generateSafetyRecommendations(safetyResult)
            });
          } catch (error) {
            console.error(`Error calculating safety score for ${location.latitude}, ${location.longitude}:`, error);
            results.push({
              location: {
                latitude: location.latitude,
                longitude: location.longitude
              },
              error: 'Failed to calculate safety score'
            });
          }
        }

        return NextResponse.json(createAPIResponse(true, {
          results,
          totalLocations: locations.length,
          successfulCalculations: results.filter(r => !r.error).length,
          userType,
          timeOfDay
        }));
      } else {
        // Single location request
        const { data: validatedData, error: validationError } = validateInput(
          body,
          SafetyScoreRequestSchema
        );

        if (validationError) {
          return validationError;
        }

        const { latitude, longitude, userType, timeOfDay, refreshData } = validatedData;

        // Refresh data from external sources if requested (premium feature)
        if (refreshData && (user?.role === 'premium' || user?.role === 'admin')) {
          await dataIntegration.refreshLocationData(latitude, longitude);
        }

        // Get comprehensive safety score using real data
        const safetyResult = await getSafetyScore(
          latitude,
          longitude,
          userType as any,
          timeOfDay as any
        );

        // Generate recommendations
        const recommendations = generateSafetyRecommendations(safetyResult);

        const response = {
          score: safetyResult.overall,
          factors: safetyResult.factors,
          confidence: safetyResult.confidence,
          recommendations,
          contextualFactors: safetyResult.contextualFactors,
          metadata: {
            algorithm: 'SafeRoute Multi-Factor v1.0',
            version: '1.0.0',
            dataSources: safetyResult.sources,
            lastUpdated: safetyResult.lastUpdated.toISOString(),
            userType,
            timeOfDay,
            userId: user?.id
          }
        };

        return NextResponse.json(createAPIResponse(true, response));
      }

    } catch (error) {
      console.error('POST enhanced safety score error:', error);
      return NextResponse.json(
        createAPIResponse(false, null, 'Failed to process safety score request'),
        { status: 500 }
      );
    }
  });
}

/**
 * GET /api/safety/enhanced
 * Get enhanced safety score for a single location with real-world data integration
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = withRateLimit(clientIP, 100, 15); // 100 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return rateLimitResult.error!;
    }

    // Authentication (optional for GET, but tracks usage)
    const { user } = await withAuth(request);
    const isAuthenticated = !!user;

    try {
      const { searchParams } = new URL(request.url);
      
      // Parse and validate query parameters
      const queryData = {
        latitude: parseFloat(searchParams.get('lat') || '0'),
        longitude: parseFloat(searchParams.get('lng') || '0'),
        userType: searchParams.get('userType') || 'pedestrian',
        timeOfDay: searchParams.get('timeOfDay') || 'afternoon',
        refreshData: searchParams.get('refreshData') === 'true'
      };

      const { data: validatedData, error: validationError } = validateInput(
        queryData,
        SafetyScoreRequestSchema
      );

      if (validationError) {
        return validationError;
      }

      const { latitude, longitude, userType, timeOfDay, refreshData } = validatedData;

      // Refresh data from external sources if requested (premium feature)
      if (refreshData && isAuthenticated && (user?.role === 'premium' || user?.role === 'admin')) {
        await dataIntegration.refreshLocationData(latitude, longitude);
      }

      // Get comprehensive safety score using real data
      const safetyResult = await getSafetyScore(
        latitude,
        longitude,
        userType as any,
        timeOfDay as any
      );

      // Get additional context from database
      const recentIncidents = await db.incidentReport.count({
        where: {
          latitude: { gte: latitude - 0.01, lte: latitude + 0.01 },
          longitude: { gte: longitude - 0.01, lte: longitude + 0.01 },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
          status: { in: ['pending', 'verified'] }
        }
      });

      const nearbyPOIs = await db.pOIData.count({
        where: {
          latitude: { gte: latitude - 0.005, lte: latitude + 0.005 },
          longitude: { gte: longitude - 0.005, lte: longitude + 0.005 },
          isActive: true
        }
      });

      // Generate recommendations based on safety score and factors
      const recommendations = generateSafetyRecommendations(safetyResult);

      const response = {
        score: safetyResult.overall,
        factors: safetyResult.factors,
        confidence: safetyResult.confidence,
        recommendations,
        contextualFactors: safetyResult.contextualFactors,
        metadata: {
          algorithm: 'SafeRoute Multi-Factor v1.0',
          version: '1.0.0',
          dataSources: safetyResult.sources,
          lastUpdated: safetyResult.lastUpdated.toISOString(),
          recentIncidents,
          nearbyPOIs,
          userType,
          timeOfDay,
          isAuthenticated
        }
      };

      return NextResponse.json(createAPIResponse(true, response));

    } catch (error) {
      console.error('Enhanced safety score error:', error);
      return NextResponse.json(
        createAPIResponse(false, null, 'Failed to calculate safety score'),
        { status: 500 }
      );
    }
  });
}