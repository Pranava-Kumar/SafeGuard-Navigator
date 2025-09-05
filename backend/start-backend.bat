@echo off
echo SafeGuard Navigator Backend Startup Script
echo ==========================================

echo Checking for virtual environment...
if not exist ".venv" (
    echo ERROR: Virtual environment not found!
    echo Please create the virtual environment manually:
    echo 1. python -m venv .venv
    echo 2. .venv\Scripts\activate
    echo 3. pip install -e .
    echo 4. Then run this script again
    pause
    exit /b 1
)

echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo Checking for required dependencies...
python -c "import email_validator" 2>nul
if %errorlevel% neq 0 (
    echo ERROR: email-validator not found!
    echo Please install it with: pip install email-validator
    pause
    exit /b 1
)

echo Starting backend server...
echo The server will be available at http://localhost:8000
uvicorn main:app --reload --host 0.0.0.0 --port 8000