#!/bin/bash
echo "SafeRoute Services Diagnostic Tool"
echo "=================================="

echo "Checking system requirements..."
echo "Python version:"
python3 --version 2>/dev/null || echo "Python not found"
echo

echo "Checking Docker installation..."
if command -v docker &> /dev/null; then
    echo "Docker is installed"
else
    echo "Docker is not installed or not in PATH"
fi
echo

cd "$(dirname "$0")/backend"

echo "Checking virtual environment..."
if [ -d ".venv" ]; then
    echo "Virtual environment found"
else
    echo "Virtual environment not found - run ./start-backend.sh to create one"
fi
echo

echo "Checking required Python packages..."
if pip list | grep -E "(fastapi|uvicorn|psycopg2|osm)" > /dev/null; then
    echo "Required Python packages are installed"
else
    echo "Some required packages may be missing"
fi
echo

echo "Checking PostgreSQL service..."
if netstat -an | grep ":5432" > /dev/null; then
    echo "PostgreSQL port 5432 is listening"
else
    echo "PostgreSQL port 5432 is not listening"
fi
echo

echo "Checking OSRM service..."
if netstat -an | grep ":5000" > /dev/null; then
    echo "OSRM port 5000 is listening"
else
    echo "OSRM port 5000 is not listening"
fi
echo

echo "Testing database connection..."
if python3 -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/saferoute_db'); print('Database connection successful'); conn.close()" 2>/dev/null; then
    echo "Database connection test passed"
else
    echo "Database connection test failed"
fi
echo

echo "Testing OSRM connection..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "OSRM connection test passed"
else
    echo "OSRM connection test failed"
fi
echo

echo "Environment variables:"
echo "OSRM_HOST=$OSRM_HOST"
echo "USE_LOCAL_OSRM=$USE_LOCAL_OSRM"
echo "DATABASE_URL=$DATABASE_URL"
echo

echo "Diagnostic complete."
echo "For detailed troubleshooting, refer to README-FIXES.md"