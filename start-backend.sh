#!/bin/bash
echo "Starting SafeGuard Navigator Backend..."
echo "================================"

cd "$(dirname "$0")/backend"

echo "Checking if virtual environment exists..."
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
    echo "Virtual environment created."
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing/updating dependencies..."
pip install -e .

echo "Checking if required services are running..."

echo "Checking PostgreSQL connection..."
python3 -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/saferoute_db'); print('Database connection successful'); conn.close()" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "WARNING: Cannot connect to PostgreSQL database"
    echo "Please ensure PostgreSQL is running on port 5432"
    echo "You can start it with: ./start-db.sh"
fi

echo "Checking OSRM service..."
curl -f http://localhost:5000/health >/dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "WARNING: Cannot connect to OSRM service on port 5000"
    echo "Please ensure OSRM is running"
    echo "You can start it with: ./setup-osrm.sh"
    echo "Or use Docker: docker-compose up -d osrm"
fi

echo "Starting backend server..."
echo "The server will be available at http://localhost:8000"
uvicorn main:app --reload --host 0.0.0.0 --port 8000