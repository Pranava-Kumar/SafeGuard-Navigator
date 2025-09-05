@echo off
title SafeRoute - All Services
echo SafeRoute - Complete Application Startup Script
echo =================================================

echo Checking prerequisites...
if not exist "backend\chennai.osm.pbf" (
    echo.
    echo ERROR: chennai.osm.pbf not found in backend directory!
    echo Please download Chennai OSM data from Geofabrik and place it in the backend directory.
    echo https://download.geofabrik.de/asia/india.html
    echo.
    pause
    exit /b 1
)

if not exist "OSRM\osrm-extract.exe" (
    echo.
    echo ERROR: OSRM executables not found!
    echo Please install OSRM from https://github.com/Project-OSRM/osrm-backend/releases
    echo Extract to a folder named "OSRM" in the project root.
    echo.
    pause
    exit /b 1
)

echo Starting services...
echo ===================

echo 1. Starting Database Service in background window...
start "Database Service" cmd /c "start-db.bat"

echo Waiting for Database to initialize...
timeout /t 10 /nobreak >nul

echo 2. Starting OSRM Service in background window...
start "OSRM Service" /D "%CD%\backend" cmd /c "setup-osrm.bat"

echo Waiting for OSRM to initialize...
timeout /t 20 /nobreak >nul

echo 3. Starting Backend Server in background window...
start "Backend Server" /D "%CD%\backend" cmd /c "start-backend.bat"

echo 4. Starting Frontend Development Server...
start "Frontend Server" /D "%CD%" cmd /c "npm run dev"

echo.
echo All services started successfully!
echo =================================
echo Services:
echo - Database service: localhost:5432
echo - OSRM service: http://localhost:5000
echo - Backend API: http://localhost:8000
echo - Frontend: http://localhost:3000
echo.
echo Notes:
echo - Each service runs in its own window
echo - Keep all windows open for proper operation
echo - Close windows individually to stop services
echo - First-time OSRM processing may take 5-10 minutes
echo.
echo Press Ctrl+C to close this window (services will continue running)
pause >nul