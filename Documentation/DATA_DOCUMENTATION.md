# SafeRoute Data Documentation

## Overview

SafeRoute uses a combination of real and simulated data to provide safety-aware navigation. This document details all data sources, their integration methods, storage locations, and processing pipelines.

## Data Categories

### 1. Real Data Sources

#### A. VIIRS Night Lighting Data
**Source Type**: Satellite imagery
**Provider**: NASA Black Marble dataset
**Purpose**: Assess ambient lighting conditions for safety scoring
**Integration Method**: 
- In production, would connect to NASA's VIIRS API
- Currently simulated in `lib/data-integration.ts` through `VIIRSDataService`
**Storage Location**: 
- PostgreSQL `SafetyScore` table
- Data stored in `lightingData` JSON field
**Data Format**:
```json
{
  "viirsBrightness": 45.2,
  "coverage": 85,
  "source": "viirs",
  "timestamp": "2025-01-15T10:30:00Z"
}
```
**Update Frequency**: Monthly (in production)
**Data Freshness**: Stored with expiration timestamps

#### B. OpenStreetMap (OSM) Data
**Source Type**: Open mapping data
**Provider**: OpenStreetMap Foundation
**Purpose**: Provide points of interest, infrastructure data, and road networks
**Integration Method**: 
- Uses Overpass API in `lib/data-integration.ts` through `OSMDataService`
- Queries for amenities, shops, emergency services, transport hubs
**Storage Location**: 
- PostgreSQL `POIData` table
**Data Format**:
```json
{
  "id": "osm_12345",
  "name": "City Hospital",
  "category": "hospital",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "address": "123 Medical Road, Chennai",
  "phone": "+91-44-12345678",
  "isEmergencyService": true,
  "dataSource": "osm",
  "lastUpdated": "2025-01-15T10:30:00Z"
}
```
**Update Frequency**: Weekly data refresh
**Data Freshness**: Last updated timestamps

#### C. Weather Data
**Source Type**: Meteorological data
**Provider**: OpenWeatherMap API
**Purpose**: Environmental conditions affecting safety (visibility, precipitation)
**Integration Method**: 
- Uses OpenWeatherMap API in `lib/data-integration.ts` through `WeatherDataService`
**Storage Location**: 
- PostgreSQL `SafetyScore` table in `factors` JSON field
**Data Format**:
```json
{
  "temperature": 28.5,
  "humidity": 75,
  "visibility": 10,
  "weatherCondition": "clear",
  "windSpeed": 3.2,
  "pressure": 1013,
  "source": "openweather",
  "timestamp": "2025-01-15T10:30:00Z"
}
```
**Update Frequency**: Hourly updates
**Data Freshness**: Real-time data with timestamps

#### D. Municipal Dark Spot Data
**Source Type**: Government infrastructure data
**Provider**: City municipal corporations
**Purpose**: Officially identified high-risk areas requiring infrastructure improvements
**Integration Method**: 
- Simulated in `lib/data-integration.ts` through `MunicipalDataService`
- Would connect to municipal APIs in production
**Storage Location**: 
- PostgreSQL `SafetyScore` table in `factors` JSON field
**Data Format**:
```json
{
  "spotType": "official",
  "description": "Poor street lighting on main road",
  "status": "active",
  "reportedBy": "Municipal Corporation",
  "severity": 4,
  "source": "municipal"
}
```
**Update Frequency**: Monthly updates from municipalities
**Data Freshness**: Verification timestamps

### 2. User-Generated Data (Real)

#### A. Safety Reports
**Source Type**: Crowdsourced user reports
**Provider**: SafeRoute users
**Purpose**: Community-driven hazard identification and verification
**Integration Method**: 
- Submitted through `components/SafetyReporting.tsx`
- Processed by backend APIs in `backend/app/api/`
**Storage Location**: 
- PostgreSQL `SafetyReport` table
**Data Format**:
```json
{
  "id": "sr_abc123",
  "userId": "user_789",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "reportType": "poor_lighting",
  "severity": 3,
  "title": "Street light out",
  "description": "Third street light from the corner is not working",
  "status": "verified",
  "verificationCount": 5,
  "upvotes": 12,
  "downvotes": 2
}
```
**Update Frequency**: Real-time with user submissions
**Data Freshness**: Creation and update timestamps

#### B. Incident Reports
**Source Type**: Verified incident data
**Provider**: Users and third-party sources
**Purpose**: Document actual safety incidents for pattern analysis
**Integration Method**: 
- Submitted through reporting interface
- Verified by community and system
**Storage Location**: 
- PostgreSQL `IncidentReport` table
**Data Format**:
```json
{
  "id": "ir_def456",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "incidentType": "theft",
  "severity": 4,
  "description": "Bag snatching near bus stop",
  "status": "verified",
  "verificationCount": 8,
  "trustScore": 0.85
}
```
**Update Frequency**: Real-time with incident submissions
**Data Freshness**: Time-stamped with verification dates

#### C. User Location Data
**Source Type**: Device GPS
**Provider**: Mobile/web application users
**Purpose**: Real-time location for safety assessment and route planning
**Integration Method**: 
- Collected through frontend components
- Processed with privacy-preserving techniques
**Storage Location**: 
- Transient in application state
- Coarse geo-hashed in database for analytics
**Data Format**:
```json
{
  "userId": "user_789",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "accuracy": "city_level",
  "timestamp": "2025-01-15T10:30:00Z"
}
```
**Update Frequency**: Real-time location updates
**Data Freshness**: Timestamped GPS data

### 3. Simulated Data Sources

#### A. Safety Scores
**Source Type**: Algorithmic calculations
**Provider**: SafeRoute SafetyScore engine
**Purpose**: Composite safety metrics for locations
**Integration Method**: 
- Calculated in `lib/safety-score.ts` and `backend/app/services/safety_calculator.py`
- Combines multiple factors with weighted algorithm
**Storage Location**: 
- PostgreSQL `SafetyScore` table
**Data Format**:
```json
{
  "id": "ss_xyz789",
  "latitude": 13.0827,
  "longitude": 80.2707,
  "overallScore": 78,
  "confidence": 0.85,
  "lightingScore": 75,
  "footfallScore": 80,
  "hazardScore": 20,
  "proximityScore": 85,
  "timeOfDay": "evening",
  "userType": "pedestrian"
}
```
**Update Frequency**: On-demand calculation with caching
**Data Freshness**: Calculated with expiration timestamps

#### B. Route Data
**Source Type**: Algorithmic route optimization
**Provider**: SafeRoute routing engine
**Purpose**: Safety-optimized navigation paths
**Integration Method**: 
- Calculated in `lib/routing/safetyAwareRouting.ts` and backend services
- Uses A* algorithm with safety-weighted cost function
**Storage Location**: 
- PostgreSQL `Route` table
**Data Format**:
```json
{
  "id": "route_123",
  "userId": "user_789",
  "startLat": 13.0827,
  "startLng": 80.2707,
  "endLat": 13.0398,
  "endLng": 80.2342,
  "distance": 5200,
  "duration": 600,
  "safetyScore": 82,
  "routeType": "balanced"
}
```
**Update Frequency**: Real-time calculation on user request
**Data Freshness**: Calculation timestamps

#### C. User Reputation Data
**Source Type**: Algorithmic trust scoring
**Provider**: Wilson Score reputation system
**Purpose**: Filter noisy/malicious reports and build trustworthy community
**Integration Method**: 
- Calculated in `lib/reputation/wilsonScore.ts` and backend services
- Updated with each verified report
**Storage Location**: 
- PostgreSQL `ReputationScore` and `UserReputation` tables
**Data Format**:
```json
{
  "userId": "user_789",
  "trustLevel": 0.78,
  "communityStanding": "verified",
  "reputationPoints": 1250,
  "positiveReports": 45,
  "totalReports": 52
}
```
**Update Frequency**: Updated with each report verification
**Data Freshness**: Last calculation timestamps

## Database Schema Details

### SafetyScore Table
Stores calculated safety scores for locations:
```sql
CREATE TABLE "SafetyScore" (
  "id" TEXT PRIMARY KEY,
  "latitude" REAL,
  "longitude" REAL,
  "geohash" TEXT,
  "overallScore" INTEGER,
  "confidence" REAL,
  "lightingScore" INTEGER,
  "footfallScore" INTEGER,
  "hazardScore" INTEGER,
  "proximityScore" INTEGER,
  "timeOfDay" TEXT,
  "userType" TEXT,
  "sources" TEXT,
  "factors" JSONB,
  "lightingData" TEXT,
  "footfallData" TEXT,
  "hazardData" TEXT,
  "timestamp" TIMESTAMP,
  "lastUpdated" TIMESTAMP,
  "expiresAt" TIMESTAMP
);
```

### POIData Table
Stores points of interest from various sources:
```sql
CREATE TABLE "POIData" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "category" TEXT,
  "subcategory" TEXT,
  "latitude" REAL,
  "longitude" REAL,
  "address" TEXT,
  "phone" TEXT,
  "website" TEXT,
  "hours" TEXT,
  "isEmergencyService" BOOLEAN,
  "isActive" BOOLEAN,
  "rating" REAL,
  "reviewCount" INTEGER,
  "lastUpdated" TIMESTAMP,
  "dataSource" TEXT,
  "municipalityId" TEXT
);
```

### IncidentReport Table
Stores verified safety incidents:
```sql
CREATE TABLE "IncidentReport" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "latitude" REAL,
  "longitude" REAL,
  "incidentType" TEXT,
  "severity" INTEGER,
  "title" TEXT,
  "description" TEXT,
  "status" TEXT,
  "verificationCount" INTEGER,
  "trustScore" REAL,
  "upvotes" INTEGER,
  "downvotes" INTEGER,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

### UserReputation Table
Stores user trust scores:
```sql
CREATE TABLE "UserReputation" (
  "userId" TEXT PRIMARY KEY,
  "trustLevel" REAL,
  "communityStanding" TEXT,
  "reputationPoints" INTEGER,
  "positiveReports" INTEGER,
  "totalReports" INTEGER,
  "lastCalculatedAt" TIMESTAMP,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

## Data Processing Pipelines

### 1. Safety Score Calculation Pipeline
1. **Data Collection**: Gather data from all sources (VIIRS, OSM, weather, municipal)
2. **Factor Calculation**: Compute individual factor scores (lighting, footfall, hazards, proximity)
3. **Weighted Combination**: Apply SafeRoute algorithm: 
   `SafetyScore = 0.3×Lighting + 0.25×Footfall + 0.2×(100-Hazards) + 0.25×Proximity`
4. **Storage**: Save to SafetyScore table with expiration
5. **Distribution**: Serve to frontend APIs

### 2. Route Optimization Pipeline
1. **Request Processing**: Parse start/end points and user preferences
2. **Safety Data Retrieval**: Fetch relevant safety scores for route segments
3. **Cost Calculation**: Apply safety-aware cost function
4. **Path Finding**: Use A* algorithm to find optimal path
5. **Alternative Generation**: Create fastest, safest, and balanced alternatives
6. **Storage**: Save to Route table
7. **Response**: Return route options to user

### 3. Reputation System Pipeline
1. **Report Submission**: User submits safety report
2. **Initial Scoring**: Assign preliminary trust score based on reporter's reputation
3. **Community Verification**: Other users verify or dispute report
4. **Wilson Score Calculation**: Update user's Wilson Score confidence interval
5. **Standing Update**: Adjust community standing based on score and report count
6. **Storage**: Update UserReputation table
7. **Application**: Use reputation scores to weight future reports

## Privacy and Data Protection

### Data Minimization
- Only collect necessary data for safety assessment
- Use coarse geo-hashing instead of precise location tracking
- Implement purpose-limited retention policies

### User Consent
- Explicit consent flows for all data processing activities
- Consent versioning and audit trails in UserConsent table
- User rights mechanisms (access, correction, deletion)

### On-Device Processing
- Sensitive analyses like computer vision processed locally
- Pseudonymous IDs instead of direct user identification where possible
- Encryption for data in transit and at rest

### India Data Residency
- All user data hosted within India
- Cloud infrastructure compliant with national data sovereignty requirements
- Regular audits for compliance

## Data Quality and Validation

### Source Reliability Scoring
Each data source has a reliability score:
- VIIRS Satellite: 0.95 (highly reliable)
- OSM Data: 0.90 (community-verified)
- Municipal Data: 0.85 (official but potentially outdated)
- Crowdsourced Reports: 0.70 (variable, trust-weighted)
- Weather Data: 0.95 (real-time, reliable)

### Confidence Intervals
Safety scores include confidence metrics based on:
- Number of data sources contributing to the score
- Recency of data
- Reliability of sources
- Consistency between sources

### Temporal Decay
Data is weighted by freshness:
- VIIRS data: Full weight for 30 days, then decays
- OSM data: Full weight for 7 days, then decays
- Crowdsourced reports: Full weight for 90 days, then decays
- Weather data: Real-time, no decay

## Future Data Integrations

### 1. Pothole Detection
- **Source**: Smartphone sensors (accelerometer, gyroscope)
- **Purpose**: Automated road condition assessment
- **Storage**: Specialized pothole data table
- **Processing**: On-device computer vision with 92% accuracy

### 2. Grievance Redressal Platform
- **Source**: Integrated with CPGRAMS (Central Public Grievance Redress and Monitoring System)
- **Purpose**: Direct connection to civic infrastructure improvement
- **Storage**: Grievance tracking table
- **Processing**: Automatic forwarding of verified reports

### 3. Predictive Safety Intelligence
- **Source**: Historical patterns and machine learning models
- **Purpose**: 24-hour incident forecasting and anomaly detection
- **Storage**: Prediction results in specialized tables
- **Processing**: XGBoost/LightGBM models for structured geospatial feature engineering

## Data Access Patterns

### Real-time Queries
- Current location safety score
- Route calculation with safety optimization
- Nearby emergency services
- Active safety alerts

### Batch Processing
- Periodic data ingestion from external sources
- Safety score recalculations for areas
- Reputation score updates
- Anomaly detection runs

### Analytics Queries
- Safety trend analysis
- User behavior patterns
- Report verification rates
- Route optimization effectiveness

## Data Monitoring and Maintenance

### Automated Checks
- Data source uptime monitoring
- Freshness validation for time-sensitive data
- Consistency checks between overlapping data sources
- Anomaly detection for unexpected patterns

### Manual Processes
- Periodic review of municipal data accuracy
- Community moderation of crowdsourced reports
- Model retraining with new incident data
- Privacy audit compliance verification

## Troubleshooting Data Issues

### Missing Data
1. Check source API availability
2. Verify data integration service logs
3. Review database connection status
4. Validate data processing pipelines

### Stale Data
1. Check data expiration timestamps
2. Verify periodic update jobs
3. Review source update frequencies
4. Check for failed data refresh processes

### Inconsistent Data
1. Compare overlapping data sources
2. Validate data transformation logic
3. Check for processing errors in logs
4. Review data quality scoring mechanisms