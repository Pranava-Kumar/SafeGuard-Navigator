# SafeRoute Codebase Documentation

## Project Overview

SafeRoute is an AI-driven public safety navigation system designed for the **Infosys PALS TechZooka Hackathon 2025**. This project focuses on building intelligent navigation for pedestrians and two-wheeler riders in Indian cities, prioritizing safety over speed.

The application provides:
- Real-time lighting assessment using VIIRS satellite data
- Crowdsourced hazard reporting with trust-weighted reputation system
- Integration with civic infrastructure for dark-spot identification
- Multi-factor SafetyScore algorithm combining lighting quality, footfall activity, hazard reports, and proximity to help
- DPDP Act 2023 compliance with explicit consent flows and user rights mechanisms

## Technology Stack

### Frontend
- **Next.js 15+** with App Router
- **React 19+** with Server Components
- **TypeScript 5+**
- **Tailwind CSS v4+**
- **Shadcn UI** & **Magic UI**
- **Framer Motion** for animations
- **Leaflet** for maps
- **Lucide React** for icons

### Backend
- **FastAPI** (Python) for ML services
- **NestJS** (TypeScript) for microservices
- **PostgreSQL + PostGIS** for geospatial data
- **Redis** for caching
- **Kafka/RabbitMQ** for event streaming
- **OSRM** for route optimization

### AI/ML
- **XGBoost/LightGBM** for safety prediction
- **PyTorch** for deep learning models
- **Wilson Score** for reputation system

### Data Sources
- **VIIRS Black Marble** satellite data (NASA)
- **OpenStreetMap** + **Mappls SDK**
- **Municipal dark-spot inventories**
- **India Meteorological Department**
- **Crowdsourced safety reports**

## Project Structure

```
safeguardnavigators/
├── app/                    # Next.js app router pages and API routes
├── backend/                # Python FastAPI backend services
├── components/             # React UI components
├── context/                # React context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and shared logic
├── prisma/                 # Prisma schema and migrations
├── public/                 # Static assets
├── scripts/                # Utility scripts
└── ...
```

## Core Components

### 1. Authentication System

The authentication system is implemented with a dual approach:
- **Frontend**: Next.js API routes in `app/api/auth/` that proxy requests to the backend
- **Backend**: FastAPI endpoints in `backend/app/api/auth.py`

Key files:
- `app/api/auth/simple-login/route.ts` - Handles user login
- `app/api/auth/simple-register/route.ts` - Handles user registration
- `backend/app/api/auth.py` - Backend authentication endpoints
- `context/AuthContext.tsx` - React context for managing authentication state

The system uses JWT tokens for session management and implements DPDP Act 2023 compliance with explicit consent flows.

### 2. Safety Scoring System

The SafetyScore algorithm is the core of SafeRoute's functionality. It evaluates road safety by combining four key factors:
1. **Lighting Quality** (30% weight)
2. **Footfall & Activity** (25% weight)
3. **Hazard Index** (20% weight)
4. **Proximity to Help** (25% weight)

Key files:
- `lib/safety-score.ts` - Frontend implementation of safety scoring
- `backend/app/api/safety.py` - Backend safety score endpoints
- `backend/app/services/safety_calculator.py` - Python implementation of safety calculations
- `lib/reputation/wilsonScore.ts` - Trust-weighted crowdsourcing reputation system

### 3. Route Planning System

The route planning system balances travel time with safety scores using a custom A* implementation.

Key files:
- `lib/routing/safetyAwareRouting.ts` - Custom A* implementation for safety-first routing
- `app/api/routes/route.ts` - Next.js API route for calculating routes
- `backend/app/api/routing.py` - Backend route calculation endpoints
- `backend/app/services/route_optimizer.py` - Python route optimization service

### 4. Data Integration System

The data integration system pulls information from multiple sources to create a comprehensive safety baseline.

Key files:
- `lib/data-integration.ts` - Frontend data integration services
- `backend/app/api/data_ingestion.py` - Backend data ingestion endpoints
- `backend/app/services/ml/service.py` - Machine learning services for predictions
- `backend/app/services/ml/predictor.py` - Safety incident prediction models

### 5. Emergency Services

The emergency system provides quick access to emergency contacts and services.

Key files:
- `components/EmergencyServices.tsx` - Emergency services UI component
- `backend/app/api/emergency.py` - Backend emergency service endpoints
- `app/api/emergency/` - Next.js API routes for emergency services

## Data Sources and Types

### 1. Actual Data Sources

#### VIIRS Satellite Data
- **Source**: NASA's Black Marble dataset
- **Purpose**: Provides night lighting data for safety assessment
- **Integration**: Simulated in `lib/data-integration.ts` (would connect to NASA API in production)
- **Storage**: Stored in `SafetyScore` table in PostgreSQL with `lightingData` field

#### OpenStreetMap (OSM)
- **Source**: OpenStreetMap Foundation
- **Purpose**: Provides POI data, infrastructure information
- **Integration**: Implemented in `lib/data-integration.ts` using Overpass API
- **Storage**: Stored in `POIData` table in PostgreSQL

#### Municipal Data
- **Source**: City/municipal databases
- **Purpose**: Official dark-spot inventories and infrastructure data
- **Integration**: Simulated in `lib/data-integration.ts`
- **Storage**: Stored in `SafetyScore` table with hazard information

#### Weather Data
- **Source**: OpenWeatherMap API
- **Purpose**: Environmental conditions affecting safety
- **Integration**: Implemented in `lib/data-integration.ts`
- **Storage**: Stored in `SafetyScore` table with environmental factors

### 2. Simulated Data Sources

#### Crowdsourced Reports
- **Source**: User-generated safety reports
- **Purpose**: Community-driven hazard identification
- **Integration**: Handled through `components/SafetyReporting.tsx` and backend APIs
- **Storage**: Stored in `IncidentReport` and `SafetyReport` tables in PostgreSQL
- **Trust System**: Wilson Score-based reputation system in `lib/reputation/wilsonScore.ts`

#### User Location Data
- **Source**: Device GPS
- **Purpose**: Real-time location tracking for safety assessment
- **Integration**: Implemented in frontend components like `components/SafetyMap.tsx`
- **Storage**: Stored in various tables with privacy controls (coarse geo-hashing)

### 3. Machine Learning Data

#### Safety Prediction Models
- **Source**: Historical safety data and incident reports
- **Purpose**: Forecast safety incidents and detect anomalies
- **Integration**: Implemented in `backend/app/services/ml/` directory
- **Storage**: Model files stored in `backend/app/services/ml/models/`

## Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

### User Management
- `User` - User profiles with DPDP compliance fields
- `EmergencyContact` - User's emergency contacts
- `UserDevice` - Registered devices for push notifications
- `UserSession` - Active user sessions

### Safety Data
- `SafetyScore` - Calculated safety scores for locations
- `SafetyReport` - Crowdsourced safety reports
- `IncidentReport` - Verified incident reports
- `SafetyEvent` - Safety events affecting areas
- `POIData` - Points of interest data from OSM

### Routing Data
- `Route` - Calculated routes with safety metrics
- `SafetyDataSource` - Configured data sources

### Reputation System
- `ReputationScore` - User trust scores
- `UserReputation` - Detailed reputation metrics

### Emergency System
- `EmergencyAlert` - Triggered emergency alerts

## Data Flow

1. **Data Ingestion**: Multiple sources are integrated through the data ingestion service
2. **Safety Scoring**: Algorithm combines factors to produce safety scores
3. **Route Planning**: Routes are calculated with safety optimization
4. **User Interface**: Results are displayed through the React frontend
5. **Feedback Loop**: User reports improve future safety assessments

## Privacy and Compliance

The system implements several privacy-preserving features:
- **Coarse Geo-hashing**: Location data is stored with reduced precision
- **DPDP Act 2023 Compliance**: Explicit consent flows for all data processing
- **Data Minimization**: Only necessary data is collected and retained
- **On-Device Processing**: Sensitive analyses are processed locally when possible
- **India Data Residency**: All data is stored within India

## API Endpoints

### Authentication
- `POST /api/auth/simple-register` - User registration
- `POST /api/auth/simple-login` - User login
- `GET /api/auth/me` - Get current user

### Safety
- `POST /api/safety/score` - Calculate safety score
- `GET /api/safety/data` - Get safety data
- `GET /api/safety/zones` - Get safety zones

### Routing
- `POST /api/routes/calculate` - Calculate safe routes
- `GET /api/routes` - Get route history

### Emergency
- `POST /api/emergency/trigger` - Trigger emergency alert
- `GET /api/emergency/services` - Get nearby emergency services

### Reporting
- `POST /api/reporting/submit` - Submit safety report
- `GET /api/reporting/nearby` - Get nearby reports

## Deployment

The application can be deployed using:
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Production server

Environment variables are configured in `.env` files.

## Testing

The application includes:
- Unit tests using Jest
- Integration tests for API endpoints
- End-to-end tests for critical user flows

Tests are run with `npm run test`.