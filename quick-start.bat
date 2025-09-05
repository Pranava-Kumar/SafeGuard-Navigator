@echo off
title SafeRoute Quick Start
echo SafeRoute Quick Start Guide
echo ==========================

echo Welcome to SafeRoute development!
echo.
echo This script will help you get started quickly with the SafeRoute development environment.
echo.

echo Step 1: Checking prerequisites...
echo --------------------------------
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js 16+ from https://nodejs.org/
    echo.
    goto :error
) else (
    echo [OK] Node.js is installed
)

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python not found!
    echo Please install Python 3.8+ from https://python.org/
    echo.
    goto :error
) else (
    echo [OK] Python is installed
)

echo.
echo Step 2: Setting up environment...
echo -----------------------------------
echo Creating virtual environment...
cd backend
python -m venv .venv >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to create virtual environment
    echo Please ensure Python is properly installed
    echo.
    goto :error
) else (
    echo [OK] Virtual environment created
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to activate virtual environment
    echo.
    goto :error
) else (
    echo [OK] Virtual environment activated
)

echo Installing backend dependencies...
pip install -e . >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    echo Please check your internet connection and try again
    echo.
    goto :error
) else (
    echo [OK] Backend dependencies installed
)

echo Installing email-validator...
pip install email-validator >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to install email-validator
    echo Please install it manually with: pip install email-validator
    echo.
) else (
    echo [OK] Email-validator installed
)

cd ..

echo Installing frontend dependencies...
npm install >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    echo Please check your internet connection and try again
    echo.
    goto :error
) else (
    echo [OK] Frontend dependencies installed
)

echo.
echo Step 3: Environment configuration...
echo ------------------------------------
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env >nul 2>&1
    if %errorlevel% neq 0 (
        echo WARNING: Failed to create .env file
        echo Please copy .env.example to .env manually
    ) else (
        echo [OK] .env file created
        echo Please edit .env with your actual credentials
    )
) else (
    echo [OK] .env file already exists
    echo Please verify your credentials in .env
)

echo.
echo Step 4: Database setup...
echo ------------------------
echo Please set up your database manually:
echo 1. Ensure PostgreSQL/NeonDB is accessible
echo 2. Update DATABASE_URL in .env with your connection string
echo 3. Run: npm run setup-db
echo.

echo Step 5: OSRM setup...
echo ---------------------
echo Please set up OSRM manually:
echo 1. Download Chennai OSM data from https://download.geofabrik.de/asia/india.html
echo 2. Place chennai-latest.osm.pbf in backend/ and rename to chennai.osm.pbf
echo 3. Download OSRM from https://github.com/Project-OSRM/osrm-backend/releases
echo 4. Extract to OSRM/ directory in project root
echo.

echo Quick Start Completed!
echo =====================
echo.
echo Next steps:
echo 1. Edit .env with your actual credentials
echo 2. Set up database with npm run setup-db
echo 3. Set up OSM data and OSRM
echo 4. Start services with start-all.bat
echo.
echo For detailed instructions, see:
echo - DEVELOPMENT_SETUP.md
echo - OSRM_SETUP.md
echo - backend/README.md
echo.
echo Helpful commands:
echo - npm run dev          : Start frontend development server
echo - npm run setup-db      : Set up database
echo - npm run check         : Check service statuses
echo - npm run start:all     : Start all services
echo - npm run stop:all      : Stop all services
echo.
echo Press any key to continue...
pause >nul
goto :eof

:error
echo Press any key to exit...
pause >nul
exit /b 1