/**
 * SafeRoute Route Optimization Service
 * Implements safety-first route planning algorithm
 */

import { PrismaClient } from '@prisma/client';
import SafetyScoreService, { LocationData, SafetyScoreOptions } from './safetyScoreService';

const prisma = new PrismaClient();
const safetyScoreService = new SafetyScoreService();

// Types for route optimization
export interface RoutePoint extends LocationData {
  name?: string;
  address?: string;
  safetyScore?: number;
}

export interface RouteOptions {
  avoidDarkSpots?: boolean;
  avoidLowLightAreas?: boolean;
  avoidHighCrimeAreas?: boolean;
  preferCCTVCoverage?: boolean;
  preferHighPopulationDensity?: boolean;
  preferPoliceProximity?: boolean;
  minimumSafetyScore?: number;
  maxDetourPercentage?: number;
  transportMode?: 'walking' | 'cycling' | 'driving' | 'public_transport';
  timeOfTravel?: Date;
  userRiskTolerance?: 'low' | 'medium' | 'high';
}

export interface OptimizedRoute {
  routeId: string;
  origin: RoutePoint;
  destination: RoutePoint;
  waypoints: RoutePoint[];
  overallSafetyScore: number;
  distance: number;
  duration: number;
  dangerousSegments: {
    start: RoutePoint;
    end: RoutePoint;
    safetyScore: number;
    reason?: string;
  }[];
  alternativeRoutes?: {
    routeId: string;
    overallSafetyScore: number;
    distance: number;
    duration: number;
    detourPercentage: number;
  }[];
}

// Route Optimization Service
class RouteOptimizationService {
  /**
   * Generate optimized route with safety as primary consideration
   */
  async generateSafeRoute(
    origin: RoutePoint,
    destination: RoutePoint,
    options: RouteOptions = {}
  ): Promise<OptimizedRoute> {
    try {
      // Default options
      const {
        avoidDarkSpots = true,
        avoidLowLightAreas = true,
        avoidHighCrimeAreas = true,
        preferCCTVCoverage = true,
        preferHighPopulationDensity = true,
        preferPoliceProximity = false,
        minimumSafetyScore = 50,
        maxDetourPercentage = 20,
        transportMode = 'walking',
        timeOfTravel = new Date(),
        userRiskTolerance = 'medium'
      } = options;

      // 1. Get initial route from external routing service
      const initialRoute = await this.getInitialRoute(origin, destination, transportMode);

      // 2. Calculate safety scores for each segment of the initial route
      const safetyScoreOptions: SafetyScoreOptions = {
        includeRealTimeData: true,
        includeHistoricalData: true,
        includeCrowdsourcedData: true,
        includeWeatherData: true,
        userRiskTolerance
      };

      const routeSafetyScore = await safetyScoreService.calculateRouteSafetyScore(
        initialRoute.waypoints,
        safetyScoreOptions
      );

      // 3. Identify dangerous segments that need rerouting
      const dangerousSegments = routeSafetyScore.dangerousSegments.map(segment => ({
        start: this.findNearestRoutePoint(segment.start, initialRoute.waypoints),
        end: this.findNearestRoutePoint(segment.end, initialRoute.waypoints),
        safetyScore: segment.score,
        reason: this.getDangerReason(segment.score)
      }));

      // 4. If route meets safety criteria, return it
      if (routeSafetyScore.overallScore >= minimumSafetyScore && dangerousSegments.length === 0) {
        return {
          routeId: this.generateRouteId(),
          origin,
          destination,
          waypoints: initialRoute.waypoints.map((point, index) => ({
            ...point,
            safetyScore: routeSafetyScore.segmentScores[index]?.overallScore
          })),
          overallSafetyScore: routeSafetyScore.overallScore,
          distance: initialRoute.distance,
          duration: initialRoute.duration,
          dangerousSegments: []
        };
      }

      // 5. Generate alternative routes to avoid dangerous segments
      const alternativeRoutes = await this.generateAlternativeRoutes(
        origin,
        destination,
        dangerousSegments,
        transportMode,
        maxDetourPercentage,
        safetyScoreOptions
      );

      // 6. Select the best alternative route
      const bestRoute = this.selectBestRoute(alternativeRoutes, minimumSafetyScore, maxDetourPercentage);

      // 7. If no suitable alternative found, enhance the initial route with safety information
      if (!bestRoute) {
        return {
          routeId: this.generateRouteId(),
          origin,
          destination,
          waypoints: initialRoute.waypoints.map((point, index) => ({
            ...point,
            safetyScore: routeSafetyScore.segmentScores[index]?.overallScore
          })),
          overallSafetyScore: routeSafetyScore.overallScore,
          distance: initialRoute.distance,
          duration: initialRoute.duration,
          dangerousSegments,
          alternativeRoutes: alternativeRoutes.map(route => ({
            routeId: route.routeId,
            overallSafetyScore: route.overallSafetyScore,
            distance: route.distance,
            duration: route.duration,
            detourPercentage: this.calculateDetourPercentage(initialRoute, route)
          }))
        };
      }

      // 8. Return the optimized safe route
      return bestRoute;
    } catch (error) {
      console.error('Error generating safe route:', error);
      
      // Return a basic route with warning
      return {
        routeId: this.generateRouteId(),
        origin,
        destination,
        waypoints: [origin, destination],
        overallSafetyScore: 50, // Neutral score
        distance: this.calculateDirectDistance(origin, destination),
        duration: this.estimateDuration(origin, destination, 'walking'),
        dangerousSegments: [{
          start: origin,
          end: destination,
          safetyScore: 50,
          reason: 'Route calculation error - using direct path'
        }]
      };
    }
  }

  /**
   * Get initial route from external routing service
   * This is a placeholder implementation
   */
  private async getInitialRoute(
    origin: RoutePoint,
    destination: RoutePoint,
    transportMode: string
  ): Promise<{
    waypoints: RoutePoint[];
    distance: number;
    duration: number;
  }> {
    // Placeholder implementation - in a real app, this would call a routing API
    // like Mappls, Google Maps, or OpenStreetMap Routing
    
    // Generate some waypoints along a straight line between origin and destination
    const waypoints: RoutePoint[] = [origin];
    
    // Add some intermediate points
    const steps = 5;
    for (let i = 1; i < steps; i++) {
      const fraction = i / steps;
      waypoints.push({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * fraction,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * fraction,
        time: origin.time
      });
    }
    
    waypoints.push(destination);
    
    // Calculate direct distance
    const distance = this.calculateDirectDistance(origin, destination);
    
    // Estimate duration based on transport mode
    const duration = this.estimateDuration(origin, destination, transportMode);
    
    return {
      waypoints,
      distance,
      duration
    };
  }

  /**
   * Generate alternative routes to avoid dangerous segments
   */
  private async generateAlternativeRoutes(
    origin: RoutePoint,
    destination: RoutePoint,
    dangerousSegments: {
      start: RoutePoint;
      end: RoutePoint;
      safetyScore: number;
      reason?: string;
    }[],
    transportMode: string,
    maxDetourPercentage: number,
    safetyScoreOptions: SafetyScoreOptions
  ): Promise<OptimizedRoute[]> {
    // Placeholder implementation - in a real app, this would generate multiple routes
    // and evaluate their safety scores
    
    const alternativeRoutes: OptimizedRoute[] = [];
    
    // Generate 3 alternative routes with slight variations
    for (let i = 0; i < 3; i++) {
      // Create a variation by adding a small random offset to waypoints
      const variation = 0.002 * (i + 1); // Approximately 200m * (i+1)
      
      // Get initial route with variation
      const variedRoute = await this.getInitialRouteWithVariation(
        origin,
        destination,
        transportMode,
        variation
      );
      
      // Calculate safety score for this route
      const routeSafetyScore = await safetyScoreService.calculateRouteSafetyScore(
        variedRoute.waypoints,
        safetyScoreOptions
      );
      
      // Calculate detour percentage
      const directDistance = this.calculateDirectDistance(origin, destination);
      const detourPercentage = ((variedRoute.distance - directDistance) / directDistance) * 100;
      
      // Only include routes within acceptable detour percentage
      if (detourPercentage <= maxDetourPercentage) {
        // Map dangerous segments
        const routeDangerousSegments = routeSafetyScore.dangerousSegments.map(segment => ({
          start: this.findNearestRoutePoint(segment.start, variedRoute.waypoints),
          end: this.findNearestRoutePoint(segment.end, variedRoute.waypoints),
          safetyScore: segment.score,
          reason: this.getDangerReason(segment.score)
        }));
        
        alternativeRoutes.push({
          routeId: this.generateRouteId(),
          origin,
          destination,
          waypoints: variedRoute.waypoints.map((point, index) => ({
            ...point,
            safetyScore: routeSafetyScore.segmentScores[index]?.overallScore
          })),
          overallSafetyScore: routeSafetyScore.overallScore,
          distance: variedRoute.distance,
          duration: variedRoute.duration,
          dangerousSegments: routeDangerousSegments
        });
      }
    }
    
    return alternativeRoutes;
  }

  /**
   * Get initial route with variation for alternative routes
   */
  private async getInitialRouteWithVariation(
    origin: RoutePoint,
    destination: RoutePoint,
    transportMode: string,
    variation: number
  ): Promise<{
    waypoints: RoutePoint[];
    distance: number;
    duration: number;
  }> {
    // Generate some waypoints along a varied path between origin and destination
    const waypoints: RoutePoint[] = [origin];
    
    // Add some intermediate points with variation
    const steps = 5;
    for (let i = 1; i < steps; i++) {
      const fraction = i / steps;
      
      // Add variation to latitude and longitude
      const variationLat = (Math.random() - 0.5) * variation;
      const variationLng = (Math.random() - 0.5) * variation;
      
      waypoints.push({
        latitude: origin.latitude + (destination.latitude - origin.latitude) * fraction + variationLat,
        longitude: origin.longitude + (destination.longitude - origin.longitude) * fraction + variationLng,
        time: origin.time
      });
    }
    
    waypoints.push(destination);
    
    // Calculate total distance along waypoints
    let distance = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      distance += this.calculateDirectDistance(waypoints[i], waypoints[i + 1]);
    }
    
    // Estimate duration based on transport mode and distance
    const duration = this.estimateDuration(origin, destination, transportMode, distance);
    
    return {
      waypoints,
      distance,
      duration
    };
  }

  /**
   * Select the best route from alternatives based on safety score and detour percentage
   */
  private selectBestRoute(
    alternativeRoutes: OptimizedRoute[],
    minimumSafetyScore: number,
    maxDetourPercentage: number
  ): OptimizedRoute | null {
    if (alternativeRoutes.length === 0) {
      return null;
    }
    
    // Filter routes that meet minimum safety score
    const safeRoutes = alternativeRoutes.filter(
      route => route.overallSafetyScore >= minimumSafetyScore
    );
    
    if (safeRoutes.length === 0) {
      // If no routes meet minimum safety score, return the safest one
      return alternativeRoutes.sort(
        (a, b) => b.overallSafetyScore - a.overallSafetyScore
      )[0];
    }
    
    // Among safe routes, prefer the one with the shortest distance
    return safeRoutes.sort((a, b) => a.distance - b.distance)[0];
  }

  /**
   * Calculate direct distance between two points using Haversine formula
   */
  private calculateDirectDistance(point1: LocationData, point2: LocationData): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(point1.latitude)) * Math.cos(this.deg2rad(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Estimate duration based on transport mode and distance
   */
  private estimateDuration(
    origin: LocationData,
    destination: LocationData,
    transportMode: string,
    distance?: number
  ): number {
    // Calculate distance if not provided
    const routeDistance = distance || this.calculateDirectDistance(origin, destination);
    
    // Estimate speed based on transport mode (km/h)
    let speed = 5; // Default walking speed
    
    switch (transportMode) {
      case 'walking':
        speed = 5; // 5 km/h
        break;
      case 'cycling':
        speed = 15; // 15 km/h
        break;
      case 'driving':
        speed = 40; // 40 km/h (urban average)
        break;
      case 'public_transport':
        speed = 25; // 25 km/h (urban average)
        break;
    }
    
    // Calculate duration in minutes
    return (routeDistance / speed) * 60;
  }

  /**
   * Find the nearest route point to a given location
   */
  private findNearestRoutePoint(location: LocationData, routePoints: RoutePoint[]): RoutePoint {
    if (routePoints.length === 0) {
      return { ...location };
    }
    
    let nearestPoint = routePoints[0];
    let minDistance = this.calculateDirectDistance(location, nearestPoint);
    
    for (let i = 1; i < routePoints.length; i++) {
      const distance = this.calculateDirectDistance(location, routePoints[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = routePoints[i];
      }
    }
    
    return nearestPoint;
  }

  /**
   * Calculate detour percentage compared to initial route
   */
  private calculateDetourPercentage(
    initialRoute: { distance: number },
    alternativeRoute: { distance: number }
  ): number {
    return ((alternativeRoute.distance - initialRoute.distance) / initialRoute.distance) * 100;
  }

  /**
   * Generate a unique route ID
   */
  private generateRouteId(): string {
    return `route_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  /**
   * Get reason for dangerous segment based on safety score
   */
  private getDangerReason(safetyScore: number): string {
    if (safetyScore < 20) {
      return 'Extremely dangerous area - high crime rate';
    } else if (safetyScore < 30) {
      return 'Very unsafe area - multiple safety concerns';
    } else if (safetyScore < 40) {
      return 'Unsafe area - poor lighting and reported incidents';
    } else {
      return 'Moderately unsafe area';
    }
  }
}

export default RouteOptimizationService;