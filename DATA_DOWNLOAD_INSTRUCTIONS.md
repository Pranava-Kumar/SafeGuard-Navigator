# SafeRoute Chennai Data Download Instructions

This document provides instructions for downloading and setting up all the necessary data for the SafeRoute Chennai implementation.

## 1. OpenStreetMap Data

The project already includes Chennai OSM data files:
- `chennai.osm.pbf` - Chennai city data
- `south-india.osm.pbf` - South India regional data

These files were downloaded from Geofabrik (https://download.geofabrik.de/asia/india.html).

### If you need to update or download fresh data:

1. Visit https://download.geofabrik.de/asia/india.html
2. Download the latest `chennai-latest.osm.pbf` file
3. Rename it to `chennai.osm.pbf` and place it in the `backend/` directory
4. For regional data, download `south-india-latest.osm.pbf` and rename to `south-india.osm.pbf`

## 2. OSRM Setup

The OSRM routing engine will automatically process the OSM data when you start the services:

```bash
docker-compose up -d
```

This will:
1. Preprocess the Chennai OSM data using OSRM tools
2. Create routing files for the OSRM server
3. Start the OSRM routing service

## 3. API Keys Registration

### NASA API Key (for VIIRS satellite data)
1. Visit https://api.nasa.gov/
2. Sign up for a free API key
3. Add the key to your `.env` file as `NASA_API_KEY=your_key_here`

### OpenWeatherMap API Key (for weather data)
1. Visit https://openweathermap.org/api
2. Sign up for a free account
3. Get your API key from the account dashboard
4. Add the key to your `.env` file as `OPENWEATHER_API_KEY=your_key_here`

### Mappls API Key (for Indian address precision)
1. Visit https://www.mapmyindia.com/api/
2. Register for a developer account
3. Create a new project and get your API key
4. Add the key to your `.env` file as `MAPPLS_API_KEY=your_key_here`

### IMD API Key (for India Meteorological Department data)
1. Visit https://mausam.imd.gov.in/user/register
2. Register for an account
3. Request API access
4. Add the key to your `.env` file as `IMD_API_KEY=your_key_here`

## 4. Docker Volumes

The Docker setup uses volumes to persist data:
- PostgreSQL data is stored in a named volume
- OSM data files are mounted from the host
- OSRM processed files are stored in the container

## 5. Database Initialization

The database will be automatically initialized when you start the services:
1. PostgreSQL database with PostGIS extension
2. All required tables will be created
3. Initial data will be populated

## 6. Verification Steps

After setting up all data and API keys:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your actual API keys

3. Start all services:
   ```bash
   docker-compose up -d
   ```

4. Check that all services are running:
   ```bash
   docker-compose ps
   ```

5. Verify OSRM preprocessing:
   ```bash
   docker-compose logs osrm-preprocess
   ```

6. Verify OSRM routing server:
   ```bash
   docker-compose logs osrm
   ```

7. Test the backend API:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```

8. Access the frontend:
   Open http://localhost:3000 in your browser

## 7. Troubleshooting

### OSRM Preprocessing Issues
If OSRM preprocessing fails:
1. Check that `chennai.osm.pbf` exists in the `backend/` directory
2. Verify the file is not corrupted
3. Check Docker logs for specific error messages

### Database Connection Issues
If the backend cannot connect to the database:
1. Ensure PostgreSQL is running
2. Verify database credentials in `.env`
3. Check Docker network connectivity

### API Key Issues
If external APIs are not working:
1. Verify API keys are correctly added to `.env`
2. Check that keys have the necessary permissions
3. Ensure you haven't exceeded rate limits

### Data Update Frequency
The system is configured to update data:
- OSM data: Manual updates when new extracts are downloaded
- Weather data: Hourly updates
- Municipal data: Weekly updates
- VIIRS data: Daily updates (when available)

## 8. Data Sources Information

### OpenStreetMap
- License: Open Data Commons Open Database License (ODbL)
- Update frequency: Daily extracts from Geofabrik
- Coverage: Chennai city and South India region

### NASA VIIRS
- Source: NASA Black Marble dataset
- Resolution: 500m
- Update frequency: Daily
- Coverage: Global

### OpenWeatherMap
- Source: Weather data API
- Update frequency: Every 10 minutes
- Coverage: Global weather stations

### Mappls
- Source: Indian address and POI data
- Update frequency: Regular updates
- Coverage: India

### IMD
- Source: India Meteorological Department
- Update frequency: Hourly
- Coverage: India

## 9. Legal and Compliance

### Data Privacy
- Follow India's DPDP Act 2023 for data processing
- Implement proper consent mechanisms
- Ensure data minimization principles

### API Usage
- Comply with terms of service for each API provider
- Respect rate limits and usage quotas
- Implement proper error handling and caching

### OpenStreetMap Attribution
- Properly attribute OpenStreetMap data
- Follow ODbL license requirements
- Display appropriate copyright notices