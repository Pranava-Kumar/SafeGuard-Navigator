import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withAuth, withRateLimit, validateInput, getClientIP, createAPIResponse, withErrorHandling, CoordinatesSchema } from "@/lib/middleware";
import { getSafetyScore } from "@/lib/safety-score";
import { db } from "@/lib/db";

interface HeatmapPoint {
  latitude: number;
  longitude: number;
  score: number;
  weight: number;
  confidence: number;
}

// Request validation schema
const HeatmapRequestSchema = z.object({
  bounds: z.object({
    north: z.number().min(-90).max(90),
    south: z.number().min(-90).max(90),
    east: z.number().min(-180).max(180),
    west: z.number().min(-180).max(180)
  }),
  zoom: z.number().min(1).max(20),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night']).optional().default('afternoon'),
  userType: z.enum(['pedestrian', 'two_wheeler', 'cyclist', 'public_transport']).optional().default('pedestrian')
});

type HeatmapRequest = z.infer<typeof HeatmapRequestSchema>;

/**
 * Generate real-time safety heatmap data using SafeRoute scoring algorithm
 */
async function generateHeatmapData(
  bounds: { north: number; south: number; east: number; west: number },
  zoom: number,
  timeOfDay: string = "afternoon",
  userType: string = "pedestrian"
): Promise<HeatmapPoint[]> {
  const points: HeatmapPoint[] = [];
  
  // Calculate grid size based on zoom level (more points for higher zoom)
  const gridSize = Math.max(0.001, 0.05 / Math.pow(2, zoom - 10));
  
  // Limit grid size to prevent too many API calls
  const maxPoints = 200;
  const latSteps = Math.min(Math.ceil((bounds.north - bounds.south) / gridSize), Math.sqrt(maxPoints));
  const lngSteps = Math.min(Math.ceil((bounds.east - bounds.west) / gridSize), Math.sqrt(maxPoints));
  
  const actualLatStep = (bounds.north - bounds.south) / latSteps;
  const actualLngStep = (bounds.east - bounds.west) / lngSteps;

  // Generate grid points and calculate safety scores
  for (let i = 0; i <= latSteps; i++) {
    for (let j = 0; j <= lngSteps; j++) {
      const lat = bounds.south + (i * actualLatStep);
      const lng = bounds.west + (j * actualLngStep);
      
      try {
        // Get real safety score for this location
        const safetyResult = await getSafetyScore(
          lat,
          lng,
          userType as any,
          timeOfDay as any
        );
        
        // Calculate weight based on zoom level and confidence
        const weight = Math.max(0.1, (zoom / 20) * safetyResult.confidence);
        
        points.push({
          latitude: lat,
          longitude: lng,
          score: safetyResult.overall,
          weight,
          confidence: safetyResult.confidence
        });
      } catch (error) {
        console.error(`Error calculating safety score for ${lat}, ${lng}:`, error);
        // Add fallback point with neutral score
        points.push({
          latitude: lat,
          longitude: lng,
          score: 50,
          weight: 0.1,
          confidence: 0.2
        });
      }
    }
  }

  return points;
}

/**
 * GET /api/safety/heatmap
 * Get safety heatmap data for visualization
 */
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = withRateLimit(clientIP, 30, 15); // 30 requests per 15 minutes
    if (!rateLimitResult.allowed) {
      return rateLimitResult.error!;
    }

    try {
      const { searchParams } = new URL(request.url);
      
      // Parse query parameters
      const bounds = searchParams.get("bounds");
      const zoom = searchParams.get("zoom");
      const timeOfDay = searchParams.get("timeOfDay") || "afternoon";
      const userType = searchParams.get("userType") || "pedestrian";

      if (!bounds || !zoom) {
        return NextResponse.json(
          createAPIResponse(false, null, "Bounds and zoom are required"),
          { status: 400 }
        );
      }

      // Parse bounds: "north,south,east,west"
      const [north, south, east, west] = bounds.split(",").map(Number);
      
      if ([north, south, east, west].some(isNaN)) {
        return NextResponse.json(
          createAPIResponse(false, null, "Invalid bounds format"),
          { status: 400 }
        );
      }

      const zoomNum = parseInt(zoom);
      if (isNaN(zoomNum) || zoomNum < 1 || zoomNum > 20) {
        return NextResponse.json(
          createAPIResponse(false, null, "Invalid zoom level"),
          { status: 400 }
        );
      }

      const requestData = {
        bounds: { north, south, east, west },
        zoom: zoomNum,
        timeOfDay: timeOfDay as any,
        userType: userType as any
      };

      const { data: validatedData, error: validationError } = validateInput(
        requestData,
        HeatmapRequestSchema
      );

      if (validationError) {
        return validationError;
      }

      // Check for cached heatmap data
      const cacheKey = `${north}_${south}_${east}_${west}_${zoomNum}_${timeOfDay}_${userType}`;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Try to get recent cached data first
      const recentData = await db.safetyScore.findMany({
        where: {
          latitude: { gte: south, lte: north },
          longitude: { gte: west, lte: east },
          userType,
          timeOfDay,
          timestamp: { gte: oneHourAgo }
        },
        take: 200,
        orderBy: { timestamp: 'desc' }
      });

      let heatmapData: HeatmapPoint[];
      
      if (recentData.length >= 10) {
        // Use cached data if we have enough recent points
        heatmapData = recentData.map(point => ({
          latitude: point.latitude,
          longitude: point.longitude,
          score: point.overallScore,
          weight: point.confidence * 0.8,
          confidence: point.confidence
        }));
      } else {
        // Generate fresh heatmap data
        heatmapData = await generateHeatmapData(
          validatedData.bounds,
          validatedData.zoom,
          validatedData.timeOfDay,
          validatedData.userType
        );
      }

      // Get additional statistics
      const avgScore = heatmapData.reduce((sum, point) => sum + point.score, 0) / heatmapData.length;
      const maxScore = Math.max(...heatmapData.map(p => p.score));
      const minScore = Math.min(...heatmapData.map(p => p.score));
      
      const response = {
        points: heatmapData,
        metadata: {
          totalPoints: heatmapData.length,
          fromCache: recentData.length >= 10,
          cachedPoints: recentData.length,
          freshPoints: heatmapData.length - recentData.length,
          bounds: validatedData.bounds,
          zoom: validatedData.zoom,
          timeOfDay: validatedData.timeOfDay,
          userType: validatedData.userType,
          statistics: {
            averageScore: Math.round(avgScore * 10) / 10,
            maxScore: Math.round(maxScore * 10) / 10,
            minScore: Math.round(minScore * 10) / 10,
            highRiskPoints: heatmapData.filter(p => p.score < 40).length,
            safePoints: heatmapData.filter(p => p.score >= 70).length
          },
          algorithm: 'SafeRoute Multi-Factor Heatmap v1.0',
          lastUpdated: new Date().toISOString()
        }
      };

      return NextResponse.json(createAPIResponse(true, response));

    } catch (error) {
      console.error('Heatmap generation error:', error);
      return NextResponse.json(
        createAPIResponse(false, null, 'Failed to generate heatmap data'),
        { status: 500 }
      );
    }
  });
}

function generateHeatmapData(
  bounds: { north: number; south: number; east: number; west: number },
  zoom: number,
  timeOfDay: string = "day"
): HeatmapPoint[] {
  const points: HeatmapPoint[] = [];
  
  // Calculate grid size based on zoom level
  const gridSize = Math.max(0.001, 0.1 / Math.pow(2, zoom - 10));
  
  // Generate grid points
  for (let lat = bounds.south; lat <= bounds.north; lat += gridSize) {
    for (let lng = bounds.west; lng <= bounds.east; lng += gridSize) {
      // Generate safety score for this point
      const baseScore = calculateBaseSafetyScore(lat, lng);
      const adjustedScore = adjustScoreForTime(baseScore, timeOfDay);
      
      // Calculate weight based on zoom level and score
      const weight = Math.max(0.1, (zoom / 20) * (adjustedScore / 100));
      
      points.push({
        latitude: lat,
        longitude: lng,
        score: adjustedScore,
        weight
      });
    }
  }
  
  return points;
}

function calculateBaseSafetyScore(lat: number, lng: number): number {
  // Mock implementation - in real app, this would use actual data
  let baseScore = 50;
  
  // Simulate location-based scoring
  const locationHash = Math.abs(Math.sin(lat * lng) * 100);
  baseScore += locationHash;
  
  // Adjust for general area characteristics
  if (lat > 13.08 && lat < 13.09 && lng > 80.27 && lng < 80.28) {
    baseScore += 20; // Downtown area - generally safer
  }
  
  return Math.max(0, Math.min(100, Math.round(baseScore)));
}

function adjustScoreForTime(score: number, timeOfDay: string): number {
  const timeAdjustments: Record<string, number> = {
    morning: 0,
    afternoon: 5,
    evening: -10,
    night: -20
  };
  
  const adjustment = timeAdjustments[timeOfDay.toLowerCase()] || 0;
  return Math.max(0, Math.min(100, score + adjustment));
}

export async function POST(request: NextRequest) {
  try {
    const body: HeatmapRequest = await request.json();
    const { bounds, zoom, timeOfDay = "day" } = body;
    
    // Validate input
    if (!bounds || !zoom) {
      return NextResponse.json(
        { error: "Bounds and zoom are required" },
        { status: 400 }
      );
    }
    
    const { north, south, east, west } = bounds;
    
    if (north <= south || east <= west) {
      return NextResponse.json(
        { error: "Invalid bounds" },
        { status: 400 }
      );
    }
    
    if (zoom < 1 || zoom > 20) {
      return NextResponse.json(
        { error: "Invalid zoom level" },
        { status: 400 }
      );
    }
    
    // Generate heatmap data
    const heatmapData = generateHeatmapData(bounds, zoom, timeOfDay);
    
    // Also try to get real data from database
    const realData = await db.safetyScore.findMany({
      where: {
        latitude: {
          gte: south,
          lte: north
        },
        longitude: {
          gte: west,
          lte: east
        }
      },
      orderBy: {
        timestamp: "desc"
      },
      take: 1000
    });
    
    // Combine real data with generated data
    const combinedData = [
      ...realData.map((point: SafetyScoreData) => ({
        latitude: point.latitude,
        longitude: point.longitude,
        score: point.score,
        weight: 0.8 // Higher weight for real data
      })),
      ...heatmapData
    ];
    
    return NextResponse.json({
      points: combinedData,
      metadata: {
        totalPoints: combinedData.length,
        realDataPoints: realData.length,
        generatedPoints: heatmapData.length,
        bounds,
        zoom,
        timeOfDay
      }
    });
    
  } catch (error) {
    console.error("Error generating heatmap data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bounds = searchParams.get("bounds");
    const zoom = searchParams.get("zoom");
    const timeOfDay = searchParams.get("timeOfDay") || "day";
    
    if (bounds && zoom) {
      // Parse bounds: "north,south,east,west"
      const [north, south, east, west] = bounds.split(",").map(Number);
      
      if (isNaN(north) || isNaN(south) || isNaN(east) || isNaN(west)) {
        return NextResponse.json(
          { error: "Invalid bounds format" },
          { status: 400 }
        );
      }
      
      const zoomNum = parseInt(zoom);
      if (isNaN(zoomNum) || zoomNum < 1 || zoomNum > 20) {
        return NextResponse.json(
          { error: "Invalid zoom level" },
          { status: 400 }
        );
      }
      
      // Generate heatmap data
      const heatmapData = generateHeatmapData(
        { north, south, east, west },
        zoomNum,
        timeOfDay
      );
      
      return NextResponse.json({
        points: heatmapData,
        metadata: {
          totalPoints: heatmapData.length,
          bounds: { north, south, east, west },
          zoom: zoomNum,
          timeOfDay
        }
      });
    }
    
    // Get recent safety statistics
    const recentScores = await db.safetyScore.findMany({
      orderBy: {
        timestamp: "desc"
      },
      take: 1000
    });
    
    // Calculate statistics
    const stats = {
      totalScores: recentScores.length,
      averageScore: recentScores.reduce((sum: number, point: SafetyScoreData) => sum + point.score, 0) / recentScores.length,
      highRiskAreas: recentScores.filter((point: SafetyScoreData) => point.score < 40).length,
      safeAreas: recentScores.filter((point: SafetyScoreData) => point.score >= 70).length,
      lastUpdated: recentScores[0]?.timestamp || null
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}