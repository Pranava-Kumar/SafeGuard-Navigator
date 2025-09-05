# SafeRoute: Complete System Documentation

## Project Overview

SafeRoute is an AI-driven public safety navigation system designed for the **Infosys PALS TechZooka Hackathon 2025**. This comprehensive documentation covers all aspects of the system, from architecture to data flows, providing a complete understanding of how the application works.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Core Features](#core-features)
4. [Data Sources and Integration](#data-sources-and-integration)
5. [Safety Scoring Algorithm](#safety-scoring-algorithm)
6. [Route Optimization](#route-optimization)
7. [Trust-Weighted Crowdsourcing](#trust-weighted-crowdsourcing)
8. [Emergency Response System](#emergency-response-system)
9. [Privacy and Compliance](#privacy-and-compliance)
10. [Frontend Architecture](#frontend-architecture)
11. [Backend Architecture](#backend-architecture)
12. [Database Schema](#database-schema)
13. [API Documentation](#api-documentation)
14. [Deployment](#deployment)
15. [Testing](#testing)
16. [Future Roadmap](#future-roadmap)

## System Architecture

SafeRoute follows a microservices architecture with clear separation between frontend and backend components:

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Frontend Layer                           │
│                      (Next.js 15+ React Application)                │
├─────────────────────────────────────────────────────────────────────┤
│                            API Gateway                              │
│                    (Next.js API Routes Proxy)                       │
├─────────────────────────────────────────────────────────────────────┤
│                        Backend Microservices                        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │ Auth Svc   │ │ Safety Svc │ │ Route Svc  │ │ Data Svc   │       │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │Reputation S│ │Predictions │ │Emergency S │ │ Reporting  │       │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │
├─────────────────────────────────────────────────────────────────────┤
│                         Data & AI Layer                             │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │ PostgreSQL │ │   Redis    │ │    ML      │ │   Kafka    │       │
│  │   +GIS     │ │  Caching   │ │  Models    │ │ Messaging  │       │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5+
- **UI Library**: React 19+ with Server Components
- **Styling**: Tailwind CSS v4+, Shadcn UI
- **Maps**: Leaflet with OpenStreetMap
- **State Management**: React Context + React Query
- **Animations**: Framer Motion

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with PostGIS extension
- **Caching**: Redis
- **Messaging**: Kafka/RabbitMQ
- **Routing Engine**: OSRM
- **ML Framework**: Scikit-learn, XGBoost
- **Authentication**: JWT with refresh tokens

### Data Sources
- **Satellite Data**: NASA VIIRS Black Marble
- **Maps**: OpenStreetMap + Mappls SDK
- **Weather**: OpenWeatherMap API
- **Municipal**: City dark-spot inventories
- **Crowdsourced**: User-generated reports

## Core Features

### 1. Multi-Factor Safety Scoring
SafeRoute's proprietary algorithm evaluates road safety by combining:
- **Lighting Quality** (30% weight)
- **Footfall & Activity** (25% weight)
- **Hazard Index** (20% weight)
- **Proximity to Help** (25% weight)

### 2. Safety-First Route Optimization
Routes are calculated using a custom A* implementation that balances:
- Travel time
- Safety scores along route segments
- User preferences (safety vs. speed)

### 3. Trust-Weighted Crowdsourcing
Community-driven safety intelligence with:
- Wilson score-based reputation system
- Report verification through community voting
- Noise filtering for malicious/false reports

### 4. Emergency Response Integration
Sub-3-second emergency activation with:
- 112 India integration
- Location sharing
- Emergency contact notification

### 5. Real-time Safety Updates
Dynamic safety scoring with:
- Temporal decay for data freshness
- Real-time incident reporting
- Environmental condition integration

## Data Sources and Integration

### Real Data Sources

#### VIIRS Satellite Data
- **Provider**: NASA Black Marble dataset
- **Purpose**: Night lighting assessment for safety scoring
- **Integration**: Simulated in prototype, would connect to NASA API in production
- **Storage**: SafetyScore table with lightingData field
- **Format**: JSON with brightness measurements

#### OpenStreetMap (OSM)
- **Provider**: OpenStreetMap Foundation
- **Purpose**: Points of interest and infrastructure data
- **Integration**: Overpass API queries in data integration service
- **Storage**: POIData table with categorized amenities
- **Format**: Standard OSM XML/JSON format

#### Weather Data
- **Provider**: OpenWeatherMap API
- **Purpose**: Environmental conditions affecting safety
- **Integration**: API calls in weather data service
- **Storage**: SafetyScore factors field
- **Format**: JSON with temperature, humidity, visibility

#### Municipal Data
- **Provider**: City government databases
- **Purpose**: Officially identified dark spots and infrastructure issues
- **Integration**: Simulated in prototype, would connect to municipal APIs
- **Storage**: SafetyScore factors field
- **Format**: JSON with spot type, severity, status

### User-Generated Data

#### Safety Reports
- **Source**: Community users
- **Purpose**: Real-time hazard identification
- **Integration**: Reporting API with verification workflow
- **Storage**: SafetyReport table with verification metrics
- **Format**: JSON with location, type, severity, description

#### Incident Reports
- **Source**: Verified safety incidents
- **Purpose**: Pattern analysis and predictive modeling
- **Integration**: Incident reporting API with trust scoring
- **Storage**: IncidentReport table with trust scores
- **Format**: JSON with incident type, severity, timestamp

### Simulated Data

#### Safety Scores
- **Source**: Algorithmic calculations
- **Purpose**: Composite safety metrics for locations
- **Integration**: Safety scoring service with weighted factors
- **Storage**: SafetyScore table with overall scores
- **Format**: JSON with factor scores and weights

#### Route Data
- **Source**: Route optimization algorithms
- **Purpose**: Safety-optimized navigation paths
- **Integration**: Route service with OSRM integration
- **Storage**: Route table with safety metrics
- **Format**: JSON with coordinates, distance, duration, safety score

## Safety Scoring Algorithm

The core of SafeRoute is the multi-factor SafetyScore algorithm:

```
SafetyScore(e) = wL * L(e) + wF * F(e) + wH * H(e) + wP * P(e)
```

Where:
- **L(e)**: Lighting Quality (weight: 0.30)
- **F(e)**: Footfall & Activity (weight: 0.25)
- **H(e)**: Hazard Index (weight: 0.20) - INVERTED
- **P(e)**: Proximity to Help (weight: 0.25)

### Factor Calculations

#### Lighting Quality (L(e))
Combines:
- VIIRS satellite brightness data
- Municipal street lighting status
- Crowdsourced lighting reports
- Time-of-day adjustments

#### Footfall & Activity (F(e))
Based on:
- Proximity to businesses and amenities
- Population density estimates
- Transit activity levels
- Time-based activity patterns

#### Hazard Index (H(e))
Considers:
- Recent incident reports
- Infrastructure issues (dark spots)
- Weather-related hazards
- Temporal decay of older incidents

#### Proximity to Help (P(e))
Measures distance to:
- Police stations
- Hospitals
- Fire stations
- Other emergency services

## Route Optimization

SafeRoute uses a custom A* implementation for safety-aware routing:

### Cost Function
```
Cost = α * Time + β * (1 - SafetyScore)
```

Where α and β are weights based on user preferences.

### Algorithm Features
- **Multi-objective optimization**: Balances time and safety
- **Alternative routes**: Generates fastest, safest, and balanced options
- **Dynamic adjustments**: Real-time traffic and incident integration
- **Context-aware**: Adjusts for time of day, weather, user type

### Route Types
1. **Safest Route**: Maximum safety prioritization
2. **Fastest Route**: Minimum time prioritization
3. **Balanced Route**: Optimal combination of safety and time

## Trust-Weighted Crowdsourcing

### Wilson Score Confidence Interval
Used to filter noisy/malicious reports and build a trustworthy community network.

Formula:
```
Wilson Score = (p + z²/2n - z√[(p(1-p) + z²/4n) / n]) / (1 + z²/n)
```

Where:
- p = positive reports / total reports
- n = total reports
- z = z-score for confidence level (1.96 for 95%)

### Reputation System
Users gain reputation through:
- Verified report submissions
- Community voting participation
- Report accuracy over time

Community standings:
- **New**: < 10 reports
- **Trusted**: > 40% Wilson score
- **Verified**: > 60% Wilson score with > 20 reports
- **Expert**: > 80% Wilson score with > 50 reports

## Emergency Response System

### Sub-3-Second Activation
Emergency alerts are processed with:
- Immediate 112 India integration
- Precise location sharing
- Emergency contact notification
- Safety map updates

### Emergency Services Integration
Direct connection to:
- Police emergency services
- Medical emergency services
- Fire department services
- Women's helpline services

### Emergency Contact Management
Users can:
- Add trusted emergency contacts
- Verify contact information
- Set contact priorities
- Select contacts for specific alerts

## Privacy and Compliance

### DPDP Act 2023 Compliance
- **Explicit Consent**: All data processing requires user consent
- **Data Minimization**: Only necessary data collected
- **Purpose Limitation**: Data used only for stated purposes
- **User Rights**: Access, correction, deletion mechanisms

### Privacy-Preserving Techniques
- **Coarse Geo-hashing**: Reduced precision location storage
- **On-Device Processing**: Sensitive analysis performed locally
- **Pseudonymous IDs**: User identification without PII
- **Data Retention**: Automatic expiration of old data

### India Data Residency
- All user data stored within India
- Cloud infrastructure compliant with data sovereignty requirements
- Regular compliance audits

## Frontend Architecture

### Component Structure
```
components/
├── auth/                 # Authentication components
├── dashboard/            # Dashboard widgets
├── emergency/            # Emergency interfaces
├── map/                  # Map components
├── ui/                   # Reusable UI components
├── SafetyMap.tsx         # Main map interface
├── SafetyReporting.tsx   # Incident reporting
├── EmergencyServices.tsx # Emergency services
└── SafetyAnalytics.tsx   # Analytics dashboard
```

### State Management
- **React Context**: Global state (authentication, user preferences)
- **React Query**: Server state management with caching
- **Component State**: Local UI state management

### Data Fetching
- **API Routes**: Proxy to backend services
- **Real-time Updates**: WebSocket connections for live data
- **Error Handling**: Comprehensive error states and retries

## Backend Architecture

### Microservices
1. **Auth Service**: User authentication and authorization
2. **Safety Service**: Safety score calculation and retrieval
3. **Route Service**: Route optimization and calculation
4. **Reputation Service**: User trust scoring
5. **Prediction Service**: ML-based incident forecasting
6. **Emergency Service**: Emergency alert system
7. **Data Ingestion Service**: External data integration

### API Design
- **RESTful**: Resource-based endpoints with standard methods
- **JSON**: Request/response format
- **JWT**: Authentication with bearer tokens
- **Rate Limiting**: Abuse prevention

### Database Design
- **PostgreSQL**: Primary data store
- **PostGIS**: Geospatial extensions
- **Indexing**: Optimized for location and time queries
- **Partitioning**: Geographic and temporal data partitioning

## Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE,
    password_hash VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    phone VARCHAR,
    user_type VARCHAR,
    -- Safety preferences
    risk_tolerance INTEGER,
    time_preference VARCHAR,
    -- Privacy settings
    data_processing_consent BOOLEAN,
    consent_version VARCHAR,
    location_sharing_level VARCHAR,
    -- Metadata
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### SafetyScores
```sql
CREATE TABLE safety_scores (
    id SERIAL PRIMARY KEY,
    latitude REAL,
    longitude REAL,
    geohash VARCHAR,
    overall_score INTEGER,
    confidence REAL,
    -- Factor scores
    lighting_score INTEGER,
    footfall_score INTEGER,
    hazard_score INTEGER,
    proximity_score INTEGER,
    -- Context
    time_of_day VARCHAR,
    user_type VARCHAR,
    -- Data provenance
    sources JSONB,
    factors JSONB,
    -- Temporal
    timestamp TIMESTAMP,
    expires_at TIMESTAMP
);
```

#### Routes
```sql
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    start_latitude REAL,
    start_longitude REAL,
    end_latitude REAL,
    end_longitude REAL,
    distance_meters INTEGER,
    duration_seconds INTEGER,
    overall_safety_score INTEGER,
    -- Context
    calculated_at TIMESTAMP,
    context JSONB
);
```

#### EmergencyAlerts
```sql
CREATE TABLE emergency_alerts (
    id VARCHAR PRIMARY KEY,
    user_id INTEGER,
    latitude REAL,
    longitude REAL,
    emergency_type VARCHAR,
    severity INTEGER,
    status VARCHAR,
    timestamp TIMESTAMP,
    resolved_at TIMESTAMP
);
```

## API Documentation

### Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/auth/me
```

### Safety
```
POST /api/v1/safety/calculate
GET /api/v1/safety/score/{latitude}/{longitude}
```

### Routing
```
POST /api/v1/routing/calculate
GET /api/v1/routing/route/{route_id}
```

### Emergency
```
POST /api/v1/emergency/trigger
GET /api/v1/emergency/services
GET /api/v1/emergency/status/{alert_id}
```

### Reporting
```
POST /api/v1/reporting/submit
GET /api/v1/reporting/nearby
POST /api/v1/reporting/{report_id}/verify
POST /api/v1/reporting/{report_id}/dispute
```

### Reputation
```
POST /api/v1/reputation/calculate-wilson-score
POST /api/v1/reputation/update-reputation
GET /api/v1/reputation/reputation/{user_id}
```

## Deployment Architecture

### Containerization
- **Docker**: Containerized service deployment
- **Multi-stage Builds**: Optimized production images
- **Environment Configuration**: Docker Compose for local development
- **Health Checks**: Container readiness and liveness probes

### Cloud Deployment
- **Platform**: AWS/Azure/GCP deployment options
- **Load Balancing**: Traffic distribution
- **Auto-scaling**: Demand-based scaling
- **CDN**: Static asset delivery

### Database Deployment
- **Managed Services**: RDS/Cloud SQL for production or NeonDB for serverless
- **Backups**: Automated backup strategies
- **Replication**: Read replicas for scaling
- **Maintenance Windows**: Scheduled maintenance

### Local Development Setup
- **Manual Environment Setup**: Developers must manually create and activate virtual environments
- **No Auto-installation**: Scripts no longer automatically install packages or dependencies
- **Service Isolation**: Each service runs in its own window for easier monitoring
- **Graceful Shutdown**: Services can be stopped independently without affecting others

## Testing

### Unit Testing
- **Frontend**: Jest with React Testing Library
- **Backend**: Pytest for Python services
- **Coverage**: >80% code coverage target

### Integration Testing
- **API Testing**: End-to-end API workflows
- **Database Testing**: Data layer integration
- **External Service**: Mocked external integrations

### Performance Testing
- **Load Testing**: Concurrent user simulation
- **Stress Testing**: System limits identification
- **Benchmarking**: Performance regression detection

## Future Roadmap

### Phase 1: Smart Infrastructure Integration (Q2 2026)
#### Pothole Detection & Avoidance
- Sensor-Based Detection: Smartphone accelerometers and gyroscopes
- Vision-Based Detection: YOLO-based computer vision models
- SafetyScore Integration: Pothole data integrated as PotholeScore(e)

#### Citizen Grievance Redressal Platform
- Integrated Reporting: In-app submission of complaints
- CPGRAMS Integration: Direct API connection to Central Public Grievance Redress and Monitoring System
- Dynamic Routing Feedback: Grievance status influences route safety

### Phase 2: Advanced AI (2027)
#### Predictive Safety Intelligence
- 24-hour incident forecasting using historical patterns
- Anomaly detection for unusual safety patterns
- Seasonal modeling for festivals and events

### Phase 3: Ecosystem Integration (2028+)
#### Multi-Modal Safety Extension
- E-scooter and cycling safety with battery-aware routing
- Public transport safety with metro/corridor integration
- Accessibility features for users with disabilities

#### Smart City Partnerships
- Emergency services optimization
- Urban planning with mobility analytics
- Technology Roadmap: Edge AI, 5G integration, Blockchain, AR Navigation

## Conclusion

SafeRoute represents a comprehensive approach to urban safety navigation, combining real-time data, community intelligence, and advanced algorithms to prioritize safety over speed. The system is designed with privacy and compliance at its core, ensuring that user data is protected while providing valuable safety insights.

The modular architecture allows for future expansion and integration with smart city infrastructure, positioning SafeRoute as a foundational platform for urban safety in India and beyond.