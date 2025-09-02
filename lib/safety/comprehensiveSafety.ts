import {   SafetyFactors,   SafetyScoreResult,   SafetyScoreContext,  DEFAULT_WEIGHTS,  getSafetyLevel} from '@/lib/safety/types'
import { calculateWilsonScore, calculateWilsonScoreWithConfidence } from '@/lib/reputation/wilsonScore'
import { fetchCartosat3Data, processPanchromaticData, fetchRealCartosat3Data } from '@/lib/satellite/cartosat3'
import {   geocodeAddress,   reverseGeocode,   getSafetyInfrastructure } from '@/lib/mapping/openstreetmap';

// Mock data sources for demonstration
const MOCK_INFRASTRUCTURE_DATA = {
  police: [
    { id: 'police-1', name: 'Central Police Station', distance: 500, responseTime: 300 },
    { id: 'police-2', name: 'North Police Station', distance: 800, responseTime: 420 }
  ],
  hospitals: [
    { id: 'hospital-1', name: 'City General Hospital', distance: 600, responseTime: 360 },
    { id: 'hospital-2', name: 'Emergency Care Center', distance: 1200, responseTime: 600 }
  ],
  fire: [
    { id: 'fire-1', name: 'Central Fire Station', distance: 700, responseTime: 300 }
  ],
  streetLights: [
    { id: 'light-1', name: 'Street Lamp', distance: 100, status: 'working' },
    { id: 'light-2', name: 'Street Lamp', distance: 150, status: 'broken' }
  ],
  cctv: [
    { id: 'cctv-1', name: 'Security Camera', distance: 200, status: 'active' }
  ]
};

const MOCK_HAZARD_DATA = [
  { id: 'hazard-1', type: 'pothole', severity: 3, timestamp: new Date('2025-01-10'), verified: true },
  { id: 'hazard-2', type: 'poor_lighting', severity: 4, timestamp: new Date('2025-01-12'), verified: false },
  { id: 'hazard-3', type: 'harassment', severity: 5, timestamp: new Date('2025-01-08'), verified: true }
];

const MOCK_FOOTFALL_DATA = {
  poiDensity: 25,
  businessActivity: 75,
  transitActivity: 80,
  historicalData: [10, 15, 20, 30, 50, 80, 90, 85, 70, 60, 55, 50, 45, 40, 35, 45, 60, 80, 95, 100, 90, 75, 60, 40]
};

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Fetch lighting data from multiple sources
 * @param coordinates Location coordinates [lat, lng]
 * @param context Contextual information
 * @returns Lighting quality score (0-100)
 */
async function fetchLightingData(
  coordinates: [number, number],
  context: SafetyScoreContext
): Promise<number> {
  try {
    // In a real implementation, we would fetch actual data from multiple sources
    // For this prototype, we'll simulate the data fetching
    
    // 1. CARTOSAT-3 satellite data
    // In production, this would use a real API key
    // const cartosatData = await fetchRealCartosat3Data({
    const cartosatData = await fetchCartosat3Data({
      bbox: [
        coordinates[1] - 0.001, // minLng
        coordinates[0] - 0.001, // minLat
        coordinates[1] + 0.001, // maxLng
        coordinates[0] + 0.001  // maxLat
      ],
      resolution: 0.5, // 0.5m resolution
      bands: ['panchromatic'],
      processing: {
        atmosphericCorrection: true,
        geometricCorrection: true,
        radiometricCalibration: true
      }
    });
    
    let cartosatScore = 50; // Default neutral score
    if (cartosatData.success && cartosatData.data && cartosatData.data.length > 0) {
      const processedData = await processPanchromaticData(cartosatData.data[0]);
      cartosatScore = processedData.averageBrightness || 50;
    }
    
    // 2. Municipal infrastructure data
    const infrastructureData = await getSafetyInfrastructure(coordinates, 500);
    let municipalScore = 50; // Default neutral score
    if (infrastructureData.success && infrastructureData.data) {
      const workingLights = infrastructureData.data.streetLights.filter(
        light => light.type === 'working'
      ).length;
      const totalLights = infrastructureData.data.streetLights.length;
      municipalScore = totalLights > 0 ? (workingLights / totalLights) * 100 : 50;
    }
    
    // 3. Crowdsourced reports with Wilson score trust weighting
    // Simulate crowdsourced data with trust scores
    const crowdsourcedReports = [
      { reporterTrust: 0.92, status: 'good' },
      { reporterTrust: 0.75, status: 'moderate' },
      { reporterTrust: 0.88, status: 'good' },
      { reporterTrust: 0.65, status: 'poor' }
    ];
    
    let crowdScore = 50; // Default neutral score
    if (crowdsourcedReports.length > 0) {
      // Weighted average based on reporter trust (Wilson score)
      const totalTrust = crowdsourcedReports.reduce(
        (sum, report) => sum + report.reporterTrust,
        0
      );
      const weightedSum = crowdsourcedReports.reduce(
        (sum, report) => {
          const statusScores: Record<string, number> = {
            'good': 85,
            'moderate': 65,
            'poor': 40,
            'very_poor': 20
          };
          return sum + report.reporterTrust * (statusScores[report.status] || 50);
        },
        0
      );
      crowdScore = totalTrust > 0 ? weightedSum / totalTrust : 50;
    }
    
    // 4. Time-based adjustment
    let timeAdjustment = 1.0;
    if (context.timeOfDay === 'night') {
      timeAdjustment = 0.7; // 30% reduction at night
    } else if (context.timeOfDay === 'evening') {
      timeAdjustment = 0.85; // 15% reduction in evening
    }
    
    // Combine scores with weighted average
    const combinedScore = (
      cartosatScore * 0.4 +    // 40% weight for satellite data
      municipalScore * 0.3 +   // 30% weight for municipal data
      crowdScore * 0.3         // 30% weight for crowdsourced data
    ) * timeAdjustment;
    
    return Math.max(0, Math.min(100, Math.round(combinedScore)));
  } catch (error) {
    console.error('Error fetching lighting data:', error);
    // Return default score on error
    return 50;
  }
}

/**
 * Fetch footfall data from multiple sources
 * @param coordinates Location coordinates [lat, lng]
 * @param context Contextual information
 * @returns Footfall activity score (0-100)
 */
async function fetchFootfallData(
  coordinates: [number, number],
  context: SafetyScoreContext
): Promise<number> {
  try {
    // In a real implementation, we would fetch actual data from multiple sources
    // For this prototype, we'll simulate the data fetching
    
    // 1. POI density from OSM
    const poiDensity = MOCK_FOOTFALL_DATA.poiDensity;
    const poiScore = Math.min(100, poiDensity * 2); // Scale 0-50 to 0-100
    
    // 2. Business activity (simulated)
    const businessActivity = MOCK_FOOTFALL_DATA.businessActivity;
    
    // 3. Transit activity (simulated)
    const transitActivity = MOCK_FOOTFALL_DATA.transitActivity;
    
    // 4. Historical data patterns
    const currentTimeIndex = getCurrentTimeIndex(context.timeOfDay);
    const currentFootfall = MOCK_FOOTFALL_DATA.historicalData[currentTimeIndex] || 50;
    const avgFootfall = MOCK_FOOTFALL_DATA.historicalData.reduce((sum, val) => sum + val, 0) / 
      MOCK_FOOTFALL_DATA.historicalData.length;
    
    // Calculate relative footfall (current vs average)
    const relativeFootfall = currentFootfall / (avgFootfall || 1);
    
    // Combine scores with weighted average
    const combinedScore = 
      poiScore * 0.25 +           // 25% weight for POI density
      businessActivity * 0.25 +   // 25% weight for business activity
      transitActivity * 0.25 +    // 25% weight for transit activity
      relativeFootfall * 50 * 0.25; // 25% weight for historical patterns (scaled to 0-100)
    
    return Math.max(0, Math.min(100, Math.round(combinedScore)));
  } catch (error) {
    console.error('Error fetching footfall data:', error);
    // Return default score on error
    return 50;
  }
}

/**
 * Get current time index for historical data lookup
 * @param timeOfDay Current time of day
 * @returns Index (0-23) for hourly data
 */
function getCurrentTimeIndex(
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
): number {
  switch (timeOfDay) {
    case 'morning':
      return 8; // 8 AM
    case 'afternoon':
      return 14; // 2 PM
    case 'evening':
      return 18; // 6 PM
    case 'night':
      return 22; // 10 PM
    default:
      return 12; // Noon
  }
}

/**
 * Fetch hazard data from multiple sources
 * @param coordinates Location coordinates [lat, lng]
 * @param context Contextual information
 * @returns Hazard index score (0-100) - Lower means fewer hazards
 */
async function fetchHazardData(
  coordinates: [number, number],
  context: SafetyScoreContext
): Promise<number> {
  try {
    // In a real implementation, we would fetch actual data from multiple sources
    // For this prototype, we'll use mock data with temporal decay
    
    let hazardScore = 0;
    let totalWeight = 0;
    
    // Process each hazard report with temporal decay
    MOCK_HAZARD_DATA.forEach((hazard) => {
      const daysAgo = (Date.now() - hazard.timestamp.getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.exp(-daysAgo / 30); // Exponential decay over 30 days
      const severityFactor = hazard.severity / 5; // Normalize to 0-1
      const verificationBonus = hazard.verified ? 1.5 : 1.0;
      
      hazardScore += severityFactor * decayFactor * verificationBonus;
      totalWeight += 1;
    });
    
    // Average and normalize to 0-100 scale
    const normalizedScore = totalWeight > 0 ? (hazardScore / totalWeight) * 100 : 0;
    
    // Invert because we want lower hazard score to mean fewer hazards (higher safety)
    return Math.max(0, Math.min(100, Math.round(100 - normalizedScore)));
  } catch (error) {
    console.error('Error fetching hazard data:', error);
    // Return default score on error (high safety = low hazards)
    return 80;
  }
}

/**
 * Fetch proximity to help data from multiple sources
 * @param coordinates Location coordinates [lat, lng]
 * @param context Contextual information
 * @returns Proximity to help score (0-100) - Higher means closer to help
 */
async function fetchProximityToHelpData(
  coordinates: [number, number],
  context: SafetyScoreContext
): Promise<number> {
  try {
    // In a real implementation, we would fetch actual data from multiple sources
    // For this prototype, we'll use mock infrastructure data
    
    let score = 0;
    let totalWeight = 0;
    
    // Police stations (weight: 30%)
    if (MOCK_INFRASTRUCTURE_DATA.police.length > 0) {
      const nearestPolice = Math.min(
        ...MOCK_INFRASTRUCTURE_DATA.police.map((s) => s.distance)
      );
      // Score based on distance (0-500m = 100 points, 2000m+ = 0 points)
      const policeScore = Math.max(0, 100 - (nearestPolice / 2000) * 100);
      score += policeScore * 0.3;
      totalWeight += 0.3;
    }
    
    // Hospitals (weight: 25%)
    if (MOCK_INFRASTRUCTURE_DATA.hospitals.length > 0) {
      const nearestHospital = Math.min(
        ...MOCK_INFRASTRUCTURE_DATA.hospitals.map((s) => s.distance)
      );
      // Score based on distance (0-1000m = 100 points, 3000m+ = 0 points)
      const hospitalScore = Math.max(0, 100 - (nearestHospital / 3000) * 100);
      score += hospitalScore * 0.25;
      totalWeight += 0.25;
    }
    
    // Fire stations (weight: 20%)
    if (MOCK_INFRASTRUCTURE_DATA.fire.length > 0) {
      const nearestFire = Math.min(
        ...MOCK_INFRASTRUCTURE_DATA.fire.map((s) => s.distance)
      );
      // Score based on distance (0-1500m = 100 points, 4000m+ = 0 points)
      const fireScore = Math.max(0, 100 - (nearestFire / 4000) * 100);
      score += fireScore * 0.2;
      totalWeight += 0.2;
    }
    
    // Proximity to CCTV (weight: 15%)
    if (MOCK_INFRASTRUCTURE_DATA.cctv.length > 0) {
      const nearestCCTV = Math.min(
        ...MOCK_INFRASTRUCTURE_DATA.cctv.map((s) => s.distance)
      );
      // Score based on distance (0-200m = 100 points, 1000m+ = 0 points)
      const cctvScore = Math.max(0, 100 - (nearestCCTV / 1000) * 100);
      score += cctvScore * 0.15;
      totalWeight += 0.15;
    }
    
    // Proximity to street lights (weight: 10%)
    if (MOCK_INFRASTRUCTURE_DATA.streetLights.length > 0) {
      const workingLights = MOCK_INFRASTRUCTURE_DATA.streetLights.filter(
        light => light.status === 'working'
      ).length;
      const totalLights = MOCK_INFRASTRUCTURE_DATA.streetLights.length;
      const lightScore = totalLights > 0 ? (workingLights / totalLights) * 100 : 50;
      score += lightScore * 0.1;
      totalWeight += 0.1;
    }
    
    // Normalize based on actual weights used
    const normalizedScore = totalWeight > 0 ? score / totalWeight : 50;
    
    return Math.max(0, Math.min(100, Math.round(normalizedScore)));
  } catch (error) {
    console.error('Error fetching proximity to help data:', error);
    // Return default score on error
    return 50;
  }
}

/**
 * Calculate the comprehensive safety score for a location
 * Implements the multi-factor SafetyScore algorithm from the solution document
 * SafetyScore(e) = wL * L(e) + wF * F(e) + wH * H(e) + wP * P(e)
 * 
 * @param coordinates Location coordinates [lat, lng]
 * @param context Contextual information
 * @returns Comprehensive safety score result
 */
export async function calculateComprehensiveSafetyScore(
  coordinates: [number, number],
  context: SafetyScoreContext
): Promise<SafetyScoreResult> {
  try {
    // Fetch all safety factors in parallel for performance
    const [
      lightingScore,
      footfallScore,
      hazardScore,
      proximityToHelpScore
    ] = await Promise.all([
      fetchLightingData(coordinates, context),
      fetchFootfallData(coordinates, context),
      fetchHazardData(coordinates, context),
      fetchProximityToHelpData(coordinates, context)
    ]);
    
    // Create safety factors object
    const factors: SafetyFactors = {
      lighting: lightingScore,
      footfall: footfallScore,
      hazards: hazardScore,
      proximityToHelp: proximityToHelpScore
    };
    
    // Apply weights from the solution document
    const weights = DEFAULT_WEIGHTS;
    
    // Calculate weighted factors
    const weightedFactors = {
      lighting: Math.round(weights.lighting * lightingScore),
      footfall: Math.round(weights.footfall * footfallScore),
      hazards: Math.round(weights.hazards * hazardScore),
      proximityToHelp: Math.round(weights.proximityToHelp * proximityToHelpScore)
    };
    
    // Calculate overall safety score
    // SafetyScore(e) = wL * L(e) + wF * F(e) + wH * H(e) + wP * P(e)
    const overallScore = 
      weightedFactors.lighting +
      weightedFactors.footfall +
      weightedFactors.hazards +
      weightedFactors.proximityToHelp;
    
    // Calculate confidence based on data completeness
    const availableFactors = Object.values(factors).filter(score => score > 0).length;
    const confidence = availableFactors / Object.keys(factors).length;
    
    // Create result object
    const result: SafetyScoreResult = {
      overall: Math.round(Math.max(0, Math.min(100, overallScore))),
      factors,
      confidence: Math.max(0, Math.min(1, confidence)),
      weightedFactors
    };
    
    return result;
  } catch (error) {
    console.error('Error calculating comprehensive safety score:', error);
    
    // Return a default safety score on error
    const defaultFactors: SafetyFactors = {
      lighting: 50,
      footfall: 50,
      hazards: 80, // Inverted (low hazards = high safety)
      proximityToHelp: 50
    };
    
    const weights = DEFAULT_WEIGHTS;
    const weightedFactors = {
      lighting: Math.round(weights.lighting * defaultFactors.lighting),
      footfall: Math.round(weights.footfall * defaultFactors.footfall),
      hazards: Math.round(weights.hazards * defaultFactors.hazards),
      proximityToHelp: Math.round(weights.proximityToHelp * defaultFactors.proximityToHelp)
    };
    
    const overallScore = 
      weightedFactors.lighting +
      weightedFactors.footfall +
      weightedFactors.hazards +
      weightedFactors.proximityToHelp;
    
    return {
      overall: Math.round(overallScore),
      factors: defaultFactors,
      confidence: 0.5, // Medium confidence
      weightedFactors
    };
  }
}

/**
 * Generate safety recommendations based on factors
 * @param factors Safety factors
 * @returns Array of recommendations
 */
export function generateSafetyRecommendations(factors: SafetyFactors): string[] {
  const recommendations: string[] = [];
  
  // Lighting recommendations
  if (factors.lighting < 40) {
    recommendations.push(
      'Poor lighting detected - use flashlight and avoid dark areas'
    );
  } else if (factors.lighting < 60) {
    recommendations.push(
      'Moderate lighting - stay on well-lit paths when possible'
    );
  }
  
  // Footfall recommendations
  if (factors.footfall < 30) {
    recommendations.push(
      'Low footfall area - avoid isolated paths, especially at night'
    );
  } else if (factors.footfall < 50) {
    recommendations.push(
      'Moderate footfall - prefer busier routes when possible'
    );
  }
  
  // Hazard recommendations (remember this is inverted)
  if (factors.hazards < 30) {
    recommendations.push(
      'High hazard index - exercise extreme caution or find alternative route'
    );
  } else if (factors.hazards < 50) {
    recommendations.push('Moderate hazards reported - stay alert');
  }
  
  // Proximity to help recommendations
  if (factors.proximityToHelp < 40) {
    recommendations.push(
      'Far from emergency services - have backup communication plan'
    );
  } else if (factors.proximityToHelp < 60) {
    recommendations.push(
      'Moderate distance to help - keep emergency contacts accessible'
    );
  }
  
  // General recommendation if no specific issues
  if (recommendations.length === 0) {
    recommendations.push('Maintain normal safety awareness');
  }
  
  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

interface SafetyFactorDetail {
  name: string;
  score: number;
  description: string;
  level: string;
  color: string;
}

/**
 * Get detailed information about each safety factor
 * @param factors Safety factors with scores
 * @returns Detailed information about each factor
 */
export function getSafetyFactorDetails(factors: SafetyFactors): SafetyFactorDetail[] {
  return [
    {
      name: 'Lighting Quality',
      score: factors.lighting,
      description: 'Brightness and illumination of streets and pathways',
      level: getSafetyLevel(factors.lighting).level,
      color: getSafetyLevel(factors.lighting).color
    },
    {
      name: 'Footfall Activity',
      score: factors.footfall,
      description: 'Pedestrian presence providing natural surveillance',
      level: getSafetyLevel(factors.footfall).level,
      color: getSafetyLevel(factors.footfall).color
    },
    {
      name: 'Hazard Index',
      score: factors.hazards,
      description: 'Reported incidents and infrastructure issues',
      level: getSafetyLevel(factors.hazards).level,
      color: getSafetyLevel(factors.hazards).color
    },
    {
      name: 'Proximity to Help',
      score: factors.proximityToHelp,
      description: 'Distance to emergency services and help facilities',
      level: getSafetyLevel(factors.proximityToHelp).level,
      color: getSafetyLevel(factors.proximityToHelp).color
    }
  ];
}

export default {
  calculateComprehensiveSafetyScore,
  generateSafetyRecommendations,
  getSafetyFactorDetails
};