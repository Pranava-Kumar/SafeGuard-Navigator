@echo off
echo SafeRoute OSRM Setup Script
echo ===========================

echo Checking if OSRM tools are installed...
where osrm-extract >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: OSRM tools not found in PATH
    echo Please install OSRM from https://github.com/Project-OSRM/osrm-backend
    echo Or use Docker as described in README-FIXES.md
    pause
    exit /b 1
)

echo Checking for OSM data file...
if not exist "chennai.osm.pbf" (
    echo ERROR: chennai.osm.pbf not found in current directory
    echo Please download Chennai OSM data from Geofabrik
    echo https://download.geofabrik.de/asia/india.html
    pause
    exit /b 1
)

echo Processing OSM data for OSRM...
echo This may take several minutes...

echo Step 1: Extracting network data...
osrm-extract -p profiles/foot.lua chennai.osm.pbf
if %errorlevel% neq 0 (
    echo ERROR: OSRM extraction failed
    pause
    exit /b 1
)

echo Step 2: Preparing hierarchical data...
osrm-contract chennai.osrm
if %errorlevel% neq 0 (
    echo ERROR: OSRM contraction failed
    pause
    exit /b 1
)

echo Step 3: Starting OSRM server...
echo OSRM server will start on port 5000
echo Press Ctrl+C to stop the server
osrm-routed --algorithm mld chennai.osrm

pause