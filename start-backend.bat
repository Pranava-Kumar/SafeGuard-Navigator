@echo off
echo Starting SafeGuard Navigator Backend...
echo ================================

cd backend

echo Checking if virtual environment exists...
if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
    echo Virtual environment created.
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Installing/updating dependencies...
pip install -e .

echo Checking if required services are running...

echo Checking PostgreSQL connection...
python -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/saferoute_db'); print('Database connection successful'); conn.close()" 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Cannot connect to PostgreSQL database
    echo Please ensure PostgreSQL is running on port 5432
    echo You can start it with: start-db.bat
)

echo Checking OSRM service...
curl -f http://localhost:5000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Cannot connect to OSRM service on port 5000
    echo Please ensure OSRM is running
    echo You can start it with: setup-osrm.bat
    echo Or use Docker: docker-compose up -d osrm
)

echo Starting backend server...
echo The server will be available at http://localhost:8000
uvicorn main:app --reload --host 0.0.0.0 --port 8000