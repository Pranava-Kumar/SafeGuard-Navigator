import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface SafetyScoreRequest {
  latitude: number;
  longitude: number;
  timeOfDay?: string;
}

interface SafetyFactors {
  lighting: string;
  traffic: string;
  people: string;
  crime: string;
  weather?: string;
}

interface SafetyScoreResponse {
  score: number;
  factors: SafetyFactors;
  confidence: number;
  recommendations: string[];
  timestamp: string;
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

function generateSafetyFactors(lat: number, lng: number, timeOfDay: string): SafetyFactors {
  const factors: SafetyFactors = {
    lighting: "Good",
    traffic: "Moderate",
    people: "Moderate",
    crime: "Low"
  };
  
  // Simulate factor generation based on location and time
  const locationHash = Math.abs(Math.sin(lat * lng) * 100);
  
  if (timeOfDay === "night") {
    factors.lighting = locationHash > 50 ? "Good" : "Poor";
    factors.people = "Low";
    factors.crime = locationHash > 70 ? "Low" : "Moderate";
  } else {
    factors.lighting = "Good";
    factors.people = locationHash > 50 ? "High" : "Moderate";
    factors.traffic = locationHash > 60 ? "High" : "Moderate";
  }
  
  return factors;
}

function calculateConfidenceScore(factors: SafetyFactors): number {
  let confidence = 0.7; // Base confidence
  
  // Adjust confidence based on factor quality
  if (factors.lighting === "Good") confidence += 0.1;
  if (factors.people === "High") confidence += 0.1;
  if (factors.crime === "Low") confidence += 0.1;
  
  return Math.min(1.0, confidence);
}

function generateRecommendations(score: number, factors: SafetyFactors): string[] {
  const recommendations: string[] = [];
  
  if (score < 40) {
    recommendations.push("Avoid this area if possible");
    recommendations.push("Travel with others if you must visit");
    recommendations.push("Stay in well-lit areas");
  } else if (score < 60) {
    recommendations.push("Stay alert and aware of surroundings");
    recommendations.push("Keep emergency contacts handy");
    recommendations.push("Avoid isolated areas");
  } else if (score < 80) {
    recommendations.push("Normal precautions recommended");
    recommendations.push("Share your location with friends");
  } else {
    recommendations.push("Area appears safe for normal activities");
    recommendations.push("Still maintain basic safety awareness");
  }
  
  if (factors.lighting === "Poor") {
    recommendations.push("Use flashlight or stay in well-lit areas");
  }
  
  if (factors.people === "Low") {
    recommendations.push("Consider traveling during busier times");
  }
  
  if (factors.crime === "High") {
    recommendations.push("Avoid displaying valuables");
    recommendations.push("Keep phone accessible for emergencies");
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

export async function POST(request: NextRequest) {
  try {
    const body: SafetyScoreRequest = await request.json();
    const { latitude, longitude, timeOfDay = "day" } = body;
    
    // Validate input
    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }
    
    // Calculate safety score
    let score = calculateBaseSafetyScore(latitude, longitude);
    score = adjustScoreForTime(score, timeOfDay);
    
    // Generate safety factors
    const factors = generateSafetyFactors(latitude, longitude, timeOfDay);
    
    // Calculate confidence
    const confidence = calculateConfidenceScore(factors);
    
    // Generate recommendations
    const recommendations = generateRecommendations(score, factors);
    
    // Store in database (optional)
    try {
      await db.safetyScore.create({
        data: {
          latitude,
          longitude,
          score,
          factors: JSON.stringify(factors),
          timestamp: new Date()
        }
      });
    } catch (dbError) {
      console.error("Error storing safety score:", dbError);
      // Continue even if database storage fails
    }
    
    const response: SafetyScoreResponse = {
      score,
      factors,
      confidence,
      recommendations,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error calculating safety score:", error);
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
    
    if (bounds) {
      // Parse bounds: "lat,lng,lat,lng"
      const [minLat, minLng, maxLat, maxLng] = bounds.split(",").map(Number);
      
      if (isNaN(minLat) || isNaN(minLng) || isNaN(maxLat) || isNaN(maxLng)) {
        return NextResponse.json(
          { error: "Invalid bounds format" },
          { status: 400 }
        );
      }
      
      // Get safety scores within bounds
      const safetyScores = await db.safetyScore.findMany({
        where: {
          latitude: {
            gte: minLat,
            lte: maxLat
          },
          longitude: {
            gte: minLng,
            lte: maxLng
          }
        },
        orderBy: {
          timestamp: "desc"
        },
        take: 100 // Limit results
      });
      
      return NextResponse.json(safetyScores);
    }
    
    // Get recent safety scores
    const recentScores = await db.safetyScore.findMany({
      orderBy: {
        timestamp: "desc"
      },
      take: 50
    });
    
    return NextResponse.json(recentScores);
    
  } catch (error) {
    console.error("Error fetching safety scores:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}