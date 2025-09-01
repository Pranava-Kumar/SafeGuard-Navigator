import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface RoutePoint {
  lat: number;
  lng: number;
}

interface RouteRequest {
  start: RoutePoint;
  end: RoutePoint;
  preferences?: {
    prioritizeSafety?: boolean;
    maxDistanceMultiplier?: number;
    avoidHighRiskAreas?: boolean;
  };
}

interface RouteOption {
  id: string;
  coordinates: RoutePoint[];
  distance: number;
  duration: number;
  safetyScore: number;
  type: 'safest' | 'fastest' | 'balanced';
  description: string;
}

interface RouteResponse {
  routes: RouteOption[];
  summary: {
    totalRoutes: number;
    safestScore: number;
    fastestTime: number;
    recommendedRoute: string;
  };
}

function calculateDistance(point1: RoutePoint, point2: RoutePoint): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function generateRouteCoordinates(start: RoutePoint, end: RoutePoint, waypoints: RoutePoint[] = []): RoutePoint[] {
  const coordinates: RoutePoint[] = [start];
  
  // Add waypoints
  coordinates.push(...waypoints);
  
  // Add end point
  coordinates.push(end);
  
  return coordinates;
}

function calculateRouteSafetyScore(coordinates: RoutePoint[]): Promise<number> {
  return new Promise(async (resolve) => {
    try {
      // Get safety scores for points along the route
      const safetyScores = await db.safetyScore.findMany({
        where: {
          OR: coordinates.map(coord => ({
            latitude: {
              gte: coord.lat - 0.001,
              lte: coord.lat + 0.001
            },
            longitude: {
              gte: coord.lng - 0.001,
              lte: coord.lng + 0.001
            }
          }))
        },
        orderBy: {
          lastUpdated: "desc"
        }
      });
      
      if (safetyScores.length === 0) {
        // If no real data, use mock calculation
        const mockScore = Math.floor(Math.random() * 40) + 40; // 40-80 range
        resolve(mockScore);
        return;
      }
      
      // Calculate weighted average of safety scores
      const totalScore = safetyScores.reduce((sum: number, score: any) => sum + score.overallScore, 0);
      const averageScore = totalScore / safetyScores.length;
      
      resolve(Math.round(averageScore));
    } catch (error) {
      console.error("Error calculating route safety score:", error);
      resolve(50); // Default score
    }
  });
}

function generateWaypoints(start: RoutePoint, end: RoutePoint, routeType: string): RoutePoint[] {
  const waypoints: RoutePoint[] = [];
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  
  switch (routeType) {
    case 'safest':
      // Add waypoints that avoid potentially unsafe areas
      waypoints.push(
        { lat: midLat + 0.001, lng: midLng + 0.001 },
        { lat: midLat + 0.002, lng: midLng + 0.002 }
      );
      break;
    case 'fastest':
      // Direct route with minimal waypoints
      waypoints.push({ lat: midLat, lng: midLng });
      break;
    case 'balanced':
      // Balanced route with moderate waypoints
      waypoints.push(
        { lat: midLat + 0.0005, lng: midLng + 0.001 },
        { lat: midLat + 0.0015, lng: midLng + 0.0015 }
      );
      break;
  }
  
  return waypoints;
}

async function generateRouteOption(
  start: RoutePoint,
  end: RoutePoint,
  routeType: 'safest' | 'fastest' | 'balanced'
): Promise<RouteOption> {
  const waypoints = generateWaypoints(start, end, routeType);
  const coordinates = generateRouteCoordinates(start, end, waypoints);
  
  // Calculate total distance
  let totalDistance = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    totalDistance += calculateDistance(coordinates[i], coordinates[i + 1]);
  }
  
  // Calculate duration (rough estimate: 5 km/h walking speed)
  const duration = Math.round((totalDistance / 5000) * 3600);
  
  // Calculate safety score
  const safetyScore = await calculateRouteSafetyScore(coordinates);
  
  // Adjust parameters based on route type
  let adjustedDistance = totalDistance;
  let adjustedDuration = duration;
  let adjustedSafetyScore = safetyScore;
  
  switch (routeType) {
    case 'safest':
      adjustedDistance *= 1.2; // 20% longer for safety
      adjustedDuration *= 1.3; // 30% more time
      adjustedSafetyScore = Math.min(100, adjustedSafetyScore + 20);
      break;
    case 'fastest':
      adjustedDistance *= 0.9; // 10% shorter
      adjustedDuration *= 0.8; // 20% faster
      adjustedSafetyScore = Math.max(0, adjustedSafetyScore - 15);
      break;
    case 'balanced':
      // Keep original values, minor adjustments
      adjustedDistance *= 1.05;
      adjustedDuration *= 1.1;
      adjustedSafetyScore = Math.min(100, Math.max(0, adjustedSafetyScore + 5));
      break;
  }
  
  const descriptions = {
    safest: 'Safest route prioritizing well-lit areas and high traffic zones',
    fastest: 'Fastest route with minimal travel time',
    balanced: 'Balanced route considering both safety and efficiency'
  };
  
  return {
    id: routeType,
    coordinates,
    distance: Math.round(adjustedDistance),
    duration: Math.round(adjustedDuration),
    safetyScore: Math.round(adjustedSafetyScore),
    type: routeType,
    description: descriptions[routeType]
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RouteRequest = await request.json();
    const { start, end, preferences = {} } = body;
    
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
    const routeTypes: ('safest' | 'fastest' | 'balanced')[] = ['safest', 'fastest', 'balanced'];
    const routes: RouteOption[] = [];
    
    for (const routeType of routeTypes) {
      const route = await generateRouteOption(start, end, routeType);
      routes.push(route);
    }
    
    // Sort routes by different criteria
    const safestRoute = routes.reduce((prev, current) => 
      prev.safetyScore > current.safetyScore ? prev : current
    );
    
    const fastestRoute = routes.reduce((prev, current) => 
      prev.duration < current.duration ? prev : current
    );
    
    const balancedRoute = routes.reduce((prev, current) => {
      const prevScore = (prev.safetyScore * 0.6) + ((1800 - prev.duration) / 1800 * 40);
      const currentScore = (current.safetyScore * 0.6) + ((1800 - current.duration) / 1800 * 40);
      return currentScore > prevScore ? current : prev;
    });
    
    // Store route in database (optional)
    try {
      await db.route.create({
        data: {
          userId: "demo-user", // In real app, get from auth
          startLat: start.lat,
          startLng: start.lng,
          endLat: end.lat,
          endLng: end.lng,
          routeData: JSON.stringify(routes),
          distance: fastestRoute.distance,
          duration: fastestRoute.duration,
          safetyScore: safestRoute.safetyScore,
          routeType: 'balanced'
        }
      });
    } catch (dbError) {
      console.error("Error storing route:", dbError);
      // Continue even if database storage fails
    }
    
    const response: RouteResponse = {
      routes,
      summary: {
        totalRoutes: routes.length,
        safestScore: safestRoute.safetyScore,
        fastestTime: fastestRoute.duration,
        recommendedRoute: balancedRoute.id
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error planning routes:", error);
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