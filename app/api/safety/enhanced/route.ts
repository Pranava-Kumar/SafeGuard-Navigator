/**
 * Enhanced Safety Score API Endpoint
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

// Validation schema for safety score requests
const SafetyScoreRequestSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  userType: z.enum(['pedestrian', 'two_wheeler', 'cyclist', 'public_transport']).optional().default('pedestrian'),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional().default('afternoon'),
  weatherCondition: z.enum(['clear', 'cloudy', 'rainy', 'stormy']).optional().default('clear')
});

// Batch safety score request schema
const BatchSafetyScoreSchema = z.object({
  locations: z.array(z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180)
  })).max(50), // Limit batch size
  userType: z.enum(['pedestrian', 'two_wheeler', 'cyclist', 'public_transport']).optional().default('pedestrian'),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional().default('afternoon'),
  weatherCondition: z.enum(['clear', 'cloudy', 'rainy', 'stormy']).optional().default('clear')
});

type SafetyScoreRequest = z.infer<typeof SafetyScoreRequestSchema>;
type BatchSafetyScoreRequest = z.infer<typeof BatchSafetyScoreSchema>;

/**
 * Generate safety recommendations based on safety score result
 */
function generateSafetyRecommendationsFromResult(safetyResult: any): string[] {
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
      
      const { locations, userType, timeOfDay, weatherCondition } = validation.data;
      
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
            
            return {
              lat: location.lat,
              lng: location.lng,
              score: safetyResult.overall,
              factors: safetyResult.factors,
              confidence: safetyResult.confidence,
              recommendations: generateSafetyRecommendations(safetyResult.factors),
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
      
      const { lat, lng, userType, timeOfDay, weatherCondition } = validation.data;
      
      const context: SafetyScoreContext = {
        userType,
        timeOfDay,
        weatherCondition
      };
      
      const safetyResult = await calculateComprehensiveSafetyScore([lat, lng], context);
      
      const response = {
        success: true,
        data: {
          score: safetyResult.overall,
          factors: safetyResult.factors,
          confidence: safetyResult.confidence,
          weights: DEFAULT_WEIGHTS,
          recommendations: generateSafetyRecommendations(safetyResult.factors),
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
 * GET /api/safety/enhanced
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
      weatherCondition: (searchParams.get('weatherCondition') || 'clear') as 'clear' | 'cloudy' | 'rainy' | 'stormy'
    };
    
    const { data: validatedData, error: validationError } = validateInput(
      queryData,
      SafetyScoreRequestSchema
    );
    
    if (validationError) {
      return validationError;
    }
    
    const { lat, lng, userType, timeOfDay, weatherCondition } = validatedData;
    
    // Get comprehensive safety score using real data
    const safetyResult = await calculateComprehensiveSafetyScore(
      [lat, lng],
      { userType, timeOfDay, weatherCondition }
    );
    
    // Generate recommendations based on safety score and factors
    const recommendations = generateSafetyRecommendations(safetyResult.factors);
    
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

// Helper function to validate input
function validateInput<T>(
  data: any,
  schema: z.ZodSchema<T>
): { data: T; error?: NextResponse } {
  try {
    const result = schema.safeParse(data);
    
    if (!result.success) {
      return {
        data: undefined as any,
        error: NextResponse.json(
          {
            success: false,
            message: 'Invalid input data',
            errors: result.error.flatten()
          },
          { status: 400 }
        )
      };
    }
    
    return { data: result.data };
  } catch (error) {
    return {
      data: undefined as any,
      error: NextResponse.json(
        {
          success: false,
          message: 'Input validation failed',
          error: error instanceof Error ? error.message : 'Unknown validation error'
        },
        { status: 400 }
      )
    };
  }
}