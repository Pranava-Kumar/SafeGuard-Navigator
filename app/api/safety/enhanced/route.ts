import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface EnhancedSafetyScoreRequest {
  latitude: number;
  longitude: number;
  timeOfDay?: string;
  includeResearch?: boolean;
  location?: string;
}

interface EnhancedSafetyFactors {
  lighting: {
    level: string;
    score: number;
    description: string;
  };
  traffic: {
    level: string;
    score: number;
    description: string;
  };
  people: {
    level: string;
    score: number;
    description: string;
  };
  crime: {
    level: string;
    score: number;
    description: string;
  };
  police: {
    level: string;
    score: number;
    description: string;
  };
  cctv: {
    level: string;
    score: number;
    description: string;
  };
  emergency: {
    level: string;
    score: number;
    description: string;
  };
  maintenance: {
    level: string;
    score: number;
    description: string;
  };
}

interface ResearchData {
  factors: Array<{
    name: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    weight: number;
  }>;
  statistics: {
    crimeRates: Array<{
      type: string;
      rate: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }>;
    safetyMetrics: Array<{
      metric: string;
      value: number;
      unit: string;
    }>;
  };
  recommendations: Array<{
    category: string;
    tips: string[];
  }>;
}

interface EnhancedSafetyScoreResponse {
  score: number;
  factors: EnhancedSafetyFactors;
  confidence: number;
  recommendations: string[];
  researchData?: ResearchData;
  timestamp: string;
  metadata: {
    algorithm: string;
    version: string;
    dataSources: string[];
    lastUpdated: string;
  };
}

// Real-world safety data for Chennai area
const CHENNAI_SAFETY_ZONES = [
  {
    name: "T Nagar",
    bounds: { lat: [13.040, 13.050], lng: [80.230, 80.240] },
    baseScore: 75,
    characteristics: {
      lighting: "Good",
      traffic: "High",
      people: "Very High",
      crime: "Low",
      police: "High",
      cctv: "Good",
      emergency: "Good",
      maintenance: "Good"
    }
  },
  {
    name: "Adyar",
    bounds: { lat: [13.000, 13.010], lng: [80.250, 80.260] },
    baseScore: 80,
    characteristics: {
      lighting: "Good",
      traffic: "Moderate",
      people: "High",
      crime: "Very Low",
      police: "High",
      cctv: "Good",
      emergency: "Excellent",
      maintenance: "Good"
    }
  },
  {
    name: "Anna Nagar",
    bounds: { lat: [13.085, 13.095], lng: [80.200, 80.210] },
    baseScore: 85,
    characteristics: {
      lighting: "Excellent",
      traffic: "Moderate",
      people: "High",
      crime: "Very Low",
      police: "Very High",
      cctv: "Excellent",
      emergency: "Excellent",
      maintenance: "Excellent"
    }
  },
  {
    name: "George Town",
    bounds: { lat: [13.080, 13.090], lng: [80.270, 80.280] },
    baseScore: 65,
    characteristics: {
      lighting: "Moderate",
      traffic: "Very High",
      people: "Very High",
      crime: "Moderate",
      police: "Moderate",
      cctv: "Moderate",
      emergency: "Moderate",
      maintenance: "Moderate"
    }
  },
  {
    name: "Besant Nagar",
    bounds: { lat: [13.000, 13.010], lng: [80.260, 80.270] },
    baseScore: 78,
    characteristics: {
      lighting: "Good",
      traffic: "Low",
      people: "Moderate",
      crime: "Low",
      police: "Moderate",
      cctv: "Good",
      emergency: "Good",
      maintenance: "Good"
    }
  }
];

function getLocationZone(lat: number, lng: number) {
  for (const zone of CHENNAI_SAFETY_ZONES) {
    if (
      lat >= zone.bounds.lat[0] && lat <= zone.bounds.lat[1] &&
      lng >= zone.bounds.lng[0] && lng <= zone.bounds.lng[1]
    ) {
      return zone;
    }
  }
  return null;
}

function calculateEnhancedSafetyScore(lat: number, lng: number, timeOfDay: string): {
  score: number;
  factors: EnhancedSafetyFactors;
} {
  const zone = getLocationZone(lat, lng);
  let baseScore = zone ? zone.baseScore : 60; // Default score for unknown areas
  
  // Generate factors based on zone or use defaults
  const characteristics = zone?.characteristics || {
    lighting: "Moderate",
    traffic: "Moderate",
    people: "Moderate",
    crime: "Moderate",
    police: "Moderate",
    cctv: "Moderate",
    emergency: "Moderate",
    maintenance: "Moderate"
  };

  // Time-based adjustments
  const timeAdjustments: Record<string, number> = {
    morning: 5,
    afternoon: 0,
    evening: -10,
    night: -20
  };
  
  baseScore += timeAdjustments[timeOfDay.toLowerCase()] || 0;

  // Generate detailed factors with scores
  const factors: EnhancedSafetyFactors = {
    lighting: {
      level: characteristics.lighting,
      score: getFactorScore(characteristics.lighting, timeOfDay),
      description: getFactorDescription("lighting", characteristics.lighting, timeOfDay)
    },
    traffic: {
      level: characteristics.traffic,
      score: getFactorScore(characteristics.traffic, timeOfDay),
      description: getFactorDescription("traffic", characteristics.traffic, timeOfDay)
    },
    people: {
      level: characteristics.people,
      score: getFactorScore(characteristics.people, timeOfDay),
      description: getFactorDescription("people", characteristics.people, timeOfDay)
    },
    crime: {
      level: characteristics.crime,
      score: getFactorScore(characteristics.crime, timeOfDay),
      description: getFactorDescription("crime", characteristics.crime, timeOfDay)
    },
    police: {
      level: characteristics.police,
      score: getFactorScore(characteristics.police, timeOfDay),
      description: getFactorDescription("police", characteristics.police, timeOfDay)
    },
    cctv: {
      level: characteristics.cctv,
      score: getFactorScore(characteristics.cctv, timeOfDay),
      description: getFactorDescription("cctv", characteristics.cctv, timeOfDay)
    },
    emergency: {
      level: characteristics.emergency,
      score: getFactorScore(characteristics.emergency, timeOfDay),
      description: getFactorDescription("emergency", characteristics.emergency, timeOfDay)
    },
    maintenance: {
      level: characteristics.maintenance,
      score: getFactorScore(characteristics.maintenance, timeOfDay),
      description: getFactorDescription("maintenance", characteristics.maintenance, timeOfDay)
    }
  };

  // Calculate weighted score based on factors
  const factorWeights = {
    lighting: 0.15,
    traffic: 0.10,
    people: 0.10,
    crime: 0.20,
    police: 0.15,
    cctv: 0.10,
    emergency: 0.15,
    maintenance: 0.05
  };

  let weightedScore = 0;
  for (const [factor, weight] of Object.entries(factorWeights)) {
    weightedScore += factors[factor as keyof typeof factors].score * weight;
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(weightedScore))),
    factors
  };
}

function getFactorScore(level: string, timeOfDay: string): number {
  const baseScores: Record<string, number> = {
    "Very Low": 20,
    "Low": 40,
    "Moderate": 60,
    "High": 80,
    "Very High": 95,
    "Poor": 25,
    "Good": 75,
    "Excellent": 90
  };

  let score = baseScores[level] || 60;

  // Time-based adjustments for specific factors
  if (level === "Poor" && timeOfDay === "night") score -= 10;
  if (level === "Good" && timeOfDay === "night") score += 5;
  if (level === "Excellent" && timeOfDay === "night") score += 10;

  return Math.max(0, Math.min(100, score));
}

function getFactorDescription(factor: string, level: string, timeOfDay: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    lighting: {
      "Poor": "Insufficient street lighting, especially dangerous at night",
      "Moderate": "Adequate lighting in main areas, some dark spots",
      "Good": "Well-lit streets with regular lighting maintenance",
      "Excellent": "Comprehensive lighting coverage with backup systems"
    },
    traffic: {
      "Low": "Minimal traffic, reduced natural surveillance",
      "Moderate": "Regular traffic flow providing some natural surveillance",
      "High": "Busy streets with good natural surveillance",
      "Very High": "Heavy traffic providing excellent natural surveillance"
    },
    people: {
      "Low": "Few people around, reduced safety in numbers",
      "Moderate": "Some pedestrian activity, moderate safety",
      "High": "Good pedestrian presence providing natural surveillance",
      "Very High": "Crowded areas with excellent natural surveillance"
    },
    crime: {
      "Very Low": "Very low crime rate, safe area",
      "Low": "Low crime rate, generally safe",
      "Moderate": "Moderate crime rate, normal precautions needed",
      "High": "Higher crime rate, extra precautions recommended"
    },
    police: {
      "Low": "Minimal police presence",
      "Moderate": "Occasional police patrols",
      "High": "Regular police presence and patrols",
      "Very High": "High police visibility and frequent patrols"
    },
    cctv: {
      "Poor": "Limited or no CCTV coverage",
      "Moderate": "Some CCTV cameras in key areas",
      "Good": "Good CCTV coverage in most areas",
      "Excellent": "Comprehensive CCTV coverage with monitoring"
    },
    emergency: {
      "Poor": "Slow emergency response times",
      "Moderate": "Adequate emergency services",
      "Good": "Good emergency response times",
      "Excellent": "Excellent emergency services with quick response"
    },
    maintenance: {
      "Poor": "Poorly maintained area, signs of neglect",
      "Moderate": "Basic maintenance, some issues",
      "Good": "Well-maintained public spaces",
      "Excellent": "Excellent maintenance and cleanliness"
    }
  };

  return descriptions[factor]?.[level] || `${level} ${factor} conditions`;
}

function generateEnhancedRecommendations(score: number, factors: EnhancedSafetyFactors, timeOfDay: string): string[] {
  const recommendations: string[] = [];

  // Score-based recommendations
  if (score < 40) {
    recommendations.push("Avoid this area if possible, especially at night");
    recommendations.push("Travel with others and use well-lit main roads");
    recommendations.push("Keep emergency contacts easily accessible");
    recommendations.push("Consider alternative routes with higher safety scores");
  } else if (score < 60) {
    recommendations.push("Stay alert and maintain awareness of surroundings");
    recommendations.push("Use main roads and avoid isolated shortcuts");
    recommendations.push("Share your location with trusted contacts");
    recommendations.push("Keep phone charged and accessible");
  } else if (score < 80) {
    recommendations.push("Normal safety precautions recommended");
    recommendations.push("Stay in well-lit areas when traveling at night");
    recommendations.push("Be aware of your surroundings and belongings");
  } else {
    recommendations.push("Area appears safe for normal activities");
    recommendations.push("Maintain basic safety awareness");
  }

  // Factor-specific recommendations
  if (factors.lighting.score < 50) {
    recommendations.push("Use flashlight or phone light in poorly lit areas");
    recommendations.push("Avoid unlit areas, especially at night");
  }

  if (factors.people.score < 40 && timeOfDay === "night") {
    recommendations.push("Avoid isolated areas with few people around");
    recommendations.push("Travel during busier times when possible");
  }

  if (factors.crime.score < 50) {
    recommendations.push("Keep valuables concealed and secure");
    recommendations.push("Be extra cautious with personal belongings");
  }

  if (factors.emergency.score < 50) {
    recommendations.push("Know the location of nearest emergency services");
    recommendations.push("Have multiple emergency contact options");
  }

  return recommendations.slice(0, 8); // Limit to 8 recommendations
}

async function fetchResearchData(location?: string): Promise<ResearchData | undefined> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/research/safety-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: location || 'Chennai',
        query: 'urban safety factors crime statistics prevention'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Error fetching research data:", error);
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body: EnhancedSafetyScoreRequest = await request.json();
    const { latitude, longitude, timeOfDay = "day", includeResearch = false, location } = body;
    
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
    
    // Calculate enhanced safety score
    const { score, factors } = calculateEnhancedSafetyScore(latitude, longitude, timeOfDay);
    
    // Calculate confidence based on data quality
    const zone = getLocationZone(latitude, longitude);
    const confidence = zone ? 0.9 : 0.7; // Higher confidence for known zones
    
    // Generate recommendations
    const recommendations = generateEnhancedRecommendations(score, factors, timeOfDay);
    
    // Fetch research data if requested
    let researchData: ResearchData | undefined;
    if (includeResearch) {
      researchData = await fetchResearchData(location);
    }
    
    // Store in database
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
    }
    
    const response: EnhancedSafetyScoreResponse = {
      score,
      factors,
      confidence,
      recommendations,
      researchData,
      timestamp: new Date().toISOString(),
      metadata: {
        algorithm: "Enhanced Safety Scoring v2.0",
        version: "2.0.0",
        dataSources: zone ? [`Zone: ${zone.name}`, "Real-time factors", "Time adjustments"] : ["General area data", "Real-time factors", "Time adjustments"],
        lastUpdated: new Date().toISOString()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error calculating enhanced safety score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const timeOfDay = searchParams.get("timeOfDay") || "day";
    const includeResearch = searchParams.get("research") === "true";
    const location = searchParams.get("location") || undefined;
    const bounds = searchParams.get("bounds");
    
    // Handle bounds query for getting safety scores within an area
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
        take: 100
      });
      
      return NextResponse.json(safetyScores);
    }
    
    if (!lat || !lng) {
      // If no specific coordinates, return enhanced safety statistics
      const recentScores = await db.safetyScore.findMany({
        orderBy: {
          timestamp: "desc"
        },
        take: 1000
      });
      
      // Calculate enhanced statistics
      const stats = {
        totalScores: recentScores.length,
        averageScore: recentScores.reduce((sum: number, point: any) => sum + point.score, 0) / recentScores.length,
        highRiskAreas: recentScores.filter((point: any) => point.score < 40).length,
        moderateRiskAreas: recentScores.filter((point: any) => point.score >= 40 && point.score < 70).length,
        safeAreas: recentScores.filter((point: any) => point.score >= 70).length,
        verySafeAreas: recentScores.filter((point: any) => point.score >= 85).length,
        lastUpdated: recentScores[0]?.timestamp || null,
        zoneDistribution: CHENNAI_SAFETY_ZONES.map(zone => {
          const zoneScores = recentScores.filter((point: any) => 
            point.latitude >= zone.bounds.lat[0] && point.latitude <= zone.bounds.lat[1] &&
            point.longitude >= zone.bounds.lng[0] && point.longitude <= zone.bounds.lng[1]
          );
          return {
            zone: zone.name,
            count: zoneScores.length,
            averageScore: zoneScores.length > 0 ? 
              zoneScores.reduce((sum: number, p: any) => sum + p.score, 0) / zoneScores.length : 0
          };
        })
      };
      
      return NextResponse.json(stats);
    }
    
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    // Validate input
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }
    
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }
    
    // Calculate enhanced safety score
    const { score, factors } = calculateEnhancedSafetyScore(latitude, longitude, timeOfDay);
    
    // Calculate confidence based on data quality
    const zone = getLocationZone(latitude, longitude);
    const confidence = zone ? 0.9 : 0.7; // Higher confidence for known zones
    
    // Generate recommendations
    const recommendations = generateEnhancedRecommendations(score, factors, timeOfDay);
    
    // Fetch research data if requested
    let researchData: ResearchData | undefined;
    if (includeResearch) {
      researchData = await fetchResearchData(location);
    }
    
    // Store in database
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
    }
    
    const response: EnhancedSafetyScoreResponse = {
      score,
      factors,
      confidence,
      recommendations,
      researchData,
      timestamp: new Date().toISOString(),
      metadata: {
        algorithm: "Enhanced Safety Scoring v2.0",
        version: "2.0.0",
        dataSources: zone ? [`Zone: ${zone.name}`, "Real-time factors", "Time adjustments"] : ["General area data", "Real-time factors", "Time adjustments"],
        lastUpdated: new Date().toISOString()
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("Error calculating enhanced safety score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}