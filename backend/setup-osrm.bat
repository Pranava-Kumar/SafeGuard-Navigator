@echo off
echo SafeRoute OSRM Setup Script
echo ===========================

REM Check if we're in the correct directory
if not exist "chennai.osm.pbf" (
    echo ERROR: chennai.osm.pbf not found in current directory
    echo Please download Chennai OSM data from Geofabrik
    echo https://download.geofabrik.de/asia/india.html
    echo.
    echo Also ensure you're running this script from the backend directory
    pause
    exit /b 1
)

echo Checking for OSRM executables...
if not exist "..\OSRM\osrm-extract.exe" (
    echo OSRM executables not found in ..\OSRM directory.
    echo.
    echo Please install OSRM:
    echo 1. Download pre-compiled binaries from https://github.com/Project-OSRM/osrm-backend/releases
    echo    - Download osrm-release-win-x64.zip or osrm-backend-v5.24.0-win64.zip
    echo    - Extract to a folder named "OSRM" in the project root directory
    echo.
    echo Or use Docker by running: docker-compose up -d osrm
    echo.
    pause
    exit /b 1
)

echo Checking for required DLLs...
echo Note: If you get errors about DLLs, they may be incompatible with your system.
echo In that case, please:
echo 1. Delete the existing DLLs in the OSRM folder
echo 2. Download a complete OSRM release from:
echo    https://github.com/Project-OSRM/osrm-backend/releases
echo 3. Extract all files to replace the current OSRM folder contents

echo Testing OSRM extract...
..\OSRM\osrm-extract --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: OSRM extract failed to run. This may be due to missing or incompatible DLLs.
    echo.
    echo Try running install-osrm-deps.bat for guidance on fixing this issue.
    echo Or download a complete OSRM release that includes all dependencies.
    echo.
    pause
    exit /b 1
)

echo Adding OSRM to PATH...
set "PATH=%PATH%;%CD%\..\OSRM"

echo Checking for profiles directory...
if not exist "profiles" mkdir profiles

echo Checking for foot.lua profile...
if not exist "profiles\foot.lua" (
    echo Creating default foot.lua profile...
    echo -- Foot profile for OSRM > profiles\foot.lua
    echo properties.traffic_signal_penalty = 2 >> profiles\foot.lua
    echo properties.u_turn_penalty = 2 >> profiles\foot.lua
    echo properties.traffic_light_penalty = 1 >> profiles\foot.lua
    echo properties.weight_precision = 3 >> profiles\foot.lua
    echo properties.weight_name = 'duration' >> profiles\foot.lua
    echo function get_exceptions(vector) >> profiles\foot.lua
    echo   return vector() >> profiles\foot.lua
    echo end >> profiles\foot.lua
    echo function node_function(node, result) >> profiles\foot.lua
    echo   return 0 >> profiles\foot.lua
    echo end >> profiles\foot.lua
    echo function way_function(way, result) >> profiles\foot.lua
    echo   local highway = way:get_value_by_key("highway") >> profiles\foot.lua
    echo   local foot = way:get_value_by_key("foot") >> profiles\foot.lua
    echo   local access = way:get_value_by_key("access") >> profiles\foot.lua
    echo   if (not highway or highway == '') and (not foot or foot == '') then >> profiles\foot.lua
    echo     return 0 >> profiles\foot.lua
    echo   end >> profiles\foot.lua
    echo   if access and access ~= '' and access ~= 'yes' and access ~= 'permissive' and access ~= 'designated' and access ~= 'destination' and access ~= 'delivery' and access ~= 'customers' and access ~= 'public' and access ~= 'foot' then >> profiles\foot.lua
    echo     return 0 >> profiles\foot.lua
    echo   end >> profiles\foot.lua
    echo   if foot and foot ~= '' and foot ~= 'yes' and foot ~= 'permissive' and foot ~= 'designated' and foot ~= 'destination' and foot ~= 'delivery' and foot ~= 'customers' and foot ~= 'public' then >> profiles\foot.lua
    echo     return 0 >> profiles\foot.lua
    echo   end >> profiles\foot.lua
    echo   if highway and highway ~= '' then >> profiles\foot.lua
    echo     if highway == 'footway' or highway == 'pedestrian' or highway == 'steps' or highway == 'path' or highway == 'cycleway' or highway == 'living_street' or highway == 'residential' or highway == 'service' or highway == 'track' or highway == 'unclassified' or highway == 'tertiary' or highway == 'secondary' or highway == 'primary' or highway == 'trunk' or highway == 'motorway' then >> profiles\foot.lua
    echo       result.forward_speed = 5 >> profiles\foot.lua
    echo       result.backward_speed = 5 >> profiles\foot.lua
    echo       result.forward_mode = mode.walking >> profiles\foot.lua
    echo       result.backward_mode = mode.walking >> profiles\foot.lua
    echo     else >> profiles\foot.lua
    echo       return 0 >> profiles\foot.lua
    echo     end >> profiles\foot.lua
    echo   end >> profiles\foot.lua
    echo end >> profiles\foot.lua
    echo function segment_function(profile, segment) >> profiles\foot.lua
    echo   segment.weight = segment.duration >> profiles\foot.lua
    echo end >> profiles\foot.lua
)

echo Checking if OSRM data already exists...
if exist "chennai.osrm.hsgr" (
    echo Preprocessing already complete. Starting OSRM server...
    goto start_server
)

echo Processing OSM data for OSRM...
echo This may take several minutes...

echo Step 1: Extracting network data...
..\OSRM\osrm-extract -p profiles/foot.lua chennai.osm.pbf
if %errorlevel% neq 0 (
    echo ERROR: OSRM extraction failed
    echo This may be due to missing or incompatible DLLs.
    echo Try running install-osrm-deps.bat for guidance on fixing this issue.
    pause
    exit /b 1
)

echo Step 2: Preparing hierarchical data...
..\OSRM\osrm-contract chennai.osrm
if %errorlevel% neq 0 (
    echo ERROR: OSRM contraction failed
    pause
    exit /b 1
)

:start_server
echo Step 3: Starting OSRM server...
echo OSRM server will start on port 5000
echo Press Ctrl+C to stop the server
..\OSRM\osrm-routed --algorithm mld --max-matching-size 1000 chennai.osrm