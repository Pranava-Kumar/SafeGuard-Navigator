# SafeRoute Backend Services

This directory contains all the backend microservices for the SafeRoute application.

## Services

1. **Auth Service** - User authentication and authorization
2. **Data Ingest Service** - Ingestion of data from various sources
3. **Safety Score Service** - Calculation of safety scores using multi-factor algorithm
4. **Route Service** - Route calculation with safety optimization
5. **Reputation Service** - User reputation management using Wilson Score
6. **Prediction Service** - AI/ML predictions for safety incidents

## Setup

1. Install dependencies using uv:
   ```bash
   cd backend
   uv pip install -e .
   ```

2. For development dependencies:
   ```bash
   uv pip install -e .[dev]
   ```

3. Run services individually:
   ```bash
   uvicorn app.main:app --reload
   ```

Each service has its own directory with its specific implementation.