# SafeRoute Backend - Services Setup Guide

This document provides instructions to fix the OSRM routing and geocoding API issues.

## Issues Identified

1. **OSRM Routing Issue**: Connection refused error when trying to connect to OSRM at localhost:5000
2. **Geocoding API Issue**: Internal server errors for geocoding endpoints

## Solutions

### 1. OSRM Routing Fix

The OSRM service needs to be running for routing to work. You have two options:

#### Option A: Install Docker and Use Docker Compose (Recommended)

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. After installation, restart your computer
3. From the project root directory, run:
   ```bash
   docker-compose up -d
   ```
   This will start all services including:
   - PostgreSQL with PostGIS on port 5432
   - Redis on port 6379
   - OSRM preprocessing and routing service on port 5000
   - Backend API on port 8000
   - Frontend on port 3000

#### Option B: Manual Installation (Advanced)

1. Download and install OSRM from: https://github.com/Project-OSRM/osrm-backend
2. Process the Chennai OSM data:
   ```bash
   osrm-extract -p profiles/foot.lua backend/chennai.osm.pbf
   osrm-contract backend/chennai.osrm
   ```
3. Start the OSRM server:
   ```bash
   osrm-routed --algorithm mld backend/chennai.osrm
   ```

### 2. Geocoding API Fix

The geocoding service uses OpenStreetMap Nominatim which is a free service. The issues might be due to:

1. **Network Connectivity**: Ensure you have internet access
2. **Rate Limiting**: Nominatim has rate limits for free usage
3. **User-Agent**: The service sets a proper User-Agent header

If you're still experiencing issues with geocoding, you can:

1. Check your internet connection
2. Wait a few minutes and try again (rate limiting)
3. Use a different geocoding service by modifying `backend/app/services/geocoding_service.py`

### 3. Updated Environment Configuration

I've updated your `.env` file to properly configure the OSRM service. The changes include:
- Setting `OSRM_HOST` to `http://localhost:5000` (with protocol)
- Setting `USE_LOCAL_OSRM=true` to enable local OSRM usage

### 4. Starting the Services

After installing Docker:

1. Start all services:
   ```bash
   docker-compose up -d
   ```

2. Check if services are running:
   ```bash
   docker-compose ps
   ```

3. View logs for troubleshooting:
   ```bash
   docker-compose logs osrm
   docker-compose logs backend
   ```

### 5. Testing the Services

1. Test OSRM service:
   ```
   curl http://localhost:5000/health
   ```

2. Test backend API:
   ```
   curl http://localhost:8000/api/v1/routes/calculate
   ```

## Troubleshooting

### If you see "Connection refused" errors:

1. Ensure Docker is running
2. Check if the OSRM container is running:
   ```bash
   docker ps | grep osrm
   ```

3. Check OSRM logs:
   ```bash
   docker-compose logs osrm
   ```

### If geocoding fails:

1. Test direct Nominatim access:
   ```bash
   curl "https://nominatim.openstreetmap.org/search?q=Chennai&format=json"
   ```

2. Check if you're being rate-limited (HTTP 429)
3. Verify your network connection

## Alternative Setup Without Docker

If you cannot use Docker, you'll need to:

1. Install PostgreSQL with PostGIS extension
2. Install Redis
3. Install OSRM and process the OSM data
4. Update the connection strings in the `.env` file accordingly

The current configuration in `.env` uses NeonDB for PostgreSQL, which should work without local installation.