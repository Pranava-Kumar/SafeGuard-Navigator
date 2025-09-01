#!/bin/bash
echo "Starting SafeGuard Navigator Backend..."
cd "$(dirname "$0")/backend"
uvicorn main:app --reload --host 0.0.0.0 --port 8000