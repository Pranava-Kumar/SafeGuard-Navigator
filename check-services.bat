@echo off
echo SafeRoute Service Status Checker
echo ===============================

echo Checking service statuses...
echo.

echo 1. Frontend (Next.js):
curl -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    [RUNNING] http://localhost:3000
) else (
    echo    [STOPPED] Frontend not responding
)

echo.
echo 2. Backend API (FastAPI):
curl -f http://localhost:8000/api/v1/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    [RUNNING] http://localhost:8000
) else (
    echo    [STOPPED] Backend not responding
)

echo.
echo 3. OSRM Service:
curl -f http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    [RUNNING] http://localhost:5000
) else (
    echo    [STOPPED] OSRM not responding
)

echo.
echo 4. Database Connection:
cd backend >nul
python -c "import os; import psycopg2; db_url = os.getenv('DATABASE_URL', 'postgresql://neondb_owner:npg_ManPy6Y2oFNe@ep-noisy-math-a1ls63lm-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'); conn = psycopg2.connect(db_url); print('    [CONNECTED] Database connection successful'); conn.close()" 2>nul
if %errorlevel% neq 0 (
    echo    [DISCONNECTED] Cannot connect to database
)
cd .. >nul

echo.
echo Service check completed.
echo.
echo If any services show as STOPPED or DISCONNECTED:
echo 1. Check that the respective startup scripts are running
echo 2. Verify that ports are not blocked by firewall
echo 3. Check that environment variables are correctly configured
echo 4. Refer to TROUBLESHOOTING.md for detailed solutions
echo.
pause