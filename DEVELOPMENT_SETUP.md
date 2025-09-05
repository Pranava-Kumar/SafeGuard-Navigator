# SafeRoute Development Setup Guide

## Overview

This guide provides step-by-step instructions for setting up a SafeRoute development environment without automatic package installation or virtual environment management.

## Prerequisites

1. **Node.js 16+** (LTS recommended)
2. **Python 3.8+**
3. **PostgreSQL 13+** (or NeonDB account)
4. **Git**

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/safeguard-navigators/safeguard-navigators.git
cd safeguard-navigators
```

### 2. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Verify installation
npm run lint
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment manually
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate

# Install backend dependencies
pip install -e .

# Install additional required packages
pip install email-validator

# Return to project root
cd ..
```

### 4. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your actual credentials:
# - DATABASE_URL for PostgreSQL/NeonDB
# - API keys for NASA, OpenWeatherMap, Mappls, etc.
```

### 5. Database Setup

```bash
# Run database setup script
npm run setup-db
```

### 6. OSRM Setup

1. Download Chennai OSM data:
   - URL: https://download.geofabrik.de/asia/india.html
   - Download Chennai region data
   - Place `chennai-latest.osm.pbf` in `backend/` and rename to `chennai.osm.pbf`

2. Download OSRM:
   - URL: https://github.com/Project-OSRM/osrm-backend/releases
   - Download Windows release
   - Extract to `OSRM/` directory in project root

### 7. Start Development Services

```bash
# Start all services
start-all.bat
```

## Development Workflow

### Running Services Individually

Instead of using the automated scripts, you can run services individually:

1. **Frontend Development Server**:
   ```bash
   npm run dev
   ```

2. **Backend Server**:
   ```bash
   cd backend
   .venv\Scripts\activate
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **OSRM Service**:
   ```bash
   cd backend
   setup-osrm.bat
   ```

### Code Quality

```bash
# Run linter
npm run lint

# Run formatter
npm run format

# Run tests
npm run test
```

## Environment Variables

Key environment variables to configure in `.env`:

- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: Direct database connection (for Prisma)
- `OSRM_URL`: OSRM service URL (default: http://localhost:5000)
- `NASA_API_KEY`: NASA API key for VIIRS data
- `OPENWEATHER_API_KEY`: OpenWeatherMap API key
- `MAPPLS_API_KEY`: Mappls API key for Indian addresses
- `IMD_API_KEY`: India Meteorological Department API key

## Troubleshooting

### Common Issues

1. **Virtual environment not found**:
   - Ensure you've created and activated the virtual environment manually
   - Check that `.venv` directory exists in `backend/`

2. **Missing dependencies**:
   - Install with `pip install -e .` in the backend directory
   - Install `email-validator` separately if needed

3. **Database connection errors**:
   - Verify `DATABASE_URL` in `.env`
   - Ensure PostgreSQL/NeonDB is accessible
   - Check network connectivity

4. **OSRM issues**:
   - Ensure `chennai.osm.pbf` is in `backend/` directory
   - Verify OSRM executables are in `OSRM/` directory
   - Allow time for initial OSRM processing (5-15 minutes)

### Service Status Check

```bash
# Run service checker
check-services.bat
```

## Stopping Services

To stop all services:

```bash
# Run cleanup script
stop-all.bat
```

Or manually close each service window.

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## Support

For issues with the development setup, refer to:
- `TROUBLESHOOTING.md` for common problems
- `OSRM_SETUP.md` for OSRM-specific issues
- `backend/README.md` for backend setup details