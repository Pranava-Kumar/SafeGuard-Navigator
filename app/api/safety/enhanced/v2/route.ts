/**
 * Enhanced Safety Score API Endpoint with Real Data Integration
 * Implements the multi-factor SafetyScore algorithm with real-world data integration
 * Compatible with DPDP Act 2023 and India-specific requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  calculateComprehensiveSafetyScore, 
  generateSafetyRecommendations,
  getSafetyFactorDetails
} from '@/lib/safety/comprehensiveSafety';
import { 
  SafetyScoreContext,
  DEFAULT_WEIGHTS
} from '@/lib/safety/types';
import { db } from '@/lib/db';

// Validation schema for safety score requests
const SafetyScoreRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  userType: z.enum(['pedestrian', 'two_wheeler', 'cyclist', 'public_transport']).optional().default('pedestrian'),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional().default('afternoon'),
  weatherCondition: z.enum(['clear', 'cloudy', 'rainy', 'stormy']).optional().default('clear'),
  userId: z.string().optional()
});

// Batch safety score request schema
const BatchSafetyScoreSchema = z.object({
  locations: z.array(z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  })).max(50), // Limit batch size
  userType: z.enum(['pedestrian', 'two_wheeler', 'cyclist', 'public_transport']).optional().default('pedestrian'),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional().default('afternoon'),
  weatherCondition: z.enum(['clear', 'cloudy', 'rainy', 'stormy']).optional().default('clear'),
  userId: z.string().optional()
});

type SafetyScoreRequest = z.infer<typeof SafetyScoreRequestSchema>;
type BatchSafetyScoreRequest = z.infer<typeof BatchSafetyScoreSchema>;

/**
 * Generate safety recommendations based on safety score result
 */
function generateEnhancedSafetyRecommendations(safetyResult: any, context: SafetyScoreContext): string[] {
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
  if (factors.lighting < 50) {
    recommendations.push("Poor lighting - use flashlight and avoid dark areas");
  }
  
  if (factors.footfall < 40) {
    recommendations.push("Low pedestrian activity - avoid isolated areas");
  }
  
  if (factors.hazards > 60) { // Remember hazards is inverted (higher = more hazards)
    recommendations.push("Recent incidents reported - exercise extra caution");
  }
  
  if (factors.proximityToHelp < 40) {
    recommendations.push("Emergency services far - have backup communication plan");
  }

  // Context-specific recommendations
  if (context.timeOfDay === 'night' && overall < 70) {
    recommendations.push("Nighttime travel in this area - consider alternative timing");
  }
  
  if (context.weatherCondition === 'rainy' && overall < 65) {
    recommendations.push("Rainy conditions may worsen safety - take extra precautions");
  }

  return recommendations.slice(0, 8); // Limit to 8 recommendations
}

/**
 * Store safety score result in database for analytics
 */
async function storeSafetyScoreResult(
  coordinates: [number, number],
  result: any,
  context: SafetyScoreContext,
  userId?: string
): Promise<void> {
  try {
    await db.safetyScore.create({
      data: {
        latitude: coordinates[0],
        longitude: coordinates[1],
        overallScore: result.overall,
        confidence: result.confidence,
        lightingScore: result.factors.lighting,
        footfallScore: result.factors.footfall,
        hazardScore: result.factors.hazards,
        proximityScore: result.factors.proximityToHelp,
        timeOfDay: context.timeOfDay,
        userType: context.userType,
        sources: JSON.stringify(['cartosat3', 'osm', 'crowdsourced']),
        factors: JSON.stringify(result.factors),
        lightingData: JSON.stringify({ source: 'cartosat3', processed: true }),
        footfallData: JSON.stringify({ source: 'osm', processed: true }),
        hazardData: JSON.stringify({ source: 'crowdsourced', processed: true }),
        userId: userId
      }
    });
  } catch (error) {
    console.error('Error storing safety score result:', error);
    // Don't throw error as this is optional
  }
}

/**
 * POST /api/safety/enhanced/v2
 * Calculate enhanced safety score with optional batch processing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's a batch request
    if (body.locations && Array.isArray(body.locations)) {
      // Batch processing
      const validation = BatchSafetyScoreSchema.safeParse(body);
      
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid request data',
            errors: validation.error.flatten()
          },
          { status: 400 }
        );
      }
      
      const { locations, userType, timeOfDay, weatherCondition, userId } = validation.data;
      
      // Process all locations in parallel
      const results = await Promise.all(
        locations.map(async (location) => {
          try {
            const context: SafetyScoreContext = {
              userType,
              timeOfDay,
              weatherCondition
            };
            
            const safetyResult = await calculateComprehensiveSafetyScore(
              [location.lat, location.lng],
              context
            );
            
            // Store result for analytics
            await storeSafetyScoreResult(
              [location.lat, location.lng],
              safetyResult,
              context,
              userId
            );
            
            return {
              lat: location.lat,
              lng: location.lng,
              score: safetyResult.overall,
              factors: safetyResult.factors,
              confidence: safetyResult.confidence,
              recommendations: generateEnhancedSafetyRecommendations(safetyResult, context),
              factorDetails: getSafetyFactorDetails(safetyResult.factors)
            };
          } catch (error) {
            console.error(`Error calculating safety score for ${location.lat},${location.lng}:`, error);
            return {
              lat: location.lat,
              lng: location.lng,
              error: 'Failed to calculate safety score'
            };
          }
        })
      );
      
      return NextResponse.json({
        success: true,
        data: results,
        message: 'Batch safety scores calculated successfully'
      });
    } else {
      // Single location processing
      const validation = SafetyScoreRequestSchema.safeParse(body);
      
      if (!validation.success) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Invalid request data',
            errors: validation.error.flatten()
          },
          { status: 400 }
        );
      }
      
      const { lat, lng, userType, timeOfDay, weatherCondition, userId } = validation.data;
      
      const context: SafetyScoreContext = {
        userType,
        timeOfDay,
        weatherCondition
      };
      
      const safetyResult = await calculateComprehensiveSafetyScore([lat, lng], context);
      
      // Store result for analytics
      await storeSafetyScoreResult([lat, lng], safetyResult, context, userId);
      
      const response = {
        success: true,
        data: {
          score: safetyResult.overall,
          factors: safetyResult.factors,
          confidence: safetyResult.confidence,
          weights: DEFAULT_WEIGHTS,
          recommendations: generateEnhancedSafetyRecommendations(safetyResult, context),
          factorDetails: getSafetyFactorDetails(safetyResult.factors)
        },
        message: 'Safety score calculated successfully'
      };
      
      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('POST enhanced safety score error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process safety score request' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/safety/enhanced/v2
 * Get enhanced safety score for a single location with real-world data integration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate query parameters
    const queryData = {
      lat: parseFloat(searchParams.get('lat') || '0'),
      lng: parseFloat(searchParams.get('lng') || '0'),
      userType: (searchParams.get('userType') || 'pedestrian') as 'pedestrian' | 'two_wheeler' | 'cyclist' | 'public_transport',
      timeOfDay: (searchParams.get('timeOfDay') || 'afternoon') as 'morning' | 'afternoon' | 'evening' | 'night',
      weatherCondition: (searchParams.get('weatherCondition') || 'clear') as 'clear' | 'cloudy' | 'rainy' | 'stormy',
      userId: searchParams.get('userId') || undefined
    };
    
    const validation = SafetyScoreRequestSchema.safeParse(queryData);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid input data',
          errors: validation.error.flatten()
        },
        { status: 400 }
      );
    }
    
    const { lat, lng, userType, timeOfDay, weatherCondition, userId } = validation.data;
    
    // Get comprehensive safety score using real data
    const context: SafetyScoreContext = { userType, timeOfDay, weatherCondition };
    const safetyResult = await calculateComprehensiveSafetyScore([lat, lng], context);
    
    // Store result for analytics
    await storeSafetyScoreResult([lat, lng], safetyResult, context, userId);
    
    // Generate recommendations based on safety score and factors
    const recommendations = generateEnhancedSafetyRecommendations(safetyResult, context);
    
    const response = {
      success: true,
      data: {
        score: safetyResult.overall,
        factors: safetyResult.factors,
        confidence: safetyResult.confidence,
        weights: DEFAULT_WEIGHTS,
        recommendations,
        factorDetails: getSafetyFactorDetails(safetyResult.factors)
      },
      message: 'Safety score retrieved successfully'
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Enhanced safety score error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to calculate safety score' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/safety/enhanced/v2/history
 * Get historical safety scores for a location
 */
export async function GET_HISTORY(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const days = parseInt(searchParams.get('days') || '30');
    
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { success: false, message: 'Invalid coordinates' },
        { status: 400 }
      );
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Fetch historical safety scores
    const historicalScores = await db.safetyScore.findMany({
      where: {
        latitude: {
          gte: lat - 0.001,
          lte: lat + 0.001
        },
        longitude: {
          gte: lng - 0.001,
          lte: lng + 0.001
        },
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      },
      take: 100 // Limit to 100 records
    });
    
    // Process data for trend analysis
    const trendData = historicalScores.map(score => ({
      timestamp: score.timestamp,
      overallScore: score.overallScore,
      lightingScore: score.lightingScore || 50,
      footfallScore: score.footfallScore || 50,
      hazardScore: score.hazardScore || 50,
      proximityScore: score.proximityScore || 50
    }));
    
    return NextResponse.json({
      success: true,
      data: trendData,
      message: `Historical safety scores for the last ${days} days`
    });
    
  } catch (error) {
    console.error('Error fetching historical safety scores:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch historical safety scores' },
      { status: 500 }
    );
  }
}