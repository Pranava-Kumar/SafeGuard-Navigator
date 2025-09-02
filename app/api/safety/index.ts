import { NextRequest, NextResponse } from 'next/server';

// Mock safety data
const mockSafetyData = [
  {
    id: "chennai-central",
    latitude: 13.0827,
    longitude: 80.2707,
    score: 78,
    factors: {
      lighting: { level: "Good", score: 75, description: "Well-lit streets with regular maintenance" },
      traffic: { level: "High", score: 80, description: "Busy streets with good natural surveillance" },
      people: { level: "High", score: 80, description: "Good pedestrian presence providing safety" },
      crime: { level: "Low", score: 75, description: "Low crime rate, generally safe area" },
      police: { level: "High", score: 85, description: "Regular police presence and patrols" },
      cctv: { level: "Good", score: 75, description: "Good CCTV coverage in main areas" },
      emergency: { level: "Good", score: 80, description: "Good emergency response times" },
      maintenance: { level: "Good", score: 75, description: "Well-maintained public spaces" }
    },
    timestamp: new Date().toISOString()
  },
  {
    id: "t-nagar",
    latitude: 13.0398,
    longitude: 80.2342,
    score: 65,
    factors: {
      lighting: { level: "Moderate", score: 60, description: "Adequate lighting but some dark spots" },
      traffic: { level: "High", score: 75, description: "Very busy commercial area" },
      people: { level: "Very High", score: 90, description: "Excellent natural surveillance" },
      crime: { level: "Low", score: 70, description: "Generally safe with occasional petty theft" },
      police: { level: "Moderate", score: 65, description: "Police presence during peak hours" },
      cctv: { level: "Good", score: 70, description: "Good CCTV coverage in main streets" },
      emergency: { level: "Good", score: 75, description: "Good emergency response times" },
      maintenance: { level: "Moderate", score: 60, description: "Some areas need maintenance" }
    },
    timestamp: new Date().toISOString()
  },
  {
    id: "anna-nagar",
    latitude: 13.0878,
    longitude: 80.2785,
    score: 82,
    factors: {
      lighting: { level: "Good", score: 80, description: "Well-lit residential area" },
      traffic: { level: "Moderate", score: 65, description: "Moderate traffic with good road conditions" },
      people: { level: "High", score: 80, description: "Good residential presence" },
      crime: { level: "Very Low", score: 90, description: "Very low crime rate, safe area" },
      police: { level: "High", score: 85, description: "Regular police patrols and good response" },
      cctv: { level: "Moderate", score: 60, description: "Limited CCTV coverage" },
      emergency: { level: "Good", score: 80, description: "Good emergency response times" },
      maintenance: { level: "Good", score: 80, description: "Well-maintained residential area" }
    },
    timestamp: new Date().toISOString()
  },
  {
    id: "guindy",
    latitude: 13.0102,
    longitude: 80.2155,
    score: 58,
    factors: {
      lighting: { level: "Poor", score: 45, description: "Several dark spots, especially in residential areas" },
      traffic: { level: "Low", score: 50, description: "Low traffic, isolated areas" },
      people: { level: "Low", score: 40, description: "Low pedestrian presence during night hours" },
      crime: { level: "Moderate", score: 60, description: "Moderate crime rate, caution advised" },
      police: { level: "Moderate", score: 60, description: "Police presence but limited patrols" },
      cctv: { level: "Poor", score: 40, description: "Limited CCTV coverage" },
      emergency: { level: "Moderate", score: 60, description: "Average emergency response times" },
      maintenance: { level: "Moderate", score: 55, description: "Some areas need maintenance" }
    },
    timestamp: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  // If specific coordinates are requested, return data for that location
  if (lat && lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    // Find the closest safety data point
    let closestPoint = mockSafetyData[0];
    let minDistance = Number.MAX_VALUE;
    
    for (const point of mockSafetyData) {
      const distance = Math.sqrt(
        Math.pow(point.latitude - latitude, 2) + 
        Math.pow(point.longitude - longitude, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        score: closestPoint.score,
        factors: closestPoint.factors,
        confidence: 0.85,
        timestamp: closestPoint.timestamp
      }
    });
  }
  
  // Return all safety data points
  return NextResponse.json({
    success: true,
    data: mockSafetyData
  });
}

export async function POST(request: NextRequest) {
  // For POST requests, we'll just return a success response
  return NextResponse.json({
    success: true,
    message: "Safety data processed successfully"
  });
}