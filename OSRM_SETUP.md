# OSRM Setup Guide

## Prerequisites

1. Download Chennai OSM data from Geofabrik:
   - URL: https://download.geofabrik.de/asia/india.html
   - Download the "Chennai" region data
   - Place the downloaded file (`chennai-latest.osm.pbf`) in the `backend` directory and rename it to `chennai.osm.pbf`

2. Download OSRM executables:
   - URL: https://github.com/Project-OSRM/osrm-backend/releases
   - Download the Windows release (e.g., `osrm-backend-v5.24.0-win64.zip`)
   - Extract all files to a folder named `OSRM` in the project root directory

## Setup Instructions

### 1. Process OSM Data

From the project root directory, run:

```bash
cd backend
setup-osrm.bat
```

This will:
1. Extract network data using the foot profile
2. Prepare hierarchical data for fast routing
3. Start the OSRM routing server

### 2. Alternative: Using Docker

If you have Docker installed, you can use the provided Docker Compose configuration:

```bash
docker-compose up -d osrm
```

## Troubleshooting

### DLL Issues

If you encounter errors about missing DLLs (bz2.dll, tbb12.dll):

1. Delete the existing DLLs in the OSRM folder
2. Download a complete OSRM release from:
   https://github.com/Project-OSRM/osrm-backend/releases/tag/v5.24.0
3. Extract all files to replace the current OSRM folder contents

### Processing Time

The first-time processing of OSM data can take 5-15 minutes depending on your system. This is normal.

### Port Conflicts

If port 5000 is already in use, you can modify the startup command in `setup-osrm.bat` to use a different port:

```bash
osrm-routed --algorithm mld chennai.osrm --port 5001
```

## Verification

Once OSRM is running, you can verify it's working by visiting:
- http://localhost:5000/health (should return {"status":"OK"})
- http://localhost:5000/nearest/v1/foot/80.2707,13.0827 (should return nearest point data)

## Notes

- The processed OSRM files (`chennai.osrm*`) are quite large (~2-3GB) and will be created in the backend directory
- These files don't need to be committed to version control
- If you update the OSM data file, you'll need to re-process it by running `setup-osrm.bat` again