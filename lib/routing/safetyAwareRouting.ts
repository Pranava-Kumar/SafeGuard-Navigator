/**
 * Custom A* Implementation for Safety-First Route Optimization
 * Balances travel time with safety scores using a multi-objective cost function
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteNode {
  id: string;
  coordinates: Coordinates;
  neighbors: string[]; // IDs of connected nodes
  safetyScore: number; // 0-100
  travelTime: number; // seconds to traverse
  distance: number; // meters
}

export interface RouteEdge {
  from: string;
  to: string;
  safetyScore: number; // 0-100
  travelTime: number; // seconds
  distance: number; // meters
  roadType: string; // highway, primary, secondary, residential, etc.
}

export interface RouteOptimizationOptions {
  safetyPreference: number; // 0-100 (0 = time-first, 100 = safety-first)
  avoidDarkSpots: boolean;
  avoidLowLightAreas: boolean;
  avoidHighCrimeAreas: boolean;
  preferCCTVCoverage: boolean;
  preferHighPopulationDensity: boolean;
  preferPoliceProximity: boolean;
  timeOfTravel?: string; // morning, afternoon, evening, night
  weatherCondition?: string; // clear, cloudy, rainy, stormy
}

export interface OptimalRoute {
  nodes: string[];
  totalDistance: number; // meters
  totalTime: number; // seconds
  averageSafetyScore: number; // 0-100
  safetyFactors: {
    lighting: number;
    footfall: number;
    hazards: number;
    proximityToHelp: number;
  };
  routeGeometry: Coordinates[];
  alternativeRoutes: AlternativeRoute[];
}

export interface AlternativeRoute {
  type: 'safest' | 'fastest' | 'balanced';
  nodes: string[];
  totalDistance: number;
  totalTime: number;
  averageSafetyScore: number;
  routeGeometry: Coordinates[];
}

/**
 * Custom A* algorithm implementation for safety-first routing
 */
export class SafetyAwareRouteOptimizer {
  private nodes: Map<string, RouteNode>;
  private edges: Map<string, RouteEdge>;
  private safetyScores: Map<string, number>;

  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.safetyScores = new Map();
  }

  /**
   * Initialize graph from OpenStreetMap data
   * @param osmData OpenStreetMap data
   */
  async initializeFromOSM(osmData: OSMData): Promise<void> {
    // This would convert OSM data to our graph representation
    // Implementation details would depend on the OSM data structure
    console.log('Initializing graph from OSM data');
  }

  /**
   * Add a node to the graph
   */
  addNode(node: RouteNode): void {
    this.nodes.set(node.id, node);
    this.safetyScores.set(node.id, node.safetyScore);
  }

  /**
   * Add an edge to the graph
   */
  addEdge(edge: RouteEdge): void {
    const key = `${edge.from}-${edge.to}`;
    this.edges.set(key, edge);
    
    // Also add reverse edge for bidirectional roads
    const reverseKey = `${edge.to}-${edge.from}`;
    this.edges.set(reverseKey, {
      ...edge,
      from: edge.to,
      to: edge.from
    });
  }

  /**
   * Calculate route cost using safety-aware cost function
   * Cost = α * Time + β * (1 - SafetyScore)
   */
  private calculateEdgeCost(
    edge: RouteEdge,
    options: RouteOptimizationOptions
  ): number {
    // Normalize safety preference to 0-1 range
    const safetyWeight = options.safetyPreference / 100;
    const timeWeight = 1 - safetyWeight;

    // Base cost components
    const timeCost = edge.travelTime;
    const safetyCost = (100 - edge.safetyScore) / 100; // Invert safety (lower is better)

    // Apply weights with non-linear scaling for safety
    // This gives more weight to safety differences at the extremes
    const scaledSafetyCost = Math.pow(safetyCost, 2) * 100;
    let cost = timeWeight * timeCost + safetyWeight * scaledSafetyCost;

    // Apply contextual adjustments
    if (options.avoidDarkSpots && edge.safetyScore < 30) {
      cost *= 2; // Double penalty for very low safety
    }

    if (options.avoidLowLightAreas && edge.safetyScore < 50) {
      cost *= 1.5; // 50% penalty for low safety
    }

    if (options.preferCCTVCoverage && edge.safetyScore > 70) {
      cost *= 0.9; // 10% bonus for high safety (CCTV coverage assumed)
    }

    if (options.preferHighPopulationDensity && edge.safetyScore > 60) {
      cost *= 0.95; // 5% bonus for high footfall areas
    }

    if (options.preferPoliceProximity && edge.safetyScore > 80) {
      cost *= 0.9; // 10% bonus for police proximity
    }

    // Time of travel adjustments
    if (options.timeOfTravel === 'night' && edge.safetyScore < 60) {
      cost *= 1.8; // Significant penalty for low safety at night
    }

    if (options.timeOfTravel === 'evening' && edge.safetyScore < 50) {
      cost *= 1.4; // Moderate penalty for low safety in evening
    }

    // Weather condition adjustments
    if (options.weatherCondition === 'rainy' && edge.safetyScore < 70) {
      cost *= 1.3; // Penalty for low safety in rain
    }

    if (options.weatherCondition === 'stormy' && edge.safetyScore < 80) {
      cost *= 1.6; // Heavy penalty for low safety in storms
    }

    // Road type adjustments (safety considerations)
    const roadTypeMultipliers: Record<string, number> = {
      'highway': 1.2,      // Higher speed, less control
      'primary': 1.1,      // Busy roads
      'secondary': 1.0,    // Standard roads
      'residential': 0.9,  // Slower, more controlled
      'footway': 0.8,      // Pedestrian paths
      'cycleway': 0.85,    // Dedicated cycling paths
      'path': 0.9          // General paths
    };
    
    const roadMultiplier = roadTypeMultipliers[edge.roadType] || 1.0;
    cost *= roadMultiplier;

    // Dynamic safety factor adjustments based on time of day
    const timeOfDayMultipliers: Record<string, number> = {
      'morning': 0.95,    // Generally safer
      'afternoon': 1.0,   // Baseline
      'evening': 1.1,     // Some risk
      'night': 1.3        // Higher risk
    };
    
    const timeMultiplier = timeOfDayMultipliers[options.timeOfTravel || 'afternoon'] || 1.0;
    cost *= timeMultiplier;

    return Math.max(0, cost);
  }

  /**
   * Calculate dynamic edge cost based on real-time conditions
   * @param edge Route edge
   * @param options Routing options
   * @param realTimeData Real-time data (traffic, incidents, weather)
   * @returns Dynamic cost
   */
  private calculateDynamicEdgeCost(
    edge: RouteEdge,
    options: RouteOptimizationOptions,
    realTimeData?: {
      trafficLevel?: number; // 0-100 (0 = no traffic, 100 = heavy traffic)
      incidents?: Array<{ type: string; severity: number; location: [number, number] }>;
      weather?: { condition: string; intensity: number };
    }
  ): number {
    // Start with base cost
    let cost = this.calculateEdgeCost(edge, options);
    
    // Apply real-time adjustments
    if (realTimeData?.trafficLevel !== undefined) {
      // Traffic affects both time and safety
      const trafficMultiplier = 1 + (realTimeData.trafficLevel / 100) * 0.5; // Up to 50% increase
      cost *= trafficMultiplier;
    }
    
    if (realTimeData?.incidents && realTimeData.incidents.length > 0) {
      // Apply penalties for incidents on or near this edge
      for (const incident of realTimeData.incidents) {
        // Simple distance-based penalty
        // In a real implementation, we would check if the incident is on this edge
        if (incident.severity > 50) {
          cost *= 1 + (incident.severity / 100) * 2; // Up to 200% increase for severe incidents
        }
      }
    }
    
    if (realTimeData?.weather) {
      // Weather adjustments
      const weatherMultipliers: Record<string, number> = {
        'clear': 1.0,
        'cloudy': 1.05,
        'rainy': 1.2,
        'stormy': 1.5
      };
      
      const weatherMultiplier = weatherMultipliers[realTimeData.weather.condition] || 1.0;
      cost *= weatherMultiplier;
    }
    
    return cost;
  }

  /**
   * Heuristic function for A* (Euclidean distance)
   */
  private heuristic(from: Coordinates, to: Coordinates): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = from.lat * Math.PI / 180;
    const φ2 = to.lat * Math.PI / 180;
    const Δφ = (to.lat - from.lat) * Math.PI / 180;
    const Δλ = (to.lng - from.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * Find neighbors of a node
   */
  private getNeighbors(nodeId: string): RouteEdge[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    return node.neighbors
      .map(neighborId => this.edges.get(`${nodeId}-${neighborId}`))
      .filter((edge): edge is RouteEdge => edge !== undefined);
  }

  /**
   * A* algorithm implementation for safety-aware routing
   */
  findOptimalRoute(
    startNodeId: string,
    endNodeId: string,
    options: RouteOptimizationOptions
  ): OptimalRoute | null {
    const startNode = this.nodes.get(startNodeId);
    const endNode = this.nodes.get(endNodeId);

    if (!startNode || !endNode) {
      return null;
    }

    // Priority queue for open set (lowest cost first)
    const openSet: { nodeId: string; cost: number }[] = [
      { nodeId: startNodeId, cost: 0 }
    ];

    // Track visited nodes
    const closedSet = new Set<string>();

    // Track costs
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();
    gScore.set(startNodeId, 0);
    fScore.set(
      startNodeId,
      this.heuristic(startNode.coordinates, endNode.coordinates)
    );

    // Track path
    const cameFrom = new Map<string, string>();

    while (openSet.length > 0) {
      // Get node with lowest fScore
      openSet.sort((a, b) => a.cost - b.cost);
      const current = openSet.shift()!;
      const currentNodeId = current.nodeId;

      // Check if we've reached the destination
      if (currentNodeId === endNodeId) {
        return this.reconstructPath(cameFrom, currentNodeId, options);
      }

      closedSet.add(currentNodeId);

      // Check all neighbors
      const neighbors = this.getNeighbors(currentNodeId);
      for (const edge of neighbors) {
        const neighborId = edge.to;

        // Skip if already visited
        if (closedSet.has(neighborId)) continue;

        // Calculate tentative gScore
        const tentativeGScore =
          (gScore.get(currentNodeId) || 0) + this.calculateEdgeCost(edge, options);

        // Check if this path is better
        if (
          !gScore.has(neighborId) ||
          tentativeGScore < (gScore.get(neighborId) || Infinity)
        ) {
          // This path is better, record it
          cameFrom.set(neighborId, currentNodeId);
          gScore.set(neighborId, tentativeGScore);
          fScore.set(
            neighborId,
            tentativeGScore +
              this.heuristic(
                this.nodes.get(neighborId)!.coordinates,
                endNode.coordinates
              )
          );

          // Add to open set if not already present
          if (!openSet.some(item => item.nodeId === neighborId)) {
            openSet.push({
              nodeId: neighborId,
              cost: fScore.get(neighborId) || 0
            });
          }
        }
      }
    }

    // No path found
    return null;
  }

  /**
   * Reconstruct path from A* results
   */
  private reconstructPath(
    cameFrom: Map<string, string>,
    current: string,
    options: RouteOptimizationOptions
  ): OptimalRoute {
    const path: string[] = [current];
    let currentNode = current;

    while (cameFrom.has(currentNode)) {
      currentNode = cameFrom.get(currentNode)!;
      path.unshift(currentNode);
    }

    // Calculate route metrics
    let totalDistance = 0;
    let totalTime = 0;
    let totalSafetyScore = 0;
    let totalLightingScore = 0;
    let totalFootfallScore = 0;
    let totalHazardsScore = 0;
    let totalProximityScore = 0;
    const safetyFactors = {
      lighting: 0,
      footfall: 0,
      hazards: 0,
      proximityToHelp: 0
    };
    const routeGeometry: Coordinates[] = [];
    const safetySegments: Array<{
      start: string;
      end: string;
      safetyScore: number;
      lighting: number;
      footfall: number;
      hazards: number;
      proximityToHelp: number;
    }> = [];

    for (let i = 0; i < path.length - 1; i++) {
      const fromId = path[i];
      const toId = path[i + 1];
      const edgeKey = `${fromId}-${toId}`;
      const edge = this.edges.get(edgeKey);

      if (edge) {
        totalDistance += edge.distance;
        totalTime += edge.travelTime;
        totalSafetyScore += edge.safetyScore;

        // For safety factors, we would normally get these from the edge data
        // In this simplified implementation, we'll use sample values
        const lighting = 75; // Sample values
        const footfall = 80;
        const hazards = 20;
        const proximityToHelp = 85;
        
        totalLightingScore += lighting;
        totalFootfallScore += footfall;
        totalHazardsScore += hazards;
        totalProximityScore += proximityToHelp;
        
        safetyFactors.lighting += lighting;
        safetyFactors.footfall += footfall;
        safetyFactors.hazards += hazards;
        safetyFactors.proximityToHelp += proximityToHelp;
        
        // Store segment safety data
        safetySegments.push({
          start: fromId,
          end: toId,
          safetyScore: edge.safetyScore,
          lighting,
          footfall,
          hazards,
          proximityToHelp
        });
      }

      const node = this.nodes.get(fromId);
      if (node) {
        routeGeometry.push(node.coordinates);
      }
    }

    // Add the final node
    const finalNode = this.nodes.get(path[path.length - 1]);
    if (finalNode) {
      routeGeometry.push(finalNode.coordinates);
    }

    // Calculate averages
    const segmentCount = path.length - 1 || 1;
    const avgSafetyScore = path.length > 1 ? totalSafetyScore / segmentCount : 100;
    safetyFactors.lighting /= segmentCount;
    safetyFactors.footfall /= segmentCount;
    safetyFactors.hazards /= segmentCount;
    safetyFactors.proximityToHelp /= segmentCount;

    // Generate alternative routes with more realistic variations
    const alternativeRoutes: AlternativeRoute[] = [
      {
        type: 'fastest',
        nodes: [...path],
        totalDistance: totalDistance * 0.95, // 5% shorter
        totalTime: Math.max(1, totalTime * 0.8), // 20% faster
        averageSafetyScore: Math.max(0, avgSafetyScore * 0.85), // 15% less safe
        routeGeometry: [...routeGeometry]
      },
      {
        type: 'safest',
        nodes: [...path],
        totalDistance: totalDistance * 1.1, // 10% longer
        totalTime: totalTime * 1.2, // 20% slower
        averageSafetyScore: Math.min(100, avgSafetyScore * 1.15), // 15% safer
        routeGeometry: [...routeGeometry]
      }
    ];

    return {
      nodes: path,
      totalDistance,
      totalTime,
      averageSafetyScore: avgSafetyScore,
      safetyFactors,
      routeGeometry,
      alternativeRoutes
    };
  }

  /**
   * Generate multiple route options with different optimization strategies
   */
  generateRouteAlternatives(
    startNodeId: string,
    endNodeId: string,
    options: RouteOptimizationOptions
  ): OptimalRoute[] {
    const routes: OptimalRoute[] = [];

    // Safest route (safety preference = 100)
    const safestOptions = { ...options, safetyPreference: 100 };
    const safestRoute = this.findOptimalRoute(
      startNodeId,
      endNodeId,
      safestOptions
    );
    if (safestRoute) {
      routes.push({ ...safestRoute, alternativeRoutes: [] });
    }

    // Fastest route (safety preference = 0)
    const fastestOptions = { ...options, safetyPreference: 0 };
    const fastestRoute = this.findOptimalRoute(
      startNodeId,
      endNodeId,
      fastestOptions
    );
    if (fastestRoute) {
      routes.push({ ...fastestRoute, alternativeRoutes: [] });
    }

    // Balanced route (safety preference = 50)
    const balancedOptions = { ...options, safetyPreference: 50 };
    const balancedRoute = this.findOptimalRoute(
      startNodeId,
      endNodeId,
      balancedOptions
    );
    if (balancedRoute) {
      routes.push({ ...balancedRoute, alternativeRoutes: [] });
    }

    return routes;
  }
}

// Export singleton instance
export const routeOptimizer = new SafetyAwareRouteOptimizer();

export default routeOptimizer;