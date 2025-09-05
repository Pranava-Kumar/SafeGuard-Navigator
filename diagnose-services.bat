@echo off
echo SafeRoute Services Diagnostic Tool
echo ==================================

echo Checking system requirements...
echo Python version:
python --version 2>nul || echo Python not found
echo.

echo Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Docker is installed
) else (
    echo Docker is not installed or not in PATH
)
echo.

cd backend

echo Checking virtual environment...
if exist ".venv" (
    echo Virtual environment found
) else (
    echo Virtual environment not found - run start-backend.bat to create one
)
echo.

echo Checking required Python packages...
pip list | findstr "fastapi uvicorn psycopg2 osm" >nul
if %errorlevel% equ 0 (
    echo Required Python packages are installed
) else (
    echo Some required packages may be missing
)
echo.

echo Checking PostgreSQL service...
netstat -an | findstr ":5432" >nul
if %errorlevel% equ 0 (
    echo PostgreSQL port 5432 is listening
) else (
    echo PostgreSQL port 5432 is not listening
)
echo.

echo Checking OSRM service...
netstat -an | findstr ":5000" >nul
if %errorlevel% equ 0 (
    echo OSRM port 5000 is listening
) else (
    echo OSRM port 5000 is not listening
)
echo.

echo Testing database connection...
python -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/saferoute_db'); print('Database connection successful'); conn.close()" 2>nul
if %errorlevel% equ 0 (
    echo Database connection test passed
) else (
    echo Database connection test failed
)
echo.

echo Testing OSRM connection...
curl -f http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo OSRM connection test passed
) else (
    echo OSRM connection test failed
)
echo.

echo Environment variables:
echo OSRM_HOST=%OSRM_HOST%
echo USE_LOCAL_OSRM=%USE_LOCAL_OSRM%
echo DATABASE_URL=%DATABASE_URL%
echo.

echo Diagnostic complete.
echo For detailed troubleshooting, refer to README-FIXES.md
pause