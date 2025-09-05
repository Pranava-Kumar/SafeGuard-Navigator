# Service Status Monitoring

## Overview

SafeRoute now includes a service status monitoring system that allows you to check the status of all core services from a single dashboard.

## Features

1. **Real-time Monitoring**: Continuously monitors all core services
2. **Visual Status Indicators**: Color-coded status badges for quick assessment
3. **Automatic Refresh**: Updates every 30 seconds
4. **Manual Refresh**: On-demand status updates
5. **Detailed Error Reporting**: Shows specific error messages when services are down

## Services Monitored

1. **Frontend**: Next.js development server (http://localhost:3000)
2. **Backend API**: FastAPI backend server (http://localhost:8000)
3. **OSRM Service**: OSRM routing engine (http://localhost:5000)
4. **Database**: PostgreSQL/NeonDB connection

## Implementation Details

### Frontend Component

The `ServiceStatusDashboard` component is located at `components/ServiceStatusDashboard.tsx` and provides:

- Visual dashboard with service status
- Automatic refresh every 30 seconds
- Manual refresh button
- Status legend for quick reference

### Backend API

The service status API is implemented in `backend/service_status_api.py` and provides:

- `/api/v1/service-status`: Returns status of all services
- `/api/v1/health`: Simple health check endpoint

## Usage

### Frontend Integration

To use the service status dashboard in your application:

```tsx
import ServiceStatusDashboard from "@/components/ServiceStatusDashboard";

export default function MyPage() {
  return (
    <div>
      <ServiceStatusDashboard />
    </div>
  );
}
```

### API Endpoints

To check service status programmatically:

```bash
# Get status of all services
curl http://localhost:8000/api/v1/service-status

# Simple health check
curl http://localhost:8000/api/v1/health
```

### Example Response

```json
{
  "services": {
    "frontend": {
      "name": "Frontend",
      "status": "running",
      "url": "http://localhost:3000",
      "description": "Next.js Development Server"
    },
    "backend_api": {
      "name": "Backend API",
      "status": "running",
      "url": "http://localhost:8000",
      "description": "FastAPI Backend Server"
    },
    "osrm_service": {
      "name": "OSRM Service",
      "status": "running",
      "url": "http://localhost:5000",
      "description": "OSRM Routing Engine"
    },
    "database": {
      "name": "Database",
      "status": "running",
      "url": "Database Connection",
      "description": "PostgreSQL/NeonDB"
    }
  },
  "timestamp": "1234567890.123"
}
```

## Status Meanings

- **Running**: Service is operational and responding correctly
- **Stopped**: Service is not running or not accessible
- **Error**: Service is running but returning errors
- **Checking**: Service status is being verified

## Troubleshooting

### Service Shows as Stopped

1. **Check if service is running**:
   ```bash
   # Check frontend
   curl http://localhost:3000
   
   # Check backend
   curl http://localhost:8000
   
   # Check OSRM
   curl http://localhost:5000/health
   ```

2. **Restart the service**:
   - Use the appropriate startup script
   - Check service logs for errors

### Database Connection Issues

1. **Verify database URL**:
   - Check `DATABASE_URL` in `.env` file
   - Ensure database is accessible

2. **Test connection manually**:
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```

### OSRM Service Issues

1. **Check OSRM setup**:
   - Ensure `chennai.osm.pbf` is in `backend/` directory
   - Verify OSRM executables are in `OSRM/` directory

2. **Restart OSRM**:
   ```bash
   cd backend
   setup-osrm.bat
   ```

## Customization

### Adding New Services

To monitor additional services:

1. Add a new function in `service_status_api.py`:
   ```python
   async def check_my_service_status(session: aiohttp.ClientSession) -> ServiceStatus:
       # Implementation here
   ```

2. Update the main status check function:
   ```python
   @app.get("/api/v1/service-status", response_model=ServiceStatusResponse)
   async def get_service_status():
       # Add new service check
   ```

### Modifying Refresh Interval

To change the refresh interval:

1. Update the frontend component:
   ```tsx
   // Change the interval in useEffect
   const interval = setInterval(checkAllServices, 60000); // 60 seconds
   ```

## Security Considerations

- The service status API should not be exposed publicly in production
- Sensitive information should be filtered from error messages
- Rate limiting should be implemented for public endpoints

## Performance

- Service checks run concurrently to minimize response time
- Timeout values prevent hanging requests
- Caching can be implemented for frequently accessed status information