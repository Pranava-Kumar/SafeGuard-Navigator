# SafeRoute Backend Architecture Documentation

## Overview

The SafeRoute backend is built with Python FastAPI, providing RESTful APIs for the frontend application. It implements microservices architecture with clear separation of concerns and follows modern API design principles.

## Project Structure

```
backend/
├── app/                    # Main application package
│   ├── api/               # API route definitions
│   ├── core/              # Core configuration and security
│   ├── crud/              # Database CRUD operations
│   ├── db/                # Database connection and models
│   ├── models/            # SQLAlchemy data models
│   ├── schemas/           # Pydantic data schemas
│   ├── services/          # Business logic services
│   └── utils/             # Utility functions
├── main.py               # Application entry point
├── pyproject.toml        # Project dependencies
└── README.md             # Backend documentation

app/
├── api/                  # API endpoint definitions
│   ├── auth.py           # Authentication endpoints
│   ├── data_ingestion.py # Data ingestion endpoints
│   ├── emergency.py      # Emergency service endpoints
│   ├── predictions.py    # ML prediction endpoints
│   ├── reputation.py     # Reputation system endpoints
│   ├── routing.py        # Route calculation endpoints
│   ├── safety.py         # Safety score endpoints
│   └── api.py            # API router aggregation
├── core/                 # Core application components
│   ├── config.py         # Configuration management
│   └── security.py       # Security utilities
├── crud/                 # Database operations
│   ├── user.py           # User CRUD operations
│   └── __init__.py       # Package exports
├── db/                   # Database components
│   ├── base.py           # Base model class
│   ├── session.py        # Database session management
│   └── utils.py          # Database utilities
├── models/               # SQLAlchemy data models
│   ├── models.py         # Core data models
│   ├── user.py           # User model
│   └── report.py         # Report model
├── schemas/              # Pydantic data schemas
│   └── __init__.py       # All schemas exported
├── services/             # Business logic services
│   ├── ml/               # Machine learning services
│   │   ├── service.py    # ML service orchestration
│   │   ├── predictor.py  # ML model implementations
│   │   └── models/       # Trained model files
│   ├── route_optimizer.py # Route optimization service
│   ├── safety_calculator.py # Safety score calculation service
│   └── reputation_calculator.py # Reputation system service
└── utils/                # Utility functions
```

## Microservices Architecture

### 1. Authentication Service
**File**: `app/api/auth.py`
**Purpose**: User registration, login, and session management
**Endpoints**:
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/simple-register` - Simplified registration
- `POST /api/v1/auth/simple-login` - Simplified login
- `GET /api/v1/auth/me` - Get current user

### 2. Data Ingestion Service
**File**: `app/api/data_ingestion.py`
**Purpose**: Integrate with external data sources
**Endpoints**:
- `POST /api/v1/ingest/sources/` - Create data source
- `GET /api/v1/ingest/sources/` - List data sources
- `GET /api/v1/ingest/sources/{source_id}` - Get data source
- `PUT /api/v1/ingest/sources/{source_id}` - Update data source
- `DELETE /api/v1/ingest/sources/{source_id}` - Delete data source
- `POST /api/v1/ingest/` - Ingest data from source
- `POST /api/v1/ingest/{source_name}/trigger` - Trigger ingestion

### 3. Safety Score Service
**File**: `app/api/safety.py`
**Purpose**: Calculate and retrieve safety scores
**Endpoints**:
- `POST /api/v1/safety/calculate` - Calculate safety score
- `GET /api/v1/safety/score/{latitude}/{longitude}` - Get safety score

### 4. Route Service
**File**: `app/api/routing.py`
**Purpose**: Calculate safety-optimized routes
**Endpoints**:
- `POST /api/v1/routing/calculate` - Calculate route
- `GET /api/v1/routing/route/{route_id}` - Get route

### 5. Reputation Service
**File**: `app/api/reputation.py`
**Purpose**: Manage user reputation and trust scores
**Endpoints**:
- `POST /api/v1/reputation/calculate-wilson-score` - Calculate Wilson score
- `POST /api/v1/reputation/update-reputation` - Update user reputation
- `GET /api/v1/reputation/reputation/{user_id}` - Get user reputation

### 6. Prediction Service
**File**: `app/api/predictions.py`
**Purpose**: Machine learning predictions for safety incidents
**Endpoints**:
- `POST /api/v1/predictions/train` - Train incident model
- `POST /api/v1/predictions/forecast` - Forecast incidents
- `GET /api/v1/predictions/anomalies` - Detect anomalies
- `GET /api/v1/predictions/models` - List models

### 7. Emergency Service
**File**: `app/api/emergency.py`
**Purpose**: Emergency alert system and services
**Endpoints**:
- `POST /api/v1/emergency/trigger` - Trigger emergency alert
- `GET /api/v1/emergency/services` - Get emergency services
- `GET /api/v1/emergency/status/{alert_id}` - Get emergency status
- `POST /api/v1/emergency/safe-confirmation/{alert_id}` - Confirm safe status
- `POST /api/v1/emergency/112-integration` - Integrate with 112 services

## Core Components

### 1. Configuration Management

#### config.py
Centralized configuration using Pydantic Settings:
- **Database**: PostgreSQL connection settings
- **Security**: JWT secrets and algorithms
- **External APIs**: Keys for NASA, Mappls, IMD
- **Services**: OSRM configuration

Environment variables are loaded from `.env` file with fallback defaults.

### 2. Security System

#### security.py
Security utilities for authentication and authorization:
- **JWT**: Token creation and validation
- **Password**: Hashing and verification with bcrypt
- **Algorithms**: HS256 for token signing

### 3. Database Layer

#### Session Management
- **Engine**: SQLAlchemy engine with connection pooling
- **Session**: Thread-local session management
- **Base**: Declarative base for models

#### Models
SQLAlchemy models matching Prisma schema:
- **User**: User profiles with safety preferences
- **SafetyScore**: Calculated safety scores for locations
- **Route**: Saved route calculations
- **EmergencyAlert**: Emergency alert records
- **DataSource**: Configured data sources
- **UserReputation**: User trust scores

#### CRUD Operations
Database operations with proper session management:
- **User Operations**: Create, authenticate, retrieve
- **Generic Patterns**: Reusable CRUD patterns for other models

### 4. Data Validation

#### Schemas
Pydantic models for request/response validation:
- **User Schemas**: Registration, login, profile updates
- **Safety Schemas**: Score calculation and response
- **Route Schemas**: Route calculation and response
- **Emergency Schemas**: Alert triggering and response
- **Reputation Schemas**: Trust score updates
- **Data Ingestion Schemas**: Source management

### 5. Business Logic Services

#### Safety Calculator
**File**: `services/safety_calculator.py`
Implements the core SafetyScore algorithm:
```
SafetyScore(e) = wL * L(e) + wF * F(e) + wH * H(e) + wP * P(e)
```
Where:
- L(e): Lighting Quality (weight: 0.30)
- F(e): Footfall & Activity (weight: 0.25)
- H(e): Hazard Index (weight: 0.20, inverted)
- P(e): Proximity to Help (weight: 0.25)

#### Route Optimizer
**File**: `services/route_optimizer.py`
Safety-aware route calculation:
- Cost function balancing time and safety
- Route alternatives generation
- Integration with OSRM for base routing

#### Reputation Calculator
**File**: `services/reputation_calculator.py`
Wilson Score confidence interval calculation:
- Filters noisy/malicious reports
- Builds trustworthy community network
- Updates user trust levels

#### ML Services
**Files**: `services/ml/`
Machine learning for safety predictions:
- **Incident Forecasting**: 24-hour prediction models
- **Anomaly Detection**: Unusual safety pattern identification
- **Model Management**: Training and persistence

## API Design Principles

### RESTful Design
- Resource-based URLs
- Standard HTTP methods
- Proper status codes
- JSON request/response bodies

### Error Handling
- Consistent error response format
- Appropriate HTTP status codes
- Detailed error messages for debugging
- Validation error aggregation

### Authentication
- JWT-based stateless authentication
- Protected endpoints with token validation
- Role-based access control
- Session management

### Rate Limiting
- API rate limiting to prevent abuse
- Configurable limits per endpoint
- Client identification for fair usage

## Data Processing Pipelines

### 1. Safety Score Calculation Pipeline

**Input**: Location coordinates, safety factors, user context
**Processing**:
1. Retrieve factor data from database
2. Calculate individual factor scores
3. Apply weights with SafeRoute algorithm
4. Adjust for user type and time of day
5. Calculate confidence based on data availability
**Output**: SafetyScoreResponse with overall score and factors

**Implementation**:
```python
# services/safety_calculator.py
def calculate_score(self, request: SafetyScoreRequest) -> SafetyScoreResponse:
    # Extract factor scores
    lighting_score = request.factors.lighting.score
    footfall_score = request.factors.footfall.score
    hazard_score = request.factors.hazards.score
    proximity_score = request.factors.proximity.score
    
    # Calculate weighted score (hazard score is inverted)
    overall_score = (
        weights['lighting'] * lighting_score +
        weights['footfall'] * footfall_score +
        weights['hazards'] * (100 - hazard_score) +
        weights['proximity'] * proximity_score
    )
    
    return SafetyScoreResponse(
        overall_score=round(overall_score),
        factors=request.factors,
        weights=weights,
        confidence=request.confidence,
        timestamp=request.timestamp
    )
```

### 2. Route Optimization Pipeline

**Input**: Start/end coordinates, user preferences
**Processing**:
1. Get base route from OSRM
2. Retrieve safety scores for route segments
3. Apply safety-aware cost function
4. Generate alternative routes
5. Calculate safety metrics for each route
**Output**: RouteResponse with multiple options

### 3. Reputation Update Pipeline

**Input**: User ID, report verification status
**Processing**:
1. Retrieve current reputation
2. Calculate new Wilson Score
3. Update trust level
4. Determine community standing
5. Store updated reputation
**Output**: Updated reputation information

## Machine Learning Integration

### Prediction Service
**Files**: `services/ml/`

#### Incident Forecasting
- **Model**: Random Forest Classifier
- **Features**: Safety factors (lighting, footfall, hazards, proximity)
- **Target**: Incident occurrence (binary classification)
- **Training**: Historical safety data with simulated incidents
- **Prediction**: Probability of incident in next 24 hours

#### Anomaly Detection
- **Method**: Statistical z-score analysis
- **Features**: Numerical safety metrics
- **Detection**: Points exceeding threshold in any dimension
- **Output**: Anomaly scores and flags

#### Model Persistence
- **Format**: Pickle serialization
- **Storage**: File-based model storage
- **Loading**: On-demand model loading
- **Versioning**: Model registry for tracking

## External Integrations

### 1. OpenStreetMap Integration
**Service**: `lib/data-integration.ts` (frontend) and data ingestion service
**API**: Overpass API for POI and infrastructure data
**Data Types**:
- Emergency services (police, hospitals, fire stations)
- Businesses and amenities
- Public transport facilities
- Street lighting infrastructure

### 2. VIIRS Satellite Data
**Service**: `lib/data-integration.ts` (frontend simulation)
**API**: NASA Black Marble dataset (production)
**Data**: Night light brightness measurements
**Purpose**: Ambient lighting assessment for safety scoring

### 3. Weather Services
**Service**: `lib/data-integration.ts` (frontend)
**API**: OpenWeatherMap
**Data**: Current conditions affecting safety
**Purpose**: Environmental factor in safety calculations

### 4. Municipal Data
**Service**: `lib/data-integration.ts` (frontend simulation)
**API**: City government databases (production)
**Data**: Official dark spot inventories
**Purpose**: Infrastructure gap identification

### 5. Emergency Services (112 India)
**Service**: `app/api/emergency.py`
**API**: India's unified emergency number system
**Data**: Emergency alert integration
**Purpose**: Rapid emergency response coordination

## Database Design

### PostgreSQL with PostGIS
Spatial database for geospatial queries:
- **Extensions**: PostGIS for geographic functions
- **Indexes**: Spatial indexes for location queries
- **Types**: Geometry types for coordinates
- **Functions**: Distance calculations, spatial joins

### Key Tables

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

## Performance Considerations

### Database Optimization
- **Indexes**: Proper indexing for frequent queries
- **Query Optimization**: Efficient query patterns
- **Connection Pooling**: Reuse database connections
- **Caching**: Result caching for expensive operations

### API Performance
- **Asynchronous Processing**: Non-blocking I/O operations
- **Pagination**: Large dataset pagination
- **Compression**: Response compression for large payloads
- **Caching Headers**: Client-side caching support

### Scalability Patterns
- **Horizontal Scaling**: Stateless services for load balancing
- **Database Sharding**: Geographic sharding for global expansion
- **Caching Layers**: Redis for frequently accessed data
- **Background Jobs**: Asynchronous processing for heavy tasks

## Security Measures

### Authentication Security
- **Password Hashing**: bcrypt with proper work factors
- **JWT Security**: Secure token generation and validation
- **Session Management**: Proper session invalidation
- **Rate Limiting**: Brute force protection

### Data Security
- **Encryption**: HTTPS for data in transit
- **Access Control**: Role-based permissions
- **Input Validation**: Sanitization of all inputs
- **Audit Logging**: Security-relevant events logging

### Privacy Compliance
- **DPDP Act 2023**: Explicit consent management
- **Data Minimization**: Collect only necessary data
- **User Rights**: Data access, correction, deletion
- **Retention Policies**: Automated data expiration

## Monitoring and Logging

### Application Logging
- **Structured Logging**: JSON format for log aggregation
- **Log Levels**: Appropriate severity levels
- **Contextual Information**: Request IDs for tracing
- **Performance Metrics**: Response times, error rates

### Error Tracking
- **Exception Handling**: Comprehensive error capture
- **User Impact**: Error impact assessment
- **Alerting**: Critical error notifications
- **Debugging**: Detailed error context

### Performance Monitoring
- **Response Times**: API endpoint performance
- **Database Queries**: Query performance tracking
- **Resource Usage**: CPU, memory, disk usage
- **Throughput**: Request volume metrics

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
- **Managed Services**: RDS/Cloud SQL for production
- **Backups**: Automated backup strategies
- **Replication**: Read replicas for scaling
- **Maintenance Windows**: Scheduled maintenance

## Testing Strategy

### Unit Testing
- **Pytest**: Test framework for Python
- **Test Coverage**: Comprehensive test coverage
- **Mocking**: External service mocking
- **Fixtures**: Reusable test data

### Integration Testing
- **API Testing**: End-to-end API workflows
- **Database Testing**: Data layer integration
- **External Service**: Mocked external integrations
- **Security Testing**: Authentication and authorization

### Performance Testing
- **Load Testing**: Concurrent user simulation
- **Stress Testing**: System limits identification
- **Benchmarking**: Performance regression detection
- **Profiling**: Code performance analysis

## CI/CD Pipeline

### Continuous Integration
- **Code Quality**: Linting and formatting checks
- **Automated Testing**: Unit and integration tests
- **Security Scanning**: Vulnerability detection
- **Dependency Checks**: Outdated package detection

### Continuous Deployment
- **Staging Environment**: Pre-production testing
- **Canary Deployments**: Gradual rollout strategy
- **Rollback Mechanisms**: Quick rollback on issues
- **Monitoring Integration**: Deployment health checks

## Future Enhancements

### Microservice Expansion
- **Service Decomposition**: Further service separation
- **Event-Driven Architecture**: Kafka/RabbitMQ integration
- **Service Mesh**: Istio for service communication
- **API Gateway**: Centralized API management

### Advanced Features
- **Real-time Processing**: Stream processing for live data
- **Advanced ML**: Deep learning for pattern recognition
- **IoT Integration**: Sensor data from smart city infrastructure
- **Mobile Backend**: Push notifications and offline sync

### Performance Improvements
- **Caching Strategy**: Multi-layer caching implementation
- **Database Optimization**: Advanced indexing and partitioning
- **Asynchronous Processing**: Background job processing
- **Content Delivery**: Edge computing for global users