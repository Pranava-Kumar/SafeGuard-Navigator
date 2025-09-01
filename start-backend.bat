@echo off
echo Starting SafeGuard Navigator Backend...
cd /d "%~dp0\backend"
uvicorn main:app --reload --host 0.0.0.0 --port 8000