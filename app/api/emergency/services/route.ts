/**
 * Emergency Services API Routes
 * Provides endpoints for fetching nearby emergency services
 * Compliant with DPDP Act 2023
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db as prisma } from '@/lib/db';
import { authMiddleware } from '@/lib/auth/authMiddleware';
import { ratelimit } from '@/lib/ratelimit';
import { calculateDistance } from '@/lib/utils';

// Rate limiter for emergency services API
const limiter = ratelimit;

// Schema for nearby services query
const NearbyServicesSchema = z.object({
  lat: z.coerce.number()
    .min(-90).max(90)
    .describe('Latitude of the location'),
  lng: z.coerce.number()
    .min(-180).max(180)
    .describe('Longitude of the location'),
  radius: z.coerce.number()
    .min(0.1).max(50)
    .default(5)
    .describe('Search radius in kilometers'),
  type: z.enum(['all', 'hospital', 'police', 'fire', 'ambulance', 'roadside', 'women_helpline', 'disaster', 'other'])
    .optional()
    .default('all')
    .describe('Type of emergency service'),
  limit: z.coerce.number()
    .min(1).max(50)
    .default(20)
    .describe('Maximum number of results to return'),
});

// Schema for favorite service toggle
const FavoriteServiceSchema = z.object({
  isFavorite: z.boolean()
    .describe('Whether the service is marked as favorite'),
});

/**
 * GET /api/emergency/services
 * Fetch nearby emergency services based on location and radius
 */
export async function GET(req: NextRequest) {
  try {
    // Apply rate limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitResult = await limiter.limit(`services_${ip}`, 20, 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const queryParams = {
      lat: url.searchParams.get('lat'),
      lng: url.searchParams.get('lng'),
      radius: url.searchParams.get('radius'),
      type: url.searchParams.get('type'),
      limit: url.searchParams.get('limit'),
    };

    // Validate query parameters
    const validationResult = NearbyServicesSchema.safeParse({
      lat: queryParams.lat,
      lng: queryParams.lng,
      radius: queryParams.radius,
      type: queryParams.type,
      limit: queryParams.limit,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { lat, lng, radius, type, limit } = validationResult.data;

    // Get user from auth middleware (optional, for favorites)
    let userId: string | null = null;
    try {
      const authResponse = await authMiddleware(req, async (authenticatedReq) => {
        return NextResponse.json({ userId: authenticatedReq.user?.userId });
      });
      
      if (authResponse.status !== 401) {
        const authData = await authResponse.json();
        userId = authData.userId;
      }
    } catch (authError) {
      // User is not authenticated, which is fine for this endpoint
      userId = null;
    }

    // Query database for emergency services (using POIData)
    let services = await prisma.pOIData.findMany({
      where: {
        isEmergencyService: true,
        ...(type !== 'all' ? { category: type } : {}),
      },
      take: limit,
    });

    // Calculate distance for each service and filter by radius
    services = services
      .map((service: any) => {
        const distance = calculateDistance(
          lat,
          lng,
          service.latitude,
          service.longitude
        );

        return {
          ...service,
          distance,
          isFavorite: false, // Placeholder since we don't have favorites model
        };
      })
      .filter((service: any) => service.distance <= radius)
      .sort((a: any, b: any) => a.distance - b.distance);

    // Format response
    const formattedServices = services.map((service: any) => ({
      id: service.id,
      name: service.name,
      type: service.category,
      phone: service.phone,
      address: service.address,
      location: {
        latitude: service.latitude,
        longitude: service.longitude,
      },
      distance: service.distance,
      operatingHours: service.businessHours,
      website: service.website,
      services: [], // Placeholder
      rating: service.safetyRating,
      isFavorite: service.isFavorite,
    }));

    return NextResponse.json({ services: formattedServices });
  } catch (error) {
    console.error('Error fetching emergency services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emergency services' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/emergency/services
 * Add a new emergency service (admin only)
 */
export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitResult = await limiter.limit(`add_service_${ip}`, 10, 60 * 1000);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Authenticate user
    const authResponse = await authMiddleware(req, async (authenticatedReq) => {
      return NextResponse.json({ userId: authenticatedReq.user?.userId });
    });
    
    if (authResponse.status === 401) {
      return authResponse;
    }
    
    const authData = await authResponse.json();
    const requestUserId = authData.userId;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: requestUserId },
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden. Admin access required.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Create new service (in POIData table)
    const newService = await prisma.pOIData.create({
      data: {
        ...body,
        isEmergencyService: true,
      },
    });

    return NextResponse.json({ service: newService }, { status: 201 });
  } catch (error) {
    console.error('Error adding emergency service:', error);
    return NextResponse.json(
      { error: 'Failed to add emergency service' },
      { status: 500 }
    );
  }
}