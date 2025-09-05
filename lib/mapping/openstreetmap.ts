/**
 * OpenStreetMap Integration Service
 * Free and open-source alternative to commercial mapping services
 * Implements geocoding, reverse geocoding, and routing using OSM data
 */

export interface OSMAddress {
  houseNumber?: string;
  road?: string;
  neighborhood?: string;
  suburb?: string;
  city: string;
  county?: string;
  state: string;
  postcode?: string;
  country: string;
  countryCode: string;
}

export interface OSMCoordinates {
  lat: number;
  lng: number;
}

export interface OSMPlace {
  placeId: string;
  osmId: string;
  osmType: 'node' | 'way' | 'relation';
  name: string;
  address: OSMAddress;
  coordinates: OSMCoordinates;
  boundingBox?: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  importance: number; // 0-1 relevance score
  type: string; // amenity, building, highway, etc.
  category: string; // restaurant, school, hospital, etc.
}

export interface OSMGeocodeRequest {
  query: string;
  limit?: number;
  countryCodes?: string[];
  bounded?: boolean;
  viewbox?: [number, number, number, number];
}

export interface OSMReverseGeocodeRequest {
  lat: number;
  lng: number;
  radius?: number; // meters
  zoom?: number; // 0-18 (higher = more detailed)
}

export interface OSMRouteRequest {
  coordinates: [number, number][]; // [[lat, lng], [lat, lng], ...]
  profile?: 'driving' | 'cycling' | 'walking' | 'foot';
  alternatives?: boolean;
  steps?: boolean;
  annotations?: ('duration' | 'distance' | 'speed' | 'congestion')[];
  geometries?: 'geojson' | 'polyline' | 'polyline6';
  overview?: 'simplified' | 'full' | 'false';
}

export interface OSMRoute {
  geometry: [number, number][] | string; // Coordinates or encoded polyline
  distance: number; // meters
  duration: number; // seconds
  legs: OSMRouteLeg[];
  weight: number;
  weight_name: string;
}

export interface OSMRouteLeg {
  distance: number; // meters
  duration: number; // seconds
  steps: OSMRouteStep[];
  summary: string;
}

export interface OSMRouteStep {
  distance: number; // meters
  duration: number; // seconds
  geometry: [number, number][] | string;
  name: string;
  mode: string;
  maneuver: OSMManeuver;
  intersections?: OSMIntersection[];
}

export interface OSMManeuver {
  location: [number, number]; // [lng, lat]
  bearing_before: number;
  bearing_after: number;
  type: string;
  modifier?: string;
  instruction: string;
}

export interface OSMIntersection {
  location: [number, number]; // [lng, lat]
  bearings: number[];
  entry: boolean[];
  in?: number;
  out?: number;
}

export interface OSMResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * Geocode an address using OpenStreetMap Nominatim
 * @param request Geocoding request parameters
 * @returns Promise with geocoded places or error
 */
export async function geocodeAddress(
  request: OSMGeocodeRequest
): Promise<OSMResponse<OSMPlace[]>> {
  try {
    // Validate request
    if (!request.query || request.query.trim().length === 0) {
      return {
        success: false,
        error: 'Query parameter is required'
      };
    }

    // Prepare URL parameters
    const params = new URLSearchParams({
      q: request.query,
      format: 'json',
      limit: (request.limit || 10).toString(),
      addressdetails: '1',
      namedetails: '1'
    });

    // Add country codes if specified
    if (request.countryCodes && request.countryCodes.length > 0) {
      params.append('countrycodes', request.countryCodes.join(','));
    }

    // Add viewbox if specified
    if (request.viewbox) {
      params.append(
        'viewbox',
        `${request.viewbox[0]},${request.viewbox[1]},${request.viewbox[2]},${request.viewbox[3]}`
      );
      if (request.bounded) {
        params.append('bounded', '1');
      }
    }

    // Make request to Nominatim API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'SafeRoute/1.0 (https://safeguardnavigators.vercel.app)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();

    // Transform Nominatim results to OSMPlace objects
    const places: OSMPlace[] = results.map((result: any) => ({
      placeId: result.place_id,
      osmId: result.osm_id,
      osmType: result.osm_type,
      name: result.namedetails?.name || result.display_name.split(',')[0],
      address: parseOSMAddress(result.address),
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      },
      boundingBox: result.boundingbox
        ? [
            parseFloat(result.boundingbox[2]), // minLng
            parseFloat(result.boundingbox[0]), // minLat
            parseFloat(result.boundingbox[3]), // maxLng
            parseFloat(result.boundingbox[1]) // maxLat
          ]
        : undefined,
      importance: result.importance || 0.5,
      type: result.type,
      category: result.category || result.class
    }));

    return {
      success: true,
      data: places
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return {
      success: false,
      error: 'Failed to geocode address'
    };
  }
}

/**
 * Parse Nominatim address object into OSMAddress
 * @param address Nominatim address object
 * @returns Parsed OSMAddress
 */
function parseOSMAddress(address: any): OSMAddress {
  return {
    houseNumber: address.house_number,
    road: address.road || address.pedestrian || address.footway,
    neighborhood: address.neighbourhood || address.suburb,
    suburb: address.suburb,
    city: address.city || address.town || address.village,
    county: address.county,
    state: address.state,
    postcode: address.postcode,
    country: address.country,
    countryCode: address.country_code?.toUpperCase()
  };
}

/**
 * Reverse geocode coordinates to get address information
 * @param request Reverse geocoding request parameters
 * @returns Promise with place information or error
 */
export async function reverseGeocode(
  request: OSMReverseGeocodeRequest
): Promise<OSMResponse<OSMPlace>> {
  try {
    // Validate coordinates
    if (
      request.lat < -90 ||
      request.lat > 90 ||
      request.lng < -180 ||
      request.lng > 180
    ) {
      return {
        success: false,
        error: 'Invalid coordinates'
      };
    }

    // Prepare URL parameters
    const params = new URLSearchParams({
      lat: request.lat.toString(),
      lon: request.lng.toString(),
      format: 'json',
      addressdetails: '1',
      namedetails: '1',
      zoom: (request.zoom || 18).toString()
    });

    // Add radius if specified
    if (request.radius) {
      params.append('radius', request.radius.toString());
    }

    // Make request to Nominatim API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: {
          'User-Agent': 'SafeRoute/1.0 (https://safeguardnavigators.vercel.app)'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Check if result contains address information
    if (!result || !result.address) {
      return {
        success: false,
        error: 'No address found for the given coordinates'
      };
    }

    // Transform result to OSMPlace object
    const place: OSMPlace = {
      placeId: result.place_id,
      osmId: result.osm_id,
      osmType: result.osm_type,
      name: result.namedetails?.name || result.display_name.split(',')[0],
      address: parseOSMAddress(result.address),
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      },
      boundingBox: result.boundingbox
        ? [
            parseFloat(result.boundingbox[2]), // minLng
            parseFloat(result.boundingbox[0]), // minLat
            parseFloat(result.boundingbox[3]), // maxLng
            parseFloat(result.boundingbox[1]) // maxLat
          ]
        : undefined,
      importance: result.importance || 0.5,
      type: result.type,
      category: result.category || result.class
    };

    return {
      success: true,
      data: place
    };
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return {
      success: false,
      error: 'Failed to reverse geocode coordinates'
    };
  }
}

/**
 * Calculate route using OpenStreetMap OSRM
 * @param request Route calculation request
 * @returns Promise with route information or error
 */
export async function calculateRoute(
  request: OSMRouteRequest
): Promise<OSMResponse<OSMRoute>> {
  try {
    // Validate request
    if (!request.coordinates || request.coordinates.length < 2) {
      return {
        success: false,
        error: 'At least two coordinates are required for routing'
      };
    }

    // Validate coordinates
    for (const [lat, lng] of request.coordinates) {
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return {
          success: false,
          error: 'Invalid coordinates in route'
        };
      }
    }

    // Prepare coordinates for OSRM
    const coords = request.coordinates
      .map(([lat, lng]) => `${lng},${lat}`)
      .join(';');

    // Prepare URL parameters
    const params = new URLSearchParams({
      alternatives: request.alternatives ? 'true' : 'false',
      steps: request.steps ? 'true' : 'false',
      geometries: request.geometries || 'geojson',
      overview: request.overview || 'full'
    });

    // Add annotations if specified
    if (request.annotations && request.annotations.length > 0) {
      params.append('annotations', request.annotations.join(','));
    }

    // Determine profile
    const profile = request.profile || 'foot';

    // Make request to OSRM API
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/${profile}/${coords}?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Check if route was found
    if (result.code !== 'Ok' || !result.routes || result.routes.length === 0) {
      return {
        success: false,
        error: 'No route found between specified points'
      };
    }

    // Transform result to OSMRoute object
    // For simplicity, we'll return the first route
    const route = result.routes[0];

    const osmRoute: OSMRoute = {
      geometry: route.geometry.coordinates
        ? route.geometry.coordinates.map((coord: [number, number]) => [
            coord[1],
            coord[0]
          ])
        : route.geometry,
      distance: route.distance,
      duration: route.duration,
      legs: route.legs.map((leg: any) => ({
        distance: leg.distance,
        duration: leg.duration,
        steps: leg.steps?.map((step: any) => ({
          distance: step.distance,
          duration: step.duration,
          geometry: step.geometry.coordinates
            ? step.geometry.coordinates.map((coord: [number, number]) => [
                coord[1],
                coord[0]
              ])
            : step.geometry,
          name: step.name,
          mode: step.mode,
          maneuver: {
            location: [step.maneuver.location[1], step.maneuver.location[0]],
            bearing_before: step.maneuver.bearing_before,
            bearing_after: step.maneuver.bearing_after,
            type: step.maneuver.type,
            modifier: step.maneuver.modifier,
            instruction: step.maneuver.instruction
          },
          intersections: step.intersections?.map((intersection: any) => ({
            location: [
              intersection.location[1],
              intersection.location[0]
            ],
            bearings: intersection.bearings,
            entry: intersection.entry,
            in: intersection.in,
            out: intersection.out
          }))
        })) || [],
        summary: leg.summary
      })),
      weight: route.weight,
      weight_name: route.weight_name
    };

    return {
      success: true,
      data: osmRoute
    };
  } catch (error) {
    console.error('Error calculating route:', error);
    return {
      success: false,
      error: 'Failed to calculate route'
    };
  }
}

/**
 * Get nearby places of interest using Overpass API
 * @param coordinates Center coordinates [lat, lng]
 * @param radius Search radius in meters
 * @param types Place types to search for
 * @returns Promise with nearby places or error
 */
export async function getNearbyPlaces(
  coordinates: [number, number],
  radius: number = 1000,
  types: string[] = ['amenity', 'shop', 'leisure']
): Promise<OSMResponse<OSMPlace[]>> {
  try {
    const [lat, lng] = coordinates;

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return {
        success: false,
        error: 'Invalid coordinates'
      };
    }

    // Validate radius
    if (radius <= 0 || radius > 10000) {
      return {
        success: false,
        error: 'Radius must be between 1 and 10000 meters'
      };
    }

    // Build Overpass QL query
    let query = `[out:json][timeout:25];
`;
    query += `(
`;

    for (const type of types) {
      query += `  node[${type}](around:${radius},${lat},${lng});
`;
      query += `  way[${type}](around:${radius},${lat},${lng});
`;
      query += `  relation[${type}](around:${radius},${lat},${lng});
`;
    }

    query += `);
`;
    query += `out body;
`;
    query += `>;
`;
    query += `out skel qt;`;

    // Make request to Overpass API
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Transform Overpass results to OSMPlace objects
    const places: OSMPlace[] = (result.elements || [])
      .filter((element: any) => element.tags)
      .map((element: any) => {
        const coordinates =
          element.type === 'node'
            ? { lat: element.lat, lng: element.lon }
            : element.center
            ? { lat: element.center.lat, lng: element.center.lon }
            : { lat: 0, lng: 0 };

        return {
          placeId: `${element.type}-${element.id}`,
          osmId: element.id,
          osmType: element.type,
          name: element.tags.name || element.tags['addr:housename'] || 'Unnamed',
          address: {
            houseNumber: element.tags['addr:housenumber'],
            road: element.tags['addr:street'],
            city: element.tags['addr:city'],
            state: element.tags['addr:state'],
            postcode: element.tags['addr:postcode'],
            country: element.tags['addr:country'],
            countryCode: element.tags['addr:country']?.toUpperCase()
          },
          coordinates,
          importance: 0.5, // Default importance
          type: Object.keys(element.tags).find(
            (key) =>
              key.startsWith('amenity:') ||
              key.startsWith('shop:') ||
              key.startsWith('leisure:')
          ),
          category: element.tags.amenity || element.tags.shop || element.tags.leisure
        };
      });

    return {
      success: true,
      data: places
    };
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    return {
      success: false,
      error: 'Failed to fetch nearby places'
    };
  }
}

/**
 * Get safety-relevant infrastructure using Overpass API
 * @param coordinates Center coordinates [lat, lng]
 * @param radius Search radius in meters
 * @returns Promise with safety infrastructure or error
 */
export async function getSafetyInfrastructure(
  coordinates: [number, number],
  radius: number = 1000
): Promise<
  OSMResponse<{
    policeStations: OSMPlace[];
    hospitals: OSMPlace[];
    fireStations: OSMPlace[];
    streetLights: OSMPlace[];
    cctvCameras: OSMPlace[];
  }>
> {
  try {
    const [lat, lng] = coordinates;

    // Validate coordinates
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return {
        success: false,
        error: 'Invalid coordinates'
      };
    }

    // Validate radius
    if (radius <= 0 || radius > 5000) {
      return {
        success: false,
        error: 'Radius must be between 1 and 5000 meters'
      };
    }

    // Build Overpass QL queries for different safety infrastructure
    const queries = {
      police: `[out:json][timeout:25];
        (
          node[amenity=police](around:${radius},${lat},${lng});
          way[amenity=police](around:${radius},${lat},${lng});
          relation[amenity=police](around:${radius},${lat},${lng});
        );
        out body;
        >;
        out skel qt;`,
      hospitals: `[out:json][timeout:25];
        (
          node[amenity=hospital](around:${radius},${lat},${lng});
          way[amenity=hospital](around:${radius},${lat},${lng});
          relation[amenity=hospital](around:${radius},${lat},${lng});
          node[amenity=clinic](around:${radius},${lat},${lng});
          way[amenity=clinic](around:${radius},${lat},${lng});
          relation[amenity=clinic](around:${radius},${lat},${lng});
        );
        out body;
        >;
        out skel qt;`,
      fire: `[out:json][timeout:25];
        (
          node[amenity=fire_station](around:${radius},${lat},${lng});
          way[amenity=fire_station](around:${radius},${lat},${lng});
          relation[amenity=fire_station](around:${radius},${lat},${lng});
        );
        out body;
        >;
        out skel qt;`,
      lights: `[out:json][timeout:25];
        (
          node[highway=street_lamp](around:${radius},${lat},${lng});
          way[highway=street_lamp](around:${radius},${lat},${lng});
        );
        out body;
        >;
        out skel qt;`,
      cctv: `[out:json][timeout:25];
        (
          node[man_made=monitoring_station](around:${radius},${lat},${lng});
          node[surveillance:type=camera](around:${radius},${lat},${lng});
        );
        out body;
        >;
        out skel qt;`
    };

    // Execute all queries concurrently with proper error handling
    const fetchQuery = async (query: string) => {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
      });
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Handle non-JSON responses (likely error messages)
        const text = await response.text();
        console.error('Non-JSON response from Overpass API:', text);
        return { elements: [] }; // Return empty elements array to prevent errors
      }
    };

    const results = await Promise.all([
      fetchQuery(queries.police),
      fetchQuery(queries.hospitals),
      fetchQuery(queries.fire),
      fetchQuery(queries.lights),
      fetchQuery(queries.cctv)
    ]);

    // Transform results to OSMPlace objects
    const transformElements = (elements: any[]): OSMPlace[] =>
      elements
        .filter((element: any) => element.tags)
        .map((element: any) => {
          const coordinates =
            element.type === 'node'
              ? { lat: element.lat, lng: element.lon }
              : element.center
              ? { lat: element.center.lat, lng: element.center.lon }
              : { lat: 0, lng: 0 };

          return {
            placeId: `${element.type}-${element.id}`,
            osmId: element.id,
            osmType: element.type,
            name:
              element.tags.name ||
              element.tags['addr:housename'] ||
              element.tags.amenity ||
              element.tags.man_made ||
              element.tags.highway ||
              'Unnamed',
            address: {
              houseNumber: element.tags['addr:housenumber'],
              road: element.tags['addr:street'],
              city: element.tags['addr:city'],
              state: element.tags['addr:state'],
              postcode: element.tags['addr:postcode'],
              country: element.tags['addr:country'],
              countryCode: element.tags['addr:country']?.toUpperCase()
            },
            coordinates,
            importance: 0.7, // Higher importance for safety infrastructure
            type: element.tags.amenity || element.tags.man_made || element.tags.highway,
            category:
              element.tags.amenity ||
              element.tags.man_made ||
              element.tags.highway ||
              'safety_infrastructure'
          };
        });

    const [policeData, hospitalData, fireData, lightData, cctvData] = results;

    return {
      success: true,
      data: {
        policeStations: transformElements(policeData.elements || []),
        hospitals: transformElements(hospitalData.elements || []),
        fireStations: transformElements(fireData.elements || []),
        streetLights: transformElements(lightData.elements || []).slice(0, 100), // Limit to 100
        cctvCameras: transformElements(cctvData.elements || []).slice(0, 100) // Limit to 100
      }
    };
  } catch (error) {
    console.error('Error fetching safety infrastructure:', error);
    return {
      success: false,
      error: 'Failed to fetch safety infrastructure data'
    };
  }
}

export default {
  geocodeAddress,
  reverseGeocode,
  calculateRoute,
  getNearbyPlaces,
  getSafetyInfrastructure
};