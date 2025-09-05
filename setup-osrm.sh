#!/bin/bash
echo "SafeRoute OSRM Setup Script"
echo "==========================="

echo "Checking if OSRM tools are installed..."
if ! command -v osrm-extract &> /dev/null
then
    echo "ERROR: OSRM tools not found in PATH"
    echo "Please install OSRM from https://github.com/Project-OSRM/osrm-backend"
    echo "Or use Docker as described in README-FIXES.md"
    exit 1
fi

echo "Checking for OSM data file..."
if [ ! -f "chennai.osm.pbf" ]; then
    echo "ERROR: chennai.osm.pbf not found in current directory"
    echo "Please download Chennai OSM data from Geofabrik"
    echo "https://download.geofabrik.de/asia/india.html"
    exit 1
fi

echo "Processing OSM data for OSRM..."
echo "This may take several minutes..."

echo "Step 1: Extracting network data..."
osrm-extract -p profiles/foot.lua chennai.osm.pbf
if [ $? -ne 0 ]; then
    echo "ERROR: OSRM extraction failed"
    exit 1
fi

echo "Step 2: Preparing hierarchical data..."
osrm-contract chennai.osrm
if [ $? -ne 0 ]; then
    echo "ERROR: OSRM contraction failed"
    exit 1
fi

echo "Step 3: Starting OSRM server..."
echo "OSRM server will start on port 5000"
echo "Press Ctrl+C to stop the server"
osrm-routed --algorithm mld chennai.osrm