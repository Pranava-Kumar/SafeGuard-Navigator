/**
 * Multi-Factor SafetyScore Algorithm Implementation
 * Calculates comprehensive safety scores for locations and routes
 * Based on: SafetyScore(e) = wL * L(e) + wF * F(e) + wH * H(e) + wP * P(e)
 */

export interface SafetyFactors {
  lighting: number; // 0-100 normalized lighting quality
  footfall: number; // 0-100 normalized footfall activity
  hazards: number; // 0-100 normalized hazard index (inverted in final score)
  proximityToHelp: number; // 0-100 normalized proximity to help services
}

export interface SafetyScoreResult {
  overall: number; // 0-100 final safety score
  factors: SafetyFactors;
  confidence: number; // 0-1 data reliability
  weightedFactors: {
    lighting: number;
    footfall: number;
    hazards: number; // Inverted (100 - hazards)
    proximityToHelp: number;
  };
}

export interface SafetyScoreContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userType: 'pedestrian' | 'two_wheeler' | 'cyclist' | 'public_transport';
  weatherCondition?: 'clear' | 'cloudy' | 'rainy' | 'stormy';
  localEvents?: string[];
}

export interface LightingData {
  viirsBrightness: number; // Raw VIIRS data
  municipalStatus: 'working' | 'broken' | 'partial';
  crowdsourcedReports: LightingReport[];
}

export interface LightingReport {
  reporterTrust: number; // 0-1 Wilson score
  status: 'good' | 'moderate' | 'poor' | 'very_poor';
  timestamp: Date;
}

export interface FootfallData {
  poiDensity: number; // Points of interest per sq km
  businessActivity: number; // 0-100 business activity level
  transitActivity: number; // 0-100 transit usage
  historicalData: number[]; // Hourly footfall data
}

export interface HazardData {
  recentIncidents: SafetyIncident[];
  infrastructureIssues: InfrastructureReport[];
  weatherHazards: WeatherHazard[];
  crowdsourcedHazards: HazardReport[];
}

export interface SafetyIncident {
  type: 'accident' | 'harassment' | 'theft' | 'assault' | 'other';
  severity: number; // 1-5
  timestamp: Date;
  verified: boolean;
}

export interface InfrastructureReport {
  type: 'pothole' | 'poor_lighting' | 'blocked_path' | 'construction' | 'other';
  severity: number; // 1-5
  timestamp: Date;
}

export interface WeatherHazard {
  type: 'flood' | 'storm' | 'fog' | 'other';
  severity: number; // 1-5
  timestamp: Date;
}

export interface HazardReport {
  reporterTrust: number; // 0-1 Wilson score
  type: string;
  severity: number; // 1-5
  timestamp: Date;
}

export interface ProximityData {
  policeStations: NearbyFacility[];
  hospitals: NearbyFacility[];
  emergencyServices: NearbyFacility[];
  safePublicSpaces: NearbyFacility[];
}

export interface NearbyFacility {
  distance: number; // meters
  responseTime: number; // seconds
  availability: number; // 0-100 service availability
}

// Default weights for the SafetyScore algorithm
const DEFAULT_WEIGHTS = {
  lighting: 0.30,      // wL - Critical for night safety
  footfall: 0.25,      // wF - Activity indicates safety
  hazards: 0.20,       // wH - Incident reports (inverted)
  proximityToHelp: 0.25 // wP - Help availability
};

/**
 * Calculate the overall SafetyScore based on multiple factors
 * @param factors Safety factors with normalized scores (0-100)
 * @param weights Optional custom weights
 * @returns SafetyScoreResult with overall score and breakdown
 */
export function calculateSafetyScore(
  factors: SafetyFactors,
  weights = DEFAULT_WEIGHTS
): SafetyScoreResult {
  // Normalize factors to 0-1 range
  const normalizedFactors = {
    lighting: factors.lighting / 100,
    footfall: factors.footfall / 100,
    hazards: factors.hazards / 100,
    proximityToHelp: factors.proximityToHelp / 100
  };

  // Apply weights and invert hazards (lower hazards = higher safety)
  const weightedFactors = {
    lighting: weights.lighting * normalizedFactors.lighting,
    footfall: weights.footfall * normalizedFactors.footfall,
    hazards: weights.hazards * (1 - normalizedFactors.hazards), // Inverted
    proximityToHelp: weights.proximityToHelp * normalizedFactors.proximityToHelp
  };

  // Calculate overall score (0-1) and convert to 0-100
  const overall =
    (weightedFactors.lighting +
      weightedFactors.footfall +
      weightedFactors.hazards +
      weightedFactors.proximityToHelp) *
    100;

  // Calculate confidence based on factor completeness
  const confidence = calculateConfidence(factors);

  return {
    overall: Math.round(Math.max(0, Math.min(100, overall))),
    factors,
    confidence,
    weightedFactors: {
      lighting: Math.round(weightedFactors.lighting * 100),
      footfall: Math.round(weightedFactors.footfall * 100),
      hazards: Math.round(weightedFactors.hazards * 100),
      proximityToHelp: Math.round(weightedFactors.proximityToHelp * 100)
    }
  };
}

/**
 * Calculate confidence level based on data completeness
 * @param factors Safety factors
 * @returns Confidence score (0-1)
 */
function calculateConfidence(factors: SafetyFactors): number {
  // Count how many factors have valid data (>0)
  const validFactors = Object.values(factors).filter(score => score > 0).length;
  return validFactors / Object.keys(factors).length;
}

/**
 * Calculate lighting quality score (L(e))
 * @param data Lighting data from multiple sources
 * @returns Normalized lighting score (0-100)
 */
export function calculateLightingScore(data: LightingData): number {
  let score = 50; // Default neutral score

  // VIIRS satellite data contribution (0-40 points)
  if (data.viirsBrightness > 0) {
    // Normalize VIIRS brightness to 0-40 scale
    const viirsContribution = Math.min(40, (data.viirsBrightness / 100) * 40);
    score += viirsContribution;
  }

  // Municipal infrastructure status (0-30 points)
  switch (data.municipalStatus) {
    case 'working':
      score += 30;
      break;
    case 'partial':
      score += 15;
      break;
    case 'broken':
      score -= 20;
      break;
  }

  // Crowdsourced reports (0-30 points)
  if (data.crowdsourcedReports.length > 0) {
    // Weighted average based on reporter trust
    const totalTrust = data.crowdsourcedReports.reduce(
      (sum, report) => sum + report.reporterTrust,
      0
    );
    const avgTrust = totalTrust / data.crowdsourcedReports.length;

    // Average status score (good=100, moderate=75, poor=50, very_poor=25)
    const statusScores: Record<string, number> = {
      good: 100,
      moderate: 75,
      poor: 50,
      very_poor: 25
    };

    const avgStatusScore =
      data.crowdsourcedReports.reduce(
        (sum, report) => sum + (statusScores[report.status] || 50),
        0
      ) / data.crowdsourcedReports.length;

    // Apply trust-weighted contribution
    const crowdContribution = (avgStatusScore / 100) * 30 * avgTrust;
    score += crowdContribution;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate footfall/activity score (F(e))
 * @param data Footfall data from multiple sources
 * @param context Contextual information
 * @returns Normalized footfall score (0-100)
 */
export function calculateFootfallScore(
  data: FootfallData,
  context: SafetyScoreContext
): number {
  let score = 30; // Base score

  // POI density contributes up to 25 points
  const poiContribution = Math.min(25, (data.poiDensity / 100) * 25);
  score += poiContribution;

  // Business activity contributes up to 20 points
  const businessContribution = (data.businessActivity / 100) * 20;
  score += businessContribution;

  // Transit activity contributes up to 15 points
  const transitContribution = (data.transitActivity / 100) * 15;
  score += transitContribution;

  // Historical data patterns contribute up to 10 points
  if (data.historicalData.length > 0) {
    const currentTimeIndex = getCurrentTimeIndex(context.timeOfDay);
    const currentFootfall = data.historicalData[currentTimeIndex] || 0;
    const avgFootfall =
      data.historicalData.reduce((sum, val) => sum + val, 0) /
      data.historicalData.length;

    // Score based on current vs average footfall
    const relativeFootfall = currentFootfall / (avgFootfall || 1);
    const historicalContribution = Math.min(10, relativeFootfall * 5);
    score += historicalContribution;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
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
 * Calculate hazard index (H(e)) - Lower score is better
 * @param data Hazard data from multiple sources
 * @param context Contextual information
 * @returns Normalized hazard score (0-100) - Higher means more hazards
 */
export function calculateHazardScore(
  data: HazardData,
  context: SafetyScoreContext
): number {
  let hazardScore = 0;
  let totalCount = 0;

  // Recent incidents (weight: 30%)
  data.recentIncidents.forEach((incident) => {
    const daysAgo =
      (Date.now() - incident.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.exp(-daysAgo / 30); // Exponential decay over 30 days
    const severityFactor = incident.severity / 5; // Normalize to 0-1
    const verificationBonus = incident.verified ? 1.5 : 1.0;

    hazardScore += severityFactor * decayFactor * verificationBonus * 30;
    totalCount += 1;
  });

  // Infrastructure issues (weight: 25%)
  data.infrastructureIssues.forEach((issue) => {
    const daysAgo =
      (Date.now() - issue.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.exp(-daysAgo / 60); // Slower decay for infrastructure
    const severityFactor = issue.severity / 5; // Normalize to 0-1

    hazardScore += severityFactor * decayFactor * 25;
    totalCount += 1;
  });

  // Weather hazards (weight: 20%)
  if (context.weatherCondition && data.weatherHazards.length > 0) {
    data.weatherHazards.forEach((hazard) => {
      const severityFactor = hazard.severity / 5; // Normalize to 0-1
      let weatherMultiplier = 1.0;

      // Adjust multiplier based on user type and weather
      switch (context.userType) {
        case 'two_wheeler':
          if (
            context.weatherCondition === 'rainy' ||
            context.weatherCondition === 'stormy'
          ) {
            weatherMultiplier = 2.0;
          }
          break;
        case 'cyclist':
          if (
            context.weatherCondition === 'rainy' ||
            context.weatherCondition === 'stormy' ||
            context.weatherCondition === 'fog'
          ) {
            weatherMultiplier = 2.5;
          }
          break;
      }

      hazardScore += severityFactor * weatherMultiplier * 20;
      totalCount += 1;
    });
  }

  // Crowdsourced hazards (weight: 25%)
  data.crowdsourcedHazards.forEach((hazard) => {
    const daysAgo =
      (Date.now() - hazard.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const decayFactor = Math.exp(-daysAgo / 14); // Decay over 14 days
    const severityFactor = hazard.severity / 5; // Normalize to 0-1
    const trustFactor = hazard.reporterTrust; // 0-1 Wilson score

    hazardScore += severityFactor * decayFactor * trustFactor * 25;
    totalCount += 1;
  });

  // Normalize score based on count
  const normalizedScore = totalCount > 0 ? hazardScore / totalCount : 0;

  return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}

/**
 * Calculate proximity to help score (P(e))
 * @param data Proximity data to emergency services
 * @returns Normalized proximity score (0-100) - Higher means closer to help
 */
export function calculateProximityToHelpScore(data: ProximityData): number {
  let score = 0;
  let totalWeight = 0;

  // Police stations (weight: 30%)
  if (data.policeStations.length > 0) {
    const nearestPolice = Math.min(
      ...data.policeStations.map((s) => s.distance)
    );
    // Score based on distance (0-500m = 100 points, 2000m+ = 0 points)
    const policeScore = Math.max(0, 100 - (nearestPolice / 2000) * 100);
    score += policeScore * 0.3;
    totalWeight += 0.3;
  }

  // Hospitals (weight: 25%)
  if (data.hospitals.length > 0) {
    const nearestHospital = Math.min(
      ...data.hospitals.map((s) => s.distance)
    );
    // Score based on distance (0-1000m = 100 points, 3000m+ = 0 points)
    const hospitalScore = Math.max(0, 100 - (nearestHospital / 3000) * 100);
    score += hospitalScore * 0.25;
    totalWeight += 0.25;
  }

  // Emergency services (weight: 20%)
  if (data.emergencyServices.length > 0) {
    const nearestEmergency = Math.min(
      ...data.emergencyServices.map((s) => s.distance)
    );
    // Score based on distance (0-1500m = 100 points, 4000m+ = 0 points)
    const emergencyScore = Math.max(0, 100 - (nearestEmergency / 4000) * 100);
    score += emergencyScore * 0.2;
    totalWeight += 0.2;
  }

  // Safe public spaces (weight: 25%)
  if (data.safePublicSpaces.length > 0) {
    const nearestSafeSpace = Math.min(
      ...data.safePublicSpaces.map((s) => s.distance)
    );
    // Score based on distance (0-300m = 100 points, 1000m+ = 0 points)
    const safeSpaceScore = Math.max(0, 100 - (nearestSafeSpace / 1000) * 100);
    score += safeSpaceScore * 0.25;
    totalWeight += 0.25;
  }

  // Normalize based on actual weights used
  const normalizedScore = totalWeight > 0 ? score / totalWeight : 50;

  return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}

/**
 * Generate detailed safety recommendations based on factors
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

  // Hazard recommendations
  if (factors.hazards > 70) {
    recommendations.push(
      'High hazard index - exercise extreme caution or find alternative route'
    );
  } else if (factors.hazards > 50) {
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

export default {
  calculateSafetyScore,
  calculateLightingScore,
  calculateFootfallScore,
  calculateHazardScore,
  calculateProximityToHelpScore,
  generateSafetyRecommendations,
  DEFAULT_WEIGHTS
};