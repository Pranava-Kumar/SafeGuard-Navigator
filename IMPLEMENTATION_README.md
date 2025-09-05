# SafeRoute Chennai Implementation

This implementation provides a real-world routing system for Chennai, Tamil Nadu using OpenStreetMap data and OSRM.

## Features Implemented

1. **Real OSRM-based Routing**: Uses actual Chennai OSM data for route calculation
2. **Safety Scoring System**: Calculates safety scores based on real data sources
3. **Proper Authentication**: JWT-based authentication system
4. **Docker Deployment**: Containerized services for easy deployment

## Prerequisites

- Docker and Docker Compose
- Python 3.12+
- Node.js 18+

## Setup Instructions

### 1. Start the Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database with PostGIS
- Redis cache
- OSRM preprocessing service
- OSRM routing server
- Backend API service
- Frontend web application

### 2. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Testing the Implementation

### Automated Tests

```bash
# Test routing functionality
python test_chennai_routing.py

# Test safety scoring
python test_chennai_safety.py

# Test authentication
python test_auth.py

# Comprehensive test
python test_comprehensive.py
```

### Manual Testing

1. Open the frontend at http://localhost:3000
2. Navigate to the Map page
3. Click on the map to select start and end locations in Chennai
4. Plan a route and verify:
   - Real route calculation using OSRM
   - Safety scores for locations
   - Alternative route options

## Chennai Test Locations

- **Chennai Central**: 13.0827, 80.2707
- **T. Nagar**: 13.0398, 80.2342
- **Anna Nagar**: 13.0878, 80.2785
- **Guindy**: 13.0102, 80.2155
- **Velachery**: 12.9791, 80.2242

## Data Sources

1. **OpenStreetMap**: Road network and POI data
2. **VIIRS**: Lighting data from NASA
3. **Municipal Data**: Dark spot information
4. **Overpass API**: Real-time POI queries

## Architecture

```
Frontend (Next.js) ↔ Backend API (FastAPI) ↔ OSRM ↔ OSM Data
                            ↓
                    PostgreSQL + Redis
```

## Services

- **PostgreSQL**: Main database with user data and routes
- **Redis**: Caching layer for performance
- **OSRM**: Routing engine for Chennai
- **Backend**: API services and business logic
- **Frontend**: User interface and map visualization

## Development

### Backend Development

```bash
cd backend
pip install uv
uv pip install -e .
uvicorn app.main:app --reload
```

### Frontend Development

```bash
npm install
npm run dev
```

## Troubleshooting

### OSRM Not Starting

If OSRM fails to start, check that the Chennai OSM data file exists:
```bash
ls -la backend/chennai.osm.pbf
```

### Database Connection Issues

Ensure PostgreSQL is running and accessible:
```bash
docker-compose logs postgres
```

### Routing Issues

Verify OSRM is processing data correctly:
```bash
docker-compose logs osrm-preprocess
docker-compose logs osrm
```

## Future Enhancements

1. Integration with real-time traffic data
2. Advanced safety algorithms using machine learning
3. Mobile application development
4. Integration with civic infrastructure APIs
5. Enhanced crowdsourcing features

## License

This project is licensed under the MIT License.