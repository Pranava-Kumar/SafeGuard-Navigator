import { db } from './db';

/**
 * SafeRoute Multi-Factor SafetyScore Engine
 * 
 * Implements the algorithm from the solution document:
 * SafetyScore(e) = wL * L(e) + wF * F(e) + wH * H(e) + wP * P(e)
 * 
 * Where:
 * - L(e): Lighting Quality (weight: 0.30)
 * - F(e): Footfall & Activity (weight: 0.25) 
 * - H(e): Hazard Index (weight: 0.20, inverted)
 * - P(e): Proximity to Help (weight: 0.25)
 */

export interface SafetyFactors {
  lighting: {
    score: number;
    data: {
      viirsBrightness?: number;
      municipalStatus: 'working' | 'broken' | 'partial' | 'unknown';
      crowdsourcedReports: number;
      timeAdjustment: number;
      streetLightDensity?: number;
    };
  };
  footfall: {
    score: number;
    data: {
      proximityToPOIs: number;
      businessDensity: number;
      transitActivity: number;
      timeBasedActivity: number;
      populationDensity?: number;
    };
  };
  hazards: {
    score: number; // Note: This will be inverted in final calculation
    data: {
      recentIncidents: number;
      infrastructureIssues: number;
      weatherHazards: number;
      temporalDecay: number;
      crimeReports?: number;
    };
  };
  proximityToHelp: {
    score: number;
    data: {
      policeStations: number; // distance to nearest (inverted)
      hospitals: number;
      emergencyServices: number;
      safePublicSpaces: number;
      communityWatch?: number;
    };
  };
}

export interface SafetyScoreResult {
  overall: number; // 0-100 final safety score
  factors: SafetyFactors;
  contextualFactors: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    weatherCondition?: string;
    userType: 'pedestrian' | 'two_wheeler' | 'cyclist' | 'public_transport';
    localEvents?: string[];
  };
  confidence: number; // Data reliability 0-1
  lastUpdated: Date;
  sources: string[];
  aiPredictions?: {
    riskForecast: number;
    anomalyDetection: string[];
    seasonalAdjustments: number;
  };
}

// Scoring weights as per solution document
const WEIGHTS = {
  lighting: 0.30,
  footfall: 0.25,
  hazards: 0.20,
  proximityToHelp: 0.25
};

/**
 * Calculate lighting score L(e)
 * Combines VIIRS satellite data, municipal infrastructure, and crowdsourced reports
 */
export async function calculateLightingScore(
  latitude: number,
  longitude: number,
  timeOfDay: string
): Promise<{ score: number; data: SafetyFactors['lighting']['data'] }> {
  try {
    // Get lighting data from database
    // Since there's no dedicated lightingData model, we query SafetyScore records that contain lighting data
    const lightingDataRecords = await db.safetyScore.findMany({
      where: {
        latitude: { gte: latitude - 0.001, lte: latitude + 0.001 },
        longitude: { gte: longitude - 0.001, lte: longitude + 0.001 },
        AND: [
          { lightingData: { not: null } },
          { lightingData: { not: '' } }
        ]
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    // Parse the lighting data from the JSON field
    const lightingData = lightingDataRecords
      .map(record => {
        try {
          return JSON.parse(record.lightingData || '{}');
        } catch (e) {
          return {};
        }
      })
      .filter(data => Object.keys(data).length > 0);

    let baseScore = 50; // Default neutral score
    let viirsBrightness = 0;
    let municipalStatus: 'working' | 'broken' | 'partial' | 'unknown' = 'unknown';
    let crowdsourcedReports = 0;
    let streetLightDensity = 0;

    if (lightingData.length > 0) {
      // Average VIIRS brightness from nearby points
      const viiirsPoints = lightingData.filter(d => d.viirsBrightness !== undefined);
      if (viiirsPoints.length > 0) {
        viirsBrightness = viiirsPoints.reduce((sum, d) => sum + (d.viirsBrightness || 0), 0) / viiirsPoints.length;
        baseScore += Math.min(30, viirsBrightness * 2); // VIIRS contributes up to 30 points
      }

      // Municipal status
      const workingLights = lightingData.filter(d => d.municipalStatus === 'working').length;
      const totalLights = lightingData.length;
      const workingRatio = totalLights > 0 ? workingLights / totalLights : 0;
      
      if (workingRatio >= 0.8) municipalStatus = 'working';
      else if (workingRatio >= 0.5) municipalStatus = 'partial';
      else if (workingRatio > 0) municipalStatus = 'broken';

      baseScore += workingRatio * 25; // Municipal status contributes up to 25 points

      // Crowdsourced reports
      crowdsourcedReports = lightingData.reduce((sum, d) => sum + (d.crowdsourcedReports || 0), 0);
      const avgRating = lightingData
        .filter(d => d.averageRating !== undefined)
        .reduce((sum, d, _, arr) => sum + (d.averageRating || 0) / arr.length, 0);
      
      baseScore += avgRating * 2; // User ratings contribute up to 10 points (5-star system)

      // Street light density
      streetLightDensity = lightingData.filter(d => d.lightType !== undefined).length;
      baseScore += Math.min(10, streetLightDensity * 2);
    }

    // Time-based adjustment
    let timeAdjustment = 0;
    switch (timeOfDay) {
      case 'morning': // 6AM-12PM
        timeAdjustment = 0; // Daylight, lighting less important
        break;
      case 'afternoon': // 12PM-6PM  
        timeAdjustment = 0; // Still daylight
        break;
      case 'evening': // 6PM-10PM
        timeAdjustment = 1.2; // Lighting becomes important
        break;
      case 'night': // 10PM-6AM
        timeAdjustment = 1.5; // Lighting critical
        break;
    }

    const adjustedScore = Math.max(0, Math.min(100, baseScore * timeAdjustment));

    return {
      score: Math.round(adjustedScore),
      data: {
        viirsBrightness,
        municipalStatus,
        crowdsourcedReports,
        timeAdjustment,
        streetLightDensity
      }
    };
  } catch (error) {
    console.error('Error calculating lighting score:', error);
    return {
      score: 50,
      data: {
        municipalStatus: 'unknown',
        crowdsourcedReports: 0,
        timeAdjustment: 1
      }
    };
  }
}

/**
 * Calculate footfall score F(e)
 * Based on POI density, business activity, and time-based patterns
 */
export async function calculateFootfallScore(
  latitude: number,
  longitude: number,
  timeOfDay: string
): Promise<{ score: number; data: SafetyFactors['footfall']['data'] }> {
  try {
    // Get POI data within 500m radius
    const radius = 0.005; // Approximately 500m
    const poiData = await db.pOIData.findMany({
      where: {
        latitude: { gte: latitude - radius, lte: latitude + radius },
        longitude: { gte: longitude - radius, lte: longitude + radius },
        isActive: true
      }
    });

    let baseScore = 20; // Low baseline - areas with no activity are less safe
    
    // POI proximity scoring
    const proximityToPOIs = poiData.length;
    baseScore += Math.min(25, proximityToPOIs * 2); // Up to 25 points for POI density

    // Business density and type scoring
    const businessTypes = {
      'restaurant': 3,
      'shop': 2, 
      'bank': 4,
      'hospital': 5,
      'school': 3,
      'office': 2,
      'police': 8,
      'transport': 4
    };

    let businessDensity = 0;
    poiData.forEach(poi => {
      const typeScore = businessTypes[poi.category as keyof typeof businessTypes] || 1;
      businessDensity += typeScore;
    });
    
    baseScore += Math.min(20, businessDensity); // Up to 20 points for business quality

    // Transit activity (bus stops, metro stations)
    const transitPOIs = poiData.filter(poi => 
      poi.category === 'transport' || poi.category === 'metro' || poi.category === 'bus_stop'
    );
    const transitActivity = transitPOIs.length * 3;
    baseScore += Math.min(15, transitActivity); // Up to 15 points for transit access

    // Time-based activity adjustment
    let timeBasedActivity = 1.0;
    switch (timeOfDay) {
      case 'morning': // 6AM-12PM - commute time, active
        timeBasedActivity = 1.2;
        break;
      case 'afternoon': // 12PM-6PM - business hours, very active
        timeBasedActivity = 1.3;
        break;
      case 'evening': // 6PM-10PM - moderate activity
        timeBasedActivity = 1.1;
        break;
      case 'night': // 10PM-6AM - low activity
        timeBasedActivity = 0.7;
        break;
    }

    const adjustedScore = Math.max(0, Math.min(100, baseScore * timeBasedActivity));

    // Calculate population density estimate (using reviewCount as a proxy for footfall)
    const populationDensity = poiData.reduce((sum, poi) => sum + (poi.reviewCount || 0), 0);

    return {
      score: Math.round(adjustedScore),
      data: {
        proximityToPOIs,
        businessDensity,
        transitActivity,
        timeBasedActivity,
        populationDensity
      }
    };
  } catch (error) {
    console.error('Error calculating footfall score:', error);
    return {
      score: 30,
      data: {
        proximityToPOIs: 0,
        businessDensity: 0,
        transitActivity: 0,
        timeBasedActivity: 1
      }
    };
  }
}

/**
 * Calculate hazard score H(e) - NOTE: Higher values mean MORE hazardous
 * This score will be inverted in the final calculation
 */
export async function calculateHazardScore(
  latitude: number,
  longitude: number
): Promise<{ score: number; data: SafetyFactors['hazards']['data'] }> {
  try {
    const radius = 0.01; // Approximately 1km radius for hazard assessment
    
    // Get recent incident reports (last 90 days)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const incidents = await db.incidentReport.findMany({
      where: {
        latitude: { gte: latitude - radius, lte: latitude + radius },
        longitude: { gte: longitude - radius, lte: longitude + radius },
        createdAt: { gte: ninetyDaysAgo },
        status: { in: ['pending', 'verified'] }
      }
    });

    let hazardScore = 0; // Start with no hazards

    // Recent incidents scoring
    const recentIncidents = incidents.length;
    hazardScore += recentIncidents * 5; // Each incident adds 5 hazard points

    // Severity-weighted incidents
    const severityWeight = incidents.reduce((sum, incident) => sum + incident.severity, 0);
    hazardScore += severityWeight * 2; // Severity multiplier

    // Infrastructure issues from dark spots
    // Since there's no dedicated darkSpotData model, we query SafetyScore records that might contain dark spot data
    // Based on the data-integration.ts file, dark spot data is stored in the factors field
    const safetyScoresWithFactors = await db.safetyScore.findMany({
      where: {
        latitude: { gte: latitude - radius, lte: latitude + radius },
        longitude: { gte: longitude - radius, lte: longitude + radius },
        factors: { not: null },
        hazardScore: { gt: 0 } // Look for records that have hazard data
      }
    });
    
    // Extract dark spot information from factors
    let infrastructureIssues = 0;
    safetyScoresWithFactors.forEach(record => {
      try {
        const factors = JSON.parse(record.factors || '{}');
        if (factors.spotType && factors.status === 'active') {
          infrastructureIssues++;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });
    
    hazardScore += infrastructureIssues * 8; // Dark spots are significant hazards

    // Weather hazards from current conditions
    const weatherHazards = 0;
    // This would integrate with weather API in real implementation
    // For now, we'll use a placeholder

    // Temporal decay - older incidents have less weight
    const now = Date.now();
    let temporalDecay = 0;
    incidents.forEach(incident => {
      const ageInDays = (now - incident.createdAt.getTime()) / (24 * 60 * 60 * 1000);
      const decayFactor = Math.max(0, 1 - (ageInDays / 90)); // Linear decay over 90 days
      temporalDecay += decayFactor;
    });

    // Apply temporal decay
    hazardScore = hazardScore * (1 - temporalDecay * 0.1); // Reduce by up to 10% based on age

    // Crime reports (specific incident types)
    const crimeReports = incidents.filter(i => 
      ['theft', 'assault', 'harassment', 'suspicious'].includes(i.incidentType)
    ).length;

    return {
      score: Math.round(Math.max(0, Math.min(100, hazardScore))),
      data: {
        recentIncidents,
        infrastructureIssues,
        weatherHazards,
        temporalDecay,
        crimeReports
      }
    };
  } catch (error) {
    console.error('Error calculating hazard score:', error);
    return {
      score: 20, // Default moderate hazard level
      data: {
        recentIncidents: 0,
        infrastructureIssues: 0,
        weatherHazards: 0,
        temporalDecay: 0
      }
    };
  }
}

/**
 * Calculate proximity to help score P(e)
 * Based on distance to emergency services and safe spaces
 */
export async function calculateProximityToHelpScore(
  latitude: number,
  longitude: number
): Promise<{ score: number; data: SafetyFactors['proximityToHelp']['data'] }> {
  try {
    const searchRadius = 0.02; // Approximately 2km radius
    
    // Find emergency services within radius
    const emergencyPOIs = await db.pOIData.findMany({
      where: {
        latitude: { gte: latitude - searchRadius, lte: latitude + searchRadius },
        longitude: { gte: longitude - searchRadius, lte: longitude + searchRadius },
        isEmergencyService: true,
        isActive: true
      }
    });

    // Find all safety-relevant POIs
    const safetyPOIs = await db.pOIData.findMany({
      where: {
        latitude: { gte: latitude - searchRadius, lte: latitude + searchRadius },
        longitude: { gte: longitude - searchRadius, lte: longitude + searchRadius },
        category: { in: ['police', 'hospital', 'fire_station', 'government', 'bank', 'mall', 'hotel'] },
        isActive: true
      }
    });

    let baseScore = 0;

    // Calculate distances and score based on proximity
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
      return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * R;
    };

    // Police stations scoring
    const policeStations = safetyPOIs.filter(poi => poi.category === 'police');
    let policeScore = 0;
    if (policeStations.length > 0) {
      const nearestPolice = Math.min(...policeStations.map(p => 
        calculateDistance(latitude, longitude, p.latitude, p.longitude)
      ));
      policeScore = Math.max(0, 30 - nearestPolice * 15); // Up to 30 points, decreasing with distance
    }
    baseScore += policeScore;

    // Hospitals scoring  
    const hospitals = safetyPOIs.filter(poi => poi.category === 'hospital');
    let hospitalScore = 0;
    if (hospitals.length > 0) {
      const nearestHospital = Math.min(...hospitals.map(h => 
        calculateDistance(latitude, longitude, h.latitude, h.longitude)
      ));
      hospitalScore = Math.max(0, 25 - nearestHospital * 12); // Up to 25 points
    }
    baseScore += hospitalScore;

    // Emergency services scoring
    let emergencyScore = 0;
    emergencyPOIs.forEach(poi => {
      const distance = calculateDistance(latitude, longitude, poi.latitude, poi.longitude);
      emergencyScore += Math.max(0, 20 - distance * 10); // Each emergency service adds points
    });
    baseScore += Math.min(25, emergencyScore); // Cap at 25 points

    // Safe public spaces (malls, hotels, government buildings)
    const safeSpaces = safetyPOIs.filter(poi => 
      ['mall', 'hotel', 'government', 'bank'].includes(poi.category)
    );
    let safeSpaceScore = 0;
    safeSpaces.forEach(space => {
      const distance = calculateDistance(latitude, longitude, space.latitude, space.longitude);
      if (distance <= 0.5) { // Within 500m
        safeSpaceScore += 2;
      }
    });
    baseScore += Math.min(20, safeSpaceScore); // Cap at 20 points

    return {
      score: Math.round(Math.max(0, Math.min(100, baseScore))),
      data: {
        policeStations: policeStations.length,
        hospitals: hospitals.length,
        emergencyServices: emergencyPOIs.length,
        safePublicSpaces: safeSpaces.length
      }
    };
  } catch (error) {
    console.error('Error calculating proximity to help score:', error);
    return {
      score: 30, // Default moderate score
      data: {
        policeStations: 0,
        hospitals: 0,
        emergencyServices: 0,
        safePublicSpaces: 0
      }
    };
  }
}

/**
 * Main SafetyScore calculation function
 * Implements: SafetyScore(e) = wL * L(e) + wF * F(e) + wH * H(e) + wP * P(e)
 */
export async function calculateSafetyScore(
  latitude: number,
  longitude: number,
  userType: 'pedestrian' | 'two_wheeler' | 'cyclist' | 'public_transport' = 'pedestrian',
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'afternoon'
): Promise<SafetyScoreResult> {
  try {
    // Calculate all four factors
    const [lighting, footfall, hazard, proximity] = await Promise.all([
      calculateLightingScore(latitude, longitude, timeOfDay),
      calculateFootfallScore(latitude, longitude, timeOfDay),
      calculateHazardScore(latitude, longitude),
      calculateProximityToHelpScore(latitude, longitude)
    ]);

    // Apply the SafeRoute algorithm
    // Note: Hazard score is inverted (100 - hazard.score) because higher hazard = lower safety
    const overallScore = 
      WEIGHTS.lighting * lighting.score +
      WEIGHTS.footfall * footfall.score +
      WEIGHTS.hazards * (100 - hazard.score) + // Inverted for safety
      WEIGHTS.proximityToHelp * proximity.score;

    // User type adjustments
    let userTypeMultiplier = 1.0;
    switch (userType) {
      case 'pedestrian':
        userTypeMultiplier = 1.0; // Base case
        break;
      case 'two_wheeler':
        userTypeMultiplier = 0.95; // Slightly more vulnerable
        break;
      case 'cyclist':
        userTypeMultiplier = 0.9; // More vulnerable
        break;
      case 'public_transport':
        userTypeMultiplier = 1.1; // Safer due to predictable routes
        break;
    }

    const adjustedScore = Math.round(Math.max(0, Math.min(100, overallScore * userTypeMultiplier)));

    // Calculate confidence based on data availability
    const dataPoints = [
      lighting.data.viirsBrightness !== undefined ? 1 : 0,
      lighting.data.municipalStatus !== 'unknown' ? 1 : 0,
      footfall.data.proximityToPOIs > 0 ? 1 : 0,
      hazard.data.recentIncidents >= 0 ? 1 : 0,
      proximity.data.policeStations > 0 ? 1 : 0
    ];
    const confidence = dataPoints.reduce((sum, point) => sum + point, 0) / dataPoints.length;

    // Store result in database
    await db.safetyScore.create({
      data: {
        latitude,
        longitude,
        overallScore: adjustedScore,
        confidence,
        lightingScore: lighting.score,
        footfallScore: footfall.score,
        hazardScore: hazard.score,
        proximityScore: proximity.score,
        timeOfDay,
        userType,
        sources: JSON.stringify(['viirs', 'osm', 'municipal', 'crowdsourced']),
        factors: JSON.stringify({ lighting, footfall, hazard, proximity }),
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // Expires in 6 hours
      }
    });

    return {
      overall: adjustedScore,
      factors: {
        lighting: { score: lighting.score, data: lighting.data },
        footfall: { score: footfall.score, data: footfall.data },
        hazards: { score: hazard.score, data: hazard.data },
        proximityToHelp: { score: proximity.score, data: proximity.data }
      },
      contextualFactors: {
        timeOfDay,
        userType,
        localEvents: [] // Could be populated from events API
      },
      confidence,
      lastUpdated: new Date(),
      sources: ['viirs', 'osm', 'municipal', 'crowdsourced']
    };

  } catch (error) {
    console.error('Error calculating safety score:', error);
    
    // Return fallback score
    return {
      overall: 50,
      factors: {
        lighting: { score: 50, data: { municipalStatus: 'unknown', crowdsourcedReports: 0, timeAdjustment: 1 } },
        footfall: { score: 30, data: { proximityToPOIs: 0, businessDensity: 0, transitActivity: 0, timeBasedActivity: 1 } },
        hazards: { score: 30, data: { recentIncidents: 0, infrastructureIssues: 0, weatherHazards: 0, temporalDecay: 0 } },
        proximityToHelp: { score: 30, data: { policeStations: 0, hospitals: 0, emergencyServices: 0, safePublicSpaces: 0 } }
      },
      contextualFactors: { timeOfDay, userType },
      confidence: 0.2,
      lastUpdated: new Date(),
      sources: ['fallback']
    };
  }
}

/**
 * Get cached safety score or calculate new one
 */
export async function getSafetyScore(
  latitude: number,
  longitude: number,
  userType: 'pedestrian' | 'two_wheeler' | 'cyclist' | 'public_transport' = 'pedestrian',
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' = 'afternoon'
): Promise<SafetyScoreResult> {
  try {
    // Check for recent cached score within 100m
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const radius = 0.001; // ~100m
    
    const cachedScore = await db.safetyScore.findFirst({
      where: {
        latitude: { gte: latitude - radius, lte: latitude + radius },
        longitude: { gte: longitude - radius, lte: longitude + radius },
        userType,
        timeOfDay,
        timestamp: { gte: oneHourAgo },
        expiresAt: { gte: new Date() }
      },
      orderBy: { timestamp: 'desc' }
    });

    if (cachedScore) {
      return {
        overall: cachedScore.overallScore,
        factors: cachedScore.factors ? JSON.parse(cachedScore.factors) : {},
        contextualFactors: {
          timeOfDay: (cachedScore.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'night') || 'afternoon',
          userType: (cachedScore.userType as 'pedestrian' | 'two_wheeler' | 'cyclist' | 'public_transport') || 'pedestrian'
        },
        confidence: cachedScore.confidence || 0,
        lastUpdated: cachedScore.timestamp,
        sources: cachedScore.sources ? JSON.parse(cachedScore.sources) : []
      };
    }

    // Calculate new score if no cached version found
    return await calculateSafetyScore(latitude, longitude, userType, timeOfDay);

  } catch (error) {
    console.error('Error getting safety score:', error);
    return await calculateSafetyScore(latitude, longitude, userType, timeOfDay);
  }
}