/**
 * SafeRoute Real-World Data Integration Service
 * 
 * Integrates with multiple real-world data sources:
 * 1. OpenStreetMap (OSM) for POI and infrastructure data
 * 2. Weather APIs (OpenWeatherMap) for environmental conditions  
 * 3. VIIRS Satellite Data simulation for lighting assessment
 * 4. Municipal data sources (simulated)
 */

import { db } from './db';

// Types for external API responses
interface OSMResponse {
  elements: Array<{
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    tags?: Record<string, string>;
  }>;
}

// New interface for POI data
interface POIData {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  phone: string | null;
  website: string | null;
  hours: string | null;
  isEmergencyService: boolean;
  dataSource: string;
  lastUpdated: Date;
  isActive: boolean;
}

interface LightingData {
  latitude: number;
  longitude: number;
  lightType?: string;
  municipalStatus?: string;
  coverage?: number;
  source: string;
  timestamp: Date;
  viirsBrightness?: number;
  crowdsourcedReports?: number;
  averageRating?: number;
}

interface WeatherResponse {
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  visibility: number;
  wind: {
    speed: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
}

interface VIIRSDataPoint {
  lat: number;
  lon: number;
  brightness: number;
  confidence: number;
}

interface WeatherData {
  temperature: number;
  humidity: number;
  visibility: number;
  weatherCondition: string;
  windSpeed: number;
  pressure: number;
  description: string;
  alerts: any[]; // Would be populated from alerts API
  source: string;
  timestamp: Date;
}

interface DarkSpotData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  spotType: string;
  severity: number;
  description: string;
  municipalId: string;
  status: string;
  source: string;
  reportedBy?: string;
  lastVerified?: Date;
}

/**
 * OpenStreetMap Data Integration
 * Fetches POI data, infrastructure, and safety-relevant features
 */
export class OSMDataService {
  private readonly baseUrl = 'https://overpass-api.de/api/interpreter';

  async fetchPOIData(lat: number, lng: number, radius: number = 1000): Promise<POIData[]> {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node[\"amenity\"~\"^(police|hospital|fire_station|bank|restaurant|cafe|school|pharmacy|fuel|atm)$\"]
            (around:${radius},${lat},${lng});
          node[\"shop\"~\"^(supermarket|convenience|mall|department_store)$\"]
            (around:${radius},${lat},${lng});
          node[\"public_transport\"~\"^(station|stop_position|platform)$\"]
            (around:${radius},${lat},${lng});
          node[\"emergency\"~\"^(police|fire_station|hospital|defibrillator)$\"]
            (around:${radius},${lat},${lng});
          node[\"tourism\"~\"^(hotel|information)$\"]
            (around:${radius},${lat},${lng});
        );
        out geom;
      `;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        console.warn('OSM API request failed, using fallback data');
        return this.generateFallbackPOIData(lat, lng, radius);
      }

      const data: OSMResponse = await response.json();
      
      return data.elements.map(element => ({
        id: `osm_${element.id}`,
        name: element.tags?.name || element.tags?.amenity || 'Unknown',
        category: this.mapOSMCategory(element.tags),
        latitude: element.lat || lat,
        longitude: element.lon || lng,
        address: this.formatAddress(element.tags),
        phone: element.tags?.phone || null,
        website: element.tags?.website || null,
        hours: element.tags?.opening_hours || null,
        isEmergencyService: this.isEmergencyService(element.tags),
        dataSource: 'osm',
        lastUpdated: new Date(),
        isActive: true
      }));
    } catch (error) {
      console.error('Error fetching OSM data:', error);
      return this.generateFallbackPOIData(lat, lng, radius);
    }
  }

  private mapOSMCategory(tags: Record<string, string> = {}): string {
    if (tags.amenity) {
      const amenityMap: Record<string, string> = {
        'police': 'police',
        'hospital': 'hospital',
        'fire_station': 'fire_station',
        'bank': 'bank',
        'restaurant': 'restaurant',
        'cafe': 'restaurant',
        'school': 'school',
        'pharmacy': 'pharmacy',
        'fuel': 'fuel',
        'atm': 'bank'
      };
      return amenityMap[tags.amenity] || tags.amenity;
    }
    
    if (tags.shop) {
      return 'shop';
    }
    
    if (tags.public_transport) {
      return 'transport';
    }
    
    if (tags.emergency) {
      return tags.emergency;
    }
    
    if (tags.tourism) {
      return tags.tourism;
    }
    
    return 'other';
  }

  private formatAddress(tags: Record<string, string> = {}): string {
    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    return parts.join(', ') || '';
  }

  private isEmergencyService(tags: Record<string, string> = {}): boolean {
    const emergencyTypes = ['police', 'hospital', 'fire_station', 'defibrillator'];
    return emergencyTypes.includes(tags.amenity) || 
           emergencyTypes.includes(tags.emergency) ||
           tags.emergency === 'yes';
  }

  private estimateFootfall(tags: Record<string, string> = {}): number {
    const footfallMap: Record<string, number> = {
      'police': 50,
      'hospital': 200,
      'fire_station': 30,
      'bank': 150,
      'restaurant': 100,
      'cafe': 80,
      'school': 300,
      'pharmacy': 120,
      'supermarket': 500,
      'mall': 1000,
      'hotel': 100,
      'station': 2000
    };
    
    return footfallMap[tags.amenity || tags.shop || tags.tourism] || 50;
  }

  private generateFallbackPOIData(lat: number, lng: number, radius: number): POIData[] {
    // Generate synthetic POI data for testing when OSM is unavailable
    const fallbackPOIs: POIData[] = [
      {
        id: 'fallback_police_1',
        name: 'Local Police Station',
        category: 'police',
        latitude: lat + 0.002,
        longitude: lng + 0.002,
        address: '',
        phone: null,
        website: null,
        hours: null,
        isEmergencyService: true,
        dataSource: 'fallback',
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'fallback_hospital_1',
        name: 'City Hospital',
        category: 'hospital',
        latitude: lat - 0.003,
        longitude: lng + 0.001,
        address: '',
        phone: null,
        website: null,
        hours: null,
        isEmergencyService: true,
        dataSource: 'fallback',
        lastUpdated: new Date(),
        isActive: true
      },
      {
        id: 'fallback_restaurant_1',
        name: 'Local Restaurant',
        category: 'restaurant',
        latitude: lat + 0.001,
        longitude: lng - 0.001,
        address: '',
        phone: null,
        website: null,
        hours: null,
        isEmergencyService: false,
        dataSource: 'fallback',
        lastUpdated: new Date(),
        isActive: true
      }
    ];

    return fallbackPOIs;
  }

  async fetchLightingInfrastructure(lat: number, lng: number, radius: number = 500): Promise<LightingData[]> {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node[\"highway\"=\"street_lamp\"](around:${radius},${lat},${lng});
          node[\"lighting\"=\"yes\"](around:${radius},${lat},${lng});
          way[\"lit\"=\"yes\"](around:${radius},${lat},${lng});
        );
        out geom;
      `;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        return this.generateFallbackLightingData(lat, lng);
      }

      const data: OSMResponse = await response.json();
      
      return data.elements.map(element => ({
        latitude: element.lat || lat,
        longitude: element.lon || lng,
        lightType: element.tags?.highway === 'street_lamp' ? 'street_light' : 'area_light',
        municipalStatus: 'working', // Assume working unless reported otherwise
        coverage: 20, // Default coverage radius in meters
        source: 'osm',
        timestamp: new Date()
      }));
    } catch (error) {
      console.error('Error fetching lighting infrastructure:', error);
      return this.generateFallbackLightingData(lat, lng);
    }
  }

  private generateFallbackLightingData(lat: number, lng: number): LightingData[] {
    const lights: LightingData[] = [];
    // Generate a grid of street lights around the location
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        lights.push({
          latitude: lat + (i * 0.001),
          longitude: lng + (j * 0.001),
          lightType: 'street_light',
          municipalStatus: Math.random() > 0.1 ? 'working' : 'broken',
          coverage: 15 + Math.random() * 10,
          source: 'fallback',
          timestamp: new Date()
        });
      }
    }
    return lights;
  }
}

/**
 * Weather Data Integration Service
 * Integrates with OpenWeatherMap API for current conditions
 */
export class WeatherDataService {
  private readonly apiKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || '';
  private readonly baseUrl = 'https://api.openweathermap.org/data/2.5';

  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    try {
      // If no API key is provided, use fallback data
      if (!this.apiKey) {
        console.warn('No weather API key provided, using fallback data');
        return this.generateFallbackWeatherData();
      }

      const response = await fetch(
        `${this.baseUrl}/weather?lat=${lat}&lon=${lng}&appid=${this.apiKey}&units=metric`
      );

      if (!response.ok) {
        console.warn('Weather API request failed, using fallback data');
        return this.generateFallbackWeatherData();
      }

      const data: WeatherResponse = await response.json();
      
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        visibility: data.visibility / 1000, // Convert to kilometers
        weatherCondition: data.weather[0].main.toLowerCase(),
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        alerts: [], // Would be populated from alerts API
        source: 'openweather',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return this.generateFallbackWeatherData();
    }
  }

  private generateFallbackWeatherData(): WeatherData {
    return {
      temperature: 25 + Math.random() * 10, // 25-35°C typical for India
      humidity: 60 + Math.random() * 30, // 60-90%
      visibility: 5 + Math.random() * 10, // 5-15 km
      weatherCondition: 'clear',
      windSpeed: Math.random() * 10,
      pressure: 1010 + Math.random() * 20,
      description: 'Clear sky',
      alerts: [],
      source: 'fallback',
      timestamp: new Date()
    };
  }
}

/**
 * VIIRS Satellite Data Service (Simulated)
 * In production, this would integrate with NASA VIIRS Black Marble data
 */
export class VIIRSDataService {
  async getNightLightData(lat: number, lng: number, radius: number = 0.01): Promise<VIIRSDataPoint[]> {
    try {
      // In production, this would call NASA VIIRS API
      // For now, we simulate realistic night light data
      
      return this.simulateVIIRSData(lat, lng, radius);
    } catch (error) {
      console.error('Error fetching VIIRS data:', error);
      return this.simulateVIIRSData(lat, lng, radius);
    }
  }

  private simulateVIIRSData(lat: number, lng: number, radius: number): VIIRSDataPoint[] {
    const points: VIIRSDataPoint[] = [];
    const gridSize = radius / 10; // Create a 10x10 grid

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const pointLat = lat - radius/2 + (i * gridSize);
        const pointLng = lng - radius/2 + (j * gridSize);
        
        // Simulate brightness based on distance from center (urban areas are brighter)
        const distanceFromCenter = Math.sqrt(
          Math.pow(pointLat - lat, 2) + Math.pow(pointLng - lng, 2)
        );
        
        let brightness = Math.max(0, 50 - (distanceFromCenter * 10000));
        
        // Add some randomness to simulate real-world variation
        brightness += (Math.random() - 0.5) * 20;
        brightness = Math.max(0, Math.min(100, brightness));
        
        points.push({
          lat: pointLat,
          lon: pointLng,
          brightness: brightness,
          confidence: 0.8 + Math.random() * 0.2 // 0.8-1.0 confidence
        });
      }
    }

    return points;
  }
}

/**
 * Municipal Data Service (Simulated)
 * In production, this would integrate with city/municipal APIs
 */
export class MunicipalDataService {
  async getDarkSpotData(city: string, state: string = 'Tamil Nadu'): Promise<DarkSpotData[]> {
    try {
      // Simulate official dark spot data
      return this.generateDarkSpotData(city, state);
    } catch (error) {
      console.error('Error fetching municipal data:', error);
      return [];
    }
  }

  private generateDarkSpotData(city: string, state: string): DarkSpotData[] {
    // Simulate realistic dark spot data based on Chennai's known issues
    const darkSpots: DarkSpotData[] = [
      {
        latitude: 13.0827 + Math.random() * 0.01,
        longitude: 80.2707 + Math.random() * 0.01,
        city,
        state,
        spotType: 'official',
        severity: 3,
        description: 'Inadequate street lighting on main road',
        municipalId: 'DS001',
        status: 'active',
        source: 'municipal'
      },
      {
        latitude: 13.0878 + Math.random() * 0.01,
        longitude: 80.2785 + Math.random() * 0.01,
        city,
        state,
        spotType: 'official', 
        severity: 4,
        description: 'Multiple broken street lights in residential area',
        municipalId: 'DS002',
        status: 'under_repair',
        source: 'municipal'
      },
      {
        latitude: 13.0658 + Math.random() * 0.01,
        longitude: 80.2492 + Math.random() * 0.01,
        city,
        state,
        spotType: 'crowdsourced',
        severity: 2,
        description: 'Dim lighting near bus stop',
        status: 'active',
        source: 'crowdsourced',
        municipalId: 'DS003'
      }
    ];

    return darkSpots.map(spot => ({
      ...spot,
      reportedBy: spot.spotType === 'official' ? 'Municipal Corporation' : 'Community Report',
      lastVerified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }));
  }
}

/**
 * Main Data Integration Orchestrator
 * Coordinates all data sources and updates the database
 */
export class DataIntegrationService {
  private osm: OSMDataService;
  private weather: WeatherDataService;
  private viirs: VIIRSDataService;
  private municipal: MunicipalDataService;

  constructor() {
    this.osm = new OSMDataService();
    this.weather = new WeatherDataService();
    this.viirs = new VIIRSDataService();
    this.municipal = new MunicipalDataService();
  }

  /**
   * Comprehensive data refresh for a given location
   */
  async refreshLocationData(lat: number, lng: number, city: string = 'Chennai'): Promise<void> {
    try {
      console.log(`Refreshing data for location: ${lat}, ${lng}`);

      // Fetch all data sources in parallel
      const [poiData, lightingData, weatherData, viiirsData, darkSpotData] = await Promise.all([
        this.osm.fetchPOIData(lat, lng),
        this.osm.fetchLightingInfrastructure(lat, lng),
        this.weather.getCurrentWeather(lat, lng),
        this.viirs.getNightLightData(lat, lng),
        this.municipal.getDarkSpotData(city)
      ]);

      // Update POI data
      await this.updatePOIData(poiData);
      
      // Update lighting data
      await this.updateLightingData(lightingData, viiirsData);
      
      // Update weather data
      await this.updateWeatherData(weatherData, city);
      
      // Update dark spot data
      await this.updateDarkSpotData(darkSpotData);

      console.log('Data refresh completed successfully');
    } catch (error) {
      console.error('Error during data refresh:', error);
      throw error;
    }
  }

  private async updatePOIData(poiData: POIData[]): Promise<void> {
    for (const poi of poiData) {
      await db.pOIData.upsert({
        where: { id: poi.id },
        update: {
          name: poi.name,
          category: poi.category,
          phone: poi.phone,
          website: poi.website,
          hours: poi.hours,
          lastUpdated: poi.lastUpdated,
          isActive: poi.isActive
        },
        create: poi
      });
    }
  }

  private async updateLightingData(lightingData: LightingData[], viiirsData: VIIRSDataPoint[]): Promise<void> {
    // Update infrastructure lighting
    for (const light of lightingData) {
      // Since there's no dedicated LightingData model, we'll store this in SafetyScore
      await db.safetyScore.create({
        data: {
          latitude: light.latitude,
          longitude: light.longitude,
          overallScore: 50, // Placeholder score
          lightingData: JSON.stringify({
            lightType: light.lightType,
            municipalStatus: light.municipalStatus,
            coverage: light.coverage,
          }),
          sources: light.source,
          timestamp: light.timestamp,
          lastUpdated: new Date()
        }
      });
    }

    // Update VIIRS satellite data
    for (const viirs of viiirsData) {
      await db.safetyScore.create({
        data: {
          latitude: viirs.lat,
          longitude: viirs.lon,
          overallScore: Math.round(viirs.brightness), // Use brightness as overall score
          lightingData: JSON.stringify({
            viirsBrightness: viirs.brightness,
          }),
          sources: 'viirs',
          timestamp: new Date(),
          lastUpdated: new Date()
        }
      });
    }
  }

  private async updateWeatherData(weatherData: WeatherData, area: string): Promise<void> {
    // Since there's no dedicated WeatherData model, we'll store this in SafetyScore
    await db.safetyScore.create({
      data: {
        latitude: 0, // Placeholder - would need actual coordinates
        longitude: 0, // Placeholder - would need actual coordinates
        overallScore: Math.round(100 - weatherData.visibility * 2), // Inverse of visibility
        lightingScore: Math.round(weatherData.visibility * 10), // Use visibility as a proxy
        hazardScore: weatherData.weatherCondition.includes('rain') ? 30 : 10, // Simple proxy
        sources: weatherData.source,
        factors: JSON.stringify({
          temperature: weatherData.temperature,
          humidity: weatherData.humidity,
          visibility: weatherData.visibility,
          weatherCondition: weatherData.weatherCondition,
          windSpeed: weatherData.windSpeed,
          pressure: weatherData.pressure,
        }),
        timestamp: weatherData.timestamp,
        lastUpdated: new Date()
      }
    });
  }

  private async updateDarkSpotData(darkSpotData: DarkSpotData[]): Promise<void> {
    for (const spot of darkSpotData) {
      // Since there's no dedicated DarkSpotData model, we'll store this in SafetyScore
      await db.safetyScore.create({
        data: {
          latitude: spot.latitude,
          longitude: spot.longitude,
          overallScore: 100 - (spot.severity * 20), // Inverse of severity (1-5 mapped to 80-0)
          hazardScore: spot.severity * 20, // Map severity 1-5 to 20-100
          sources: spot.source,
          factors: JSON.stringify({
            spotType: spot.spotType,
            description: spot.description,
            status: spot.status,
            reportedBy: spot.reportedBy,
          }),
          timestamp: spot.lastVerified || new Date(),
          lastUpdated: new Date()
        }
      });
    }
  }

  /**
   * Schedule regular data updates
   */
  startPeriodicUpdates(): void {
    // Update Chennai city center data every 6 hours
    setInterval(async () => {
      const chennaLocations = [
        { lat: 13.0827, lng: 80.2707, city: 'Chennai' }, // City Center
        { lat: 13.0878, lng: 80.2785, city: 'Chennai' }, // T Nagar
        { lat: 13.0067, lng: 80.2206, city: 'Chennai' }, // Adyar
      ];

      for (const location of chennaLocations) {
        try {
          await this.refreshLocationData(location.lat, location.lng, location.city);
          // Add delay to avoid overwhelming APIs
          await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
          console.error(`Failed to update data for ${location.city}:`, error);
        }
      }
    }, 6 * 60 * 60 * 1000); // 6 hours

    console.log('Periodic data updates started');
  }
}

// Export singleton instance
export const dataIntegration = new DataIntegrationService();