import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface HeatmapPoint {
  latitude: number;
  longitude: number;
  score: number;
  weight: number;
}

interface HeatmapRequest {
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zoom: number;
  timeOfDay?: string;
}

interface SafetyScoreData {
  id: string;
  latitude: number;
  longitude: number;
  score: number;
  factors: string;
  timestamp: Date;
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