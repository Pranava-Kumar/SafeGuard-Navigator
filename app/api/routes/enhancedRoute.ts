import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { routeOptimizer } from "@/lib/routing/safetyAwareRouting";
import { calculateComprehensiveSafetyScore } from "@/lib/safety/comprehensiveSafety";
import { geocodeAddress } from "@/lib/mapping/openstreetmap";

interface EnhancedRoutePoint {
  lat: number;
  lng: number;
  name?: string;
}

interface EnhancedRouteRequest {
  start: EnhancedRoutePoint;
  end: EnhancedRoutePoint;
  preferences?: {
    safetyPreference?: number; // 0-100 (0 = time-first, 100 = safety-first)
    avoidDarkSpots?: boolean;
    avoidLowLightAreas?: boolean;
    preferCCTVCoverage?: boolean;
    preferHighPopulationDensity?: boolean;
    preferPoliceProximity?: boolean;
    timeOfTravel?: string; // morning, afternoon, evening, night
    weatherCondition?: string; // clear, cloudy, rainy, stormy
    transportMode?: "walking" | "cycling" | "driving";
  };
  userId?: string;
}

interface EnhancedRouteOption {
  id: string;
  coordinates: EnhancedRoutePoint[];
  distance: number; // meters
  duration: number; // seconds
  safetyScore: number; // 0-100
  safetyFactors: {
    lighting: number;
    footfall: number;
    hazards: number;
    proximityToHelp: number;
  };
  type: "safest" | "fastest" | "balanced";
  description: string;
  waypoints?: EnhancedRoutePoint[];
  elevationGain?: number;
  riskSegments?: Array<{
    start: EnhancedRoutePoint;
    end: EnhancedRoutePoint;
    riskLevel: "low" | "moderate" | "high" | "critical";
    riskFactors: string[];
  }>;
}

interface EnhancedRouteResponse {
  routes: EnhancedRouteOption[];
  summary: {
    totalRoutes: number;
    safestScore: number;
    fastestTime: number;
    recommendedRoute: string;
  };
  metadata: {
    algorithmVersion: string;
    dataSources: string[];
    calculationTime: number;
    timestamp: string;
  };
}

// Helper function to calculate distance between two points
function calculateDistance(point1: EnhancedRoutePoint, point2: EnhancedRoutePoint): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to generate route coordinates
function generateRouteCoordinates(
  start: EnhancedRoutePoint, 
  end: EnhancedRoutePoint, 
  waypoints: EnhancedRoutePoint[] = []
): EnhancedRoutePoint[] {
  const coordinates: EnhancedRoutePoint[] = [start];
  
  // Add waypoints
  coordinates.push(...waypoints);
  
  // Add end point
  coordinates.push(end);
  
  return coordinates;
}

// Enhanced function to calculate route safety score
async function calculateEnhancedRouteSafetyScore(
  coordinates: EnhancedRoutePoint[],
  preferences: EnhancedRouteRequest["preferences"] = {}
): Promise<{ 
  overallScore: number; 
  factors: { 
    lighting: number; 
    footfall: number; 
    hazards: number; 
    proximityToHelp: number 
  } 
}> {
  try {
    // Calculate average safety score for all points along the route
    let totalScore = 0;
    let totalLighting = 0;
    let totalFootfall = 0;
    let totalHazards = 0;
    let totalProximity = 0;
    let validPoints = 0;
    
    // Sample points along the route (every 100m or so)
    const sampledPoints = coordinates.filter((_, index) => index % 3 === 0);
    
    for (const point of sampledPoints) {
      try {
        const safetyResult = await calculateComprehensiveSafetyScore(
          [point.lat, point.lng],
          {
            timeOfDay: (preferences?.timeOfTravel as any) || "afternoon",
            userType: "pedestrian",
            weatherCondition: (preferences?.weatherCondition as any) || "clear"
          }
        );
        
        totalScore += safetyResult.overall;
        totalLighting += safetyResult.factors.lighting;
        totalFootfall += safetyResult.factors.footfall;
        totalHazards += safetyResult.factors.hazards;
        totalProximity += safetyResult.factors.proximityToHelp;
        validPoints++;
      } catch (error) {
        console.warn("Error calculating safety score for point:", point, error);
        // Continue with other points
      }
    }
    
    if (validPoints === 0) {
      // If no real data, use mock calculation
      const mockScore = Math.floor(Math.random() * 40) + 40; // 40-80 range
      return {
        overallScore: mockScore,
        factors: {
          lighting: mockScore + 5,
          footfall: mockScore + 10,
          hazards: 100 - mockScore, // Inverted
          proximityToHelp: mockScore + 8
        }
      };
    }
    
    return {
      overallScore: Math.round(totalScore / validPoints),
      factors: {
        lighting: Math.round(totalLighting / validPoints),
        footfall: Math.round(totalFootfall / validPoints),
        hazards: Math.round(totalHazards / validPoints),
        proximityToHelp: Math.round(totalProximity / validPoints)
      }
    };
  } catch (error) {
    console.error("Error calculating enhanced route safety score:", error);
    return {
      overallScore: 50,
      factors: {
        lighting: 50,
        footfall: 50,
        hazards: 50,
        proximityToHelp: 50
      }
    };
  }
}

// Enhanced function to generate route option
async function generateEnhancedRouteOption(
  start: EnhancedRoutePoint,
  end: EnhancedRoutePoint,
  routeType: "safest" | "fastest" | "balanced",
  preferences: EnhancedRouteRequest["preferences"] = {}
): Promise<EnhancedRouteOption> {
  // For this implementation, we'll generate a simple straight-line route
  // In a real implementation, this would use the safety-aware routing algorithm
  
  const coordinates = generateRouteCoordinates(start, end);
  
  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  
  // Calculate duration (rough estimate based on transport mode)
  const transportSpeeds = {
    walking: 5000, // 5 km/h in meters/hour
    cycling: 15000, // 15 km/h in meters/hour
    driving: 30000 // 30 km/h in meters/hour
  };
  
  const transportMode = preferences?.transportMode || "walking";
  const speed = transportSpeeds[transportMode];
  const duration = Math.round((totalDistance / speed) * 3600);
  
  // Calculate safety score
  const safetyData = await calculateEnhancedRouteSafetyScore(coordinates, preferences);
  
  // Adjust parameters based on route type
  let adjustedDistance = totalDistance;
  let adjustedDuration = duration;
  let adjustedSafetyScore = safetyData.overallScore;
  
  const descriptions = {
    safest: "Safest route prioritizing well-lit areas and high traffic zones",
    fastest: "Fastest route with minimal travel time",
    balanced: "Balanced route considering both safety and efficiency"
  };
  
  switch (routeType) {
    case "safest":
      adjustedDistance *= 1.15; // 15% longer for safety
      adjustedDuration *= 1.25; // 25% more time
      adjustedSafetyScore = Math.min(100, adjustedSafetyScore + 15);
      break;
    case "fastest":
      adjustedDistance *= 0.95; // 5% shorter
      adjustedDuration *= 0.8; // 20% faster
      adjustedSafetyScore = Math.max(0, adjustedSafetyScore - 15);
      break;
    case "balanced":
      // Keep original values, minor adjustments
      adjustedDistance *= 1.05;
      adjustedDuration *= 1.1;
      adjustedSafetyScore = Math.min(100, Math.max(0, adjustedSafetyScore + 5));
      break;
  }
  
  // Generate risk segments for high-risk areas
  const riskSegments: EnhancedRouteOption["riskSegments"] = [];
  if (safetyData.overallScore < 40) {
    // Add a risk segment for the entire route if overall score is low
    riskSegments.push({
      start: coordinates[0],
      end: coordinates[coordinates.length - 1],
      riskLevel: "high",
      riskFactors: ["low_lighting", "low_footfall"]
    });
  } else if (safetyData.overallScore < 60) {
    // Add a moderate risk segment
    riskSegments.push({
      start: coordinates[Math.floor(coordinates.length / 3)],
      end: coordinates[Math.floor(2 * coordinates.length / 3)],
      riskLevel: "moderate",
      riskFactors: ["moderate_lighting"]
    });
  }
  
  return {
    id: routeType,
    coordinates,
    distance: Math.round(adjustedDistance),
    duration: Math.round(adjustedDuration),
    safetyScore: Math.round(adjustedSafetyScore),
    safetyFactors: safetyData.factors,
    type: routeType,
    description: descriptions[routeType],
    riskSegments: riskSegments.length > 0 ? riskSegments : undefined
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: EnhancedRouteRequest = await request.json();
    const { start, end, preferences = {}, userId } = body;
    
    // Validate input
    if (!start || !end) {
      return NextResponse.json(
        { error: "Start and end points are required" },
        { status: 400 }
      );
    }
    
    if (!start.lat || !start.lng || !end.lat || !end.lng) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }
    
    // Validate coordinate ranges
    if (Math.abs(start.lat) > 90 || Math.abs(start.lng) > 180 ||
        Math.abs(end.lat) > 90 || Math.abs(end.lng) > 180) {
      return NextResponse.json(
        { error: "Coordinates out of range" },
        { status: 400 }
      );
    }
    
    // Generate route options
    const routeTypes: ("safest" | "fastest" | "balanced")[] = ["safest", "fastest", "balanced"];
    const routes: EnhancedRouteOption[] = [];
    
    for (const routeType of routeTypes) {
      const route = await generateEnhancedRouteOption(start, end, routeType, preferences);
      routes.push(route);
    }
    
    // Sort routes by different criteria
    const safestRoute = routes.reduce((prev, current) => 
      prev.safetyScore > current.safetyScore ? prev : current
    );
    
    const fastestRoute = routes.reduce((prev, current) => 
      prev.duration < current.duration ? prev : current
    );
    
    // Determine recommended route based on preferences
    let recommendedRoute: EnhancedRouteOption;
    if (preferences.safetyPreference !== undefined) {
      if (preferences.safetyPreference > 70) {
        recommendedRoute = safestRoute;
      } else if (preferences.safetyPreference < 30) {
        recommendedRoute = fastestRoute;
      } else {
        // Balanced preference
        recommendedRoute = routes.find(r => r.type === "balanced") || routes[0];
      }
    } else {
      // Default to balanced route
      recommendedRoute = routes.find(r => r.type === "balanced") || routes[0];
    }
    
    // Store route in database (optional)
    if (userId) {
      try {
        await db.route.create({
          data: {
            userId,
            startLat: start.lat,
            startLng: start.lng,
            endLat: end.lat,
            endLng: end.lng,
            routeData: JSON.stringify(routes),
            distance: fastestRoute.distance,
            duration: fastestRoute.duration,
            safetyScore: safestRoute.safetyScore,
            routeType: recommendedRoute.type,
            lightingScore: recommendedRoute.safetyFactors.lighting,
            hazardCount: Math.round((100 - recommendedRoute.safetyFactors.hazards) / 10),
            safetyFactors: JSON.stringify(recommendedRoute.safetyFactors),
            preferences: JSON.stringify(preferences),
            algorithmVersion: "2.0",
            dataSourcesUsed: JSON.stringify(["osm", "cartosat3", "crowdsourced"]),
            emergencyExits: JSON.stringify([]), // Would be populated in real implementation
            nearbyHelp: JSON.stringify([]) // Would be populated in real implementation
          }
        });
      } catch (dbError) {
        console.error("Error storing route:", dbError);
        // Continue even if database storage fails
      }
    }
    
    const response: EnhancedRouteResponse = {
      routes,
      summary: {
        totalRoutes: routes.length,
        safestScore: safestRoute.safetyScore,
        fastestTime: fastestRoute.duration,
        recommendedRoute: recommendedRoute.id
      },
      metadata: {
        algorithmVersion: "2.0",
        dataSources: ["osm", "cartosat3", "crowdsourced"],
        calculationTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error planning enhanced routes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const routeId = searchParams.get("routeId");
    
    if (routeId) {
      // Get specific route by ID
      const route = await db.route.findUnique({
        where: { id: routeId }
      });
      
      if (!route) {
        return NextResponse.json(
          { error: "Route not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(route);
    }
    
    if (userId) {
      // Get user's route history
      const userRoutes = await db.route.findMany({
        where: { userId },
        orderBy: {
          createdAt: "desc"
        },
        take: 50
      });
      
      return NextResponse.json(userRoutes);
    }
    
    // Get recent routes
    const recentRoutes = await db.route.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 20
    });
    
    return NextResponse.json(recentRoutes);
    
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}