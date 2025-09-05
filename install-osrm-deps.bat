@echo off
echo SafeRoute OSRM Dependency Installer
echo ==================================

REM Check if we're in the correct directory
if not exist "OSRM\osrm-extract.exe" (
    echo ERROR: OSRM executables not found in OSRM directory
    echo Please ensure you have OSRM installed in the OSRM folder
    pause
    exit /b 1
)

echo This script will help you install the correct OSRM dependencies.
echo.

echo Option 1: Download OSRM with dependencies from a reliable source
echo Option 2: Manually install dependencies
echo.

echo Recommended approach:
echo 1. Delete the current OSRM folder
echo 2. Download a complete OSRM release that includes all dependencies
echo 3. Extract it to the OSRM folder
echo.

echo Download link for OSRM v5.24.0 (known to work well):
echo https://github.com/Project-OSRM/osrm-backend/releases/download/v5.24.0/osrm-backend-v5.24.0-win64.zip
echo.

echo Instructions:
echo 1. Download the zip file from the link above
echo 2. Extract all contents to the OSRM folder in your project
echo 3. This will overwrite any existing files and provide all necessary dependencies
echo.

echo Alternatively, you can try to find compatible DLLs:
echo 1. Visit https://github.com/sfztools/sfizz/releases
echo 2. Download a release that contains compatible tbb12.dll and bz2.dll files
echo 3. Extract these DLLs to your OSRM folder
echo.

echo For more information about OSRM on Windows, visit:
echo https://github.com/Project-OSRM/osrm-backend/wiki/Windows-Compilation
echo.

echo Press any key to continue...
pause