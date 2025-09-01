/**
 * SafeRoute Safety Score Calculation Service
 * Implements multi-factor safety scoring algorithm
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Types for safety score calculation
export interface LocationData {
  latitude: number;
  longitude: number;
  time?: Date;
  accuracy?: number;
}

export interface SafetyFactors {
  crimeRate?: number;
  lightingLevel?: number;
  populationDensity?: number;
  trafficDensity?: number;
  emergencyServiceProximity?: number;
  reportedIncidents?: number;
  verifiedReports?: number;
  cameraPresence?: number;
  policePresence?: number;
  timeOfDay?: number;
  weatherConditions?: number;
  roadQuality?: number;
}

export interface SafetyScoreResult {
  overallScore: number;
  factors: SafetyFactors;
  confidence: number;
  timestamp: Date;
  locationData: LocationData;
}

export interface SafetyScoreOptions {
  includeRealTimeData?: boolean;
  includeHistoricalData?: boolean;
  includeCrowdsourcedData?: boolean;
  includeWeatherData?: boolean;
  maxAgeMinutes?: number;
  userRiskTolerance?: 'low' | 'medium' | 'high';
}

// Safety Score Service
class SafetyScoreService {
  // Factor weights for different risk tolerance levels
  private readonly factorWeights = {
    low: {
      crimeRate: 0.25,
      lightingLevel: 0.15,
      populationDensity: 0.10,
      trafficDensity: 0.05,
      emergencyServiceProximity: 0.15,
      reportedIncidents: 0.10,
      verifiedReports: 0.15,
      cameraPresence: 0.05,
      policePresence: 0.10,
      timeOfDay: 0.15,
      weatherConditions: 0.10,
      roadQuality: 0.05
    },
    medium: {
      crimeRate: 0.20,
      lightingLevel: 0.10,
      populationDensity: 0.10,
      trafficDensity: 0.05,
      emergencyServiceProximity: 0.10,
      reportedIncidents: 0.10,
      verifiedReports: 0.15,
      cameraPresence: 0.05,
      policePresence: 0.05,
      timeOfDay: 0.10,
      weatherConditions: 0.05,
      roadQuality: 0.05
    },
    high: {
      crimeRate: 0.15,
      lightingLevel: 0.05,
      populationDensity: 0.05,
      trafficDensity: 0.05,
      emergencyServiceProximity: 0.05,
      reportedIncidents: 0.10,
      verifiedReports: 0.15,
      cameraPresence: 0.05,
      policePresence: 0.05,
      timeOfDay: 0.05,
      weatherConditions: 0.05,
      roadQuality: 0.05
    }
  };

  /**
   * Calculate safety score for a specific location
   */
  async calculateSafetyScore(
    location: LocationData,
    options: SafetyScoreOptions = {}
  ): Promise<SafetyScoreResult> {
    const {
      includeHistoricalData = true,
      includeCrowdsourcedData = true,
      includeWeatherData = true,
      maxAgeMinutes = 60,
      userRiskTolerance = 'medium'
    } = options;

    // Get weights based on user risk tolerance
    const weights = this.factorWeights[userRiskTolerance];

    // Initialize safety factors
    const factors: SafetyFactors = {};
    let confidenceScore = 0;
    let dataPointsCount = 0;

    try {
      // 1. Get historical crime data
      if (includeHistoricalData) {
        const crimeData = await this.getHistoricalCrimeData(location);
        factors.crimeRate = crimeData.score;
        confidenceScore += crimeData.confidence;
        dataPointsCount++;
      }

      // 2. Get lighting data
      const lightingData = await this.getLightingData(location);
      factors.lightingLevel = lightingData.score;
      confidenceScore += lightingData.confidence;
      dataPointsCount++;

      // 3. Get population density
      const populationData = await this.getPopulationDensity(location);
      factors.populationDensity = populationData.score;
      confidenceScore += populationData.confidence;
      dataPointsCount++;

      // 4. Get emergency services proximity
      const emergencyData = await this.getEmergencyServicesProximity(location);
      factors.emergencyServiceProximity = emergencyData.score;
      confidenceScore += emergencyData.confidence;
      dataPointsCount++;

      // 5. Get reported incidents (crowdsourced)
      if (includeCrowdsourcedData) {
        const incidentData = await this.getReportedIncidents(location, maxAgeMinutes);
        factors.reportedIncidents = incidentData.score;
        factors.verifiedReports = incidentData.verifiedScore;
        confidenceScore += incidentData.confidence;
        dataPointsCount++;
      }

      // 6. Get surveillance data (cameras, police presence)
      const surveillanceData = await this.getSurveillanceData(location);
      factors.cameraPresence = surveillanceData.cameraScore;
      factors.policePresence = surveillanceData.policeScore;
      confidenceScore += surveillanceData.confidence;
      dataPointsCount++;

      // 7. Get time-based safety factor
      const timeData = this.getTimeBasedSafetyFactor(location.time);
      factors.timeOfDay = timeData.score;
      confidenceScore += timeData.confidence;
      dataPointsCount++;

      // 8. Get weather conditions if enabled
      if (includeWeatherData) {
        const weatherData = await this.getWeatherConditions(location);
        factors.weatherConditions = weatherData.score;
        confidenceScore += weatherData.confidence;
        dataPointsCount++;
      }

      // 9. Get road quality data
      const roadData = await this.getRoadQualityData(location);
      factors.roadQuality = roadData.score;
      confidenceScore += roadData.confidence;
      dataPointsCount++;

      // Calculate overall confidence (average of all data points)
      const overallConfidence = dataPointsCount > 0 ? confidenceScore / dataPointsCount : 0;

      // Calculate weighted safety score
      let weightedScore = 0;
      let totalWeight = 0;

      for (const [factor, value] of Object.entries(factors)) {
        if (value !== undefined && weights[factor as keyof typeof weights] !== undefined) {
          weightedScore += value * weights[factor as keyof typeof weights];
          totalWeight += weights[factor as keyof typeof weights];
        }
      }

      // Normalize score to 0-100 range
      const normalizedScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 50;

      // Ensure score is within 0-100 range
      const overallScore = Math.max(0, Math.min(100, normalizedScore));

      // Return safety score result
      return {
        overallScore,
        factors,
        confidence: overallConfidence,
        timestamp: new Date(),
        locationData: location
      };
    } catch (error) {
      console.error('Error calculating safety score:', error);
      
      // Return fallback safety score with low confidence
      return {
        overallScore: 50, // Neutral score
        factors: {},
        confidence: 0.2, // Low confidence
        timestamp: new Date(),
        locationData: location
      };
    }
  }

  /**
   * Calculate safety scores for a route (array of locations)
   */
  async calculateRouteSafetyScore(
    routePoints: LocationData[],
    options: SafetyScoreOptions = {}
  ): Promise<{
    overallScore: number;
    segmentScores: SafetyScoreResult[];
    dangerousSegments: { start: LocationData; end: LocationData; score: number }[];
  }> {
    // Calculate safety score for each point in the route
    const segmentScores: SafetyScoreResult[] = [];
    
    for (const point of routePoints) {
      const score = await this.calculateSafetyScore(point, options);
      segmentScores.push(score);
    }

    // Identify dangerous segments (score below 40)
    const dangerousSegments = [];
    for (let i = 0; i < segmentScores.length - 1; i++) {
      if (segmentScores[i].overallScore < 40) {
        dangerousSegments.push({
          start: routePoints[i],
          end: routePoints[i + 1],
          score: segmentScores[i].overallScore
        });
      }
    }

    // Calculate overall route safety score (weighted by segment length)
    let totalScore = 0;
    let totalWeight = 0;

    for (let i = 0; i < segmentScores.length; i++) {
      // Use segment length as weight (if available)
      let weight = 1;
      if (i < routePoints.length - 1) {
        weight = this.calculateDistance(
          routePoints[i].latitude,
          routePoints[i].longitude,
          routePoints[i + 1].latitude,
          routePoints[i + 1].longitude
        );
      }

      totalScore += segmentScores[i].overallScore * weight;
      totalWeight += weight;
    }

    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 50;

    return {
      overallScore,
      segmentScores,
      dangerousSegments
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Get historical crime data for location
   * This is a placeholder implementation
   */
  private async getHistoricalCrimeData(location: LocationData): Promise<{ score: number; confidence: number }> {
    try {
      // Query database for crime data near this location
      const crimeData = await prisma.$queryRaw`
        SELECT calculate_safety_score(
          ${location.latitude}::float8, 
          ${location.longitude}::float8, 
          'crime_data'
        ) as score
      `;

      // Parse result (this is a placeholder)
      const score = Array.isArray(crimeData) && crimeData.length > 0 ? 
        parseFloat(crimeData[0].score) : 70;

      return {
        score: score,
        confidence: 0.8
      };
    } catch (error) {
      console.error('Error getting crime data:', error);
      return { score: 70, confidence: 0.5 }; // Fallback value
    }
  }

  /**
   * Get lighting data for location
   * This is a placeholder implementation
   */
  private async getLightingData(location: LocationData): Promise<{ score: number; confidence: number }> {
    try {
      // Query database for lighting data near this location
      const lightingData = await prisma.$queryRaw`
        SELECT calculate_safety_score(
          ${location.latitude}::float8, 
          ${location.longitude}::float8, 
          'lighting_data'
        ) as score
      `;

      // Parse result (this is a placeholder)
      const score = Array.isArray(lightingData) && lightingData.length > 0 ? 
        parseFloat(lightingData[0].score) : 65;

      return {
        score: score,
        confidence: 0.7
      };
    } catch (error) {
      console.error('Error getting lighting data:', error);
      return { score: 65, confidence: 0.5 }; // Fallback value
    }
  }

  /**
   * Get population density for location
   * This is a placeholder implementation
   */
  private async getPopulationDensity(location: LocationData): Promise<{ score: number; confidence: number }> {
    // Placeholder implementation using location data
    console.log(`Calculating population density for location: ${location.latitude}, ${location.longitude}`);
    return { score: 75, confidence: 0.6 };
  }

  /**
   * Get emergency services proximity for location
   * This is a placeholder implementation
   */
  private async getEmergencyServicesProximity(location: LocationData): Promise<{ score: number; confidence: number }> {
    // Placeholder implementation using location data
    console.log(`Calculating emergency services proximity for location: ${location.latitude}, ${location.longitude}`);
    return { score: 80, confidence: 0.7 };
  }

  /**
   * Get reported incidents for location
   * This is a placeholder implementation
   */
  private async getReportedIncidents(
    location: LocationData,
    maxAgeMinutes: number
  ): Promise<{ score: number; verifiedScore: number; confidence: number }> {
    try {
      // Calculate date threshold for recent reports
      const threshold = new Date();
      threshold.setMinutes(threshold.getMinutes() - maxAgeMinutes);

      // Query database for incident reports near this location
      const reports = await prisma.safetyReport.findMany({
        where: {
          latitude: {
            gte: location.latitude - 0.01,
            lte: location.latitude + 0.01
          },
          longitude: {
            gte: location.longitude - 0.01,
            lte: location.longitude + 0.01
          },
          createdAt: {
            gte: threshold
          }
        },
        select: {
          id: true,
          severity: true,
          verificationStatus: true,
          upvotes: true,
          downvotes: true
        }
      });

      // Calculate score based on reports
      if (reports.length === 0) {
        return { score: 90, verifiedScore: 90, confidence: 0.5 };
      }

      // Calculate score based on severity and verification status
      let totalScore = 0;
      let totalVerifiedScore = 0;
      let verifiedCount = 0;

      for (const report of reports) {
        // Convert severity to score (higher severity = lower safety score)
        let severityScore = 0;
        switch (report.severity) {
          case 'LOW':
            severityScore = 80;
            break;
          case 'MEDIUM':
            severityScore = 60;
            break;
          case 'HIGH':
            severityScore = 30;
            break;
          case 'CRITICAL':
            severityScore = 10;
            break;
          default:
            severityScore = 70;
        }

        // Apply community trust factor (upvotes vs downvotes)
        const trustFactor = report.upvotes / (report.upvotes + report.downvotes + 1);
        severityScore = severityScore * (0.7 + (trustFactor * 0.3));

        totalScore += severityScore;

        // Track verified reports separately
        if (report.verificationStatus === 'VERIFIED') {
          totalVerifiedScore += severityScore;
          verifiedCount++;
        }
      }

      const averageScore = totalScore / reports.length;
      const averageVerifiedScore = verifiedCount > 0 ? totalVerifiedScore / verifiedCount : 80;

      return {
        score: averageScore,
        verifiedScore: averageVerifiedScore,
        confidence: 0.8 // Higher confidence due to real user reports
      };
    } catch (error) {
      console.error('Error getting incident reports:', error);
      return { score: 70, verifiedScore: 70, confidence: 0.4 }; // Fallback value
    }
  }

  /**
   * Get surveillance data for location
   * This is a placeholder implementation
   */
  private async getSurveillanceData(
    location: LocationData
  ): Promise<{ cameraScore: number; policeScore: number; confidence: number }> {
    // Placeholder implementation using location data
    console.log(`Calculating surveillance data for location: ${location.latitude}, ${location.longitude}`);
    return { cameraScore: 75, policeScore: 80, confidence: 0.6 };
  }

  /**
   * Get time-based safety factor
   * This is a placeholder implementation
   */
  private getTimeBasedSafetyFactor(time?: Date): { score: number; confidence: number } {
    const currentTime = time || new Date();
    const hour = currentTime.getHours();

    // Safety score based on time of day
    // Higher score during daylight hours (7am-7pm)
    let score = 0;
    if (hour >= 7 && hour < 17) {
      // Daytime (7am-5pm): Safest
      score = 90;
    } else if (hour >= 17 && hour < 20) {
      // Evening (5pm-8pm): Moderately safe
      score = 70;
    } else if (hour >= 20 && hour < 23) {
      // Night (8pm-11pm): Less safe
      score = 50;
    } else {
      // Late night/early morning: Least safe
      score = 30;
    }

    return { score, confidence: 0.9 }; // High confidence as time is known
  }

  /**
   * Get weather conditions for location
   * This is a placeholder implementation
   */
  private async getWeatherConditions(location: LocationData): Promise<{ score: number; confidence: number }> {
    // Placeholder implementation using location data
    console.log(`Calculating weather conditions for location: ${location.latitude}, ${location.longitude}`);
    return { score: 85, confidence: 0.7 };
  }

  /**
   * Get road quality data for location
   * This is a placeholder implementation
   */
  private async getRoadQualityData(location: LocationData): Promise<{ score: number; confidence: number }> {
    // Placeholder implementation using location data
    console.log(`Calculating road quality data for location: ${location.latitude}, ${location.longitude}`);
    return { score: 75, confidence: 0.6 };
  }
}

export default SafetyScoreService;