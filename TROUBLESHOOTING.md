# SafeRoute Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend Server Won't Start

**Problem:** Error messages about missing modules or dependencies

**Solution:**
1. Ensure virtual environment is activated:
   ```bash
   .venv\Scripts\activate
   ```
2. Install missing dependencies:
   ```bash
   pip install -e .
   ```
3. Check that all required environment variables are set in `.env`

### 2. Database Connection Errors

**Problem:** Backend can't connect to PostgreSQL database

**Solution:**
1. Verify `DATABASE_URL` in `.env` file
2. Ensure PostgreSQL server is running
3. Test connection with:
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```
4. For NeonDB, ensure internet connectivity and correct credentials

### 3. OSRM Service Not Responding

**Problem:** "Cannot connect to OSRM service" errors

**Solution:**
1. Check if OSRM service is running:
   ```bash
   curl http://localhost:5000/health
   ```
2. If not running, start OSRM:
   ```bash
   cd backend
   setup-osrm.bat
   ```
3. Wait for initial processing to complete (can take 5-15 minutes)
4. Check firewall settings if running on different machine

### 4. Frontend Fails to Compile

**Problem:** Next.js compilation errors or "Module not found" errors

**Solution:**
1. Clear Next.js cache:
   ```bash
   rm -rf .next
   ```
2. Reinstall dependencies:
   ```bash
   npm install
   ```
3. Check Node.js version (requires 16+)

### 5. Email Validation Errors

**Problem:** "email-validator module not found" when starting backend

**Solution:**
```bash
pip install email-validator
```

### 6. Prisma Client Generation Fails

**Problem:** Errors when running database setup or migrations

**Solution:**
1. Ensure Prisma CLI is installed:
   ```bash
   npm install prisma --save-dev
   ```
2. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## Environment-Specific Issues

### Windows

1. **Path Issues:** Use forward slashes (/) in .env files
2. **Line Endings:** Ensure .env files use LF line endings
3. **Long Path Issues:** Enable long path support in Windows Registry

### macOS/Linux

1. **Permission Issues:** Ensure execute permissions on .sh files:
   ```bash
   chmod +x *.sh
   ```
2. **Python Version:** Ensure using Python 3.8+:
   ```bash
   python3 --version
   ```

## Service Status Checks

### Check All Services

1. **Frontend:** http://localhost:3000
2. **Backend API:** http://localhost:8000
3. **OSRM Service:** http://localhost:5000/health
4. **Database:** Check with database client or psql

### Health Check Endpoints

Each service should respond to health check requests:
- Frontend: http://localhost:3000/api/health
- Backend: http://localhost:8000/api/v1/health
- OSRM: http://localhost:5000/health

## Performance Issues

### Slow Startup Times

1. **OSRM Processing:** First-time OSRM processing can take 5-15 minutes
2. **Database Connections:** Ensure connection pooling is configured
3. **Caching:** Check Redis/Memcached if used for caching

### High Memory Usage

1. **OSRM Data:** OSRM processed files can be 2-3GB
2. **Database:** PostgreSQL may consume significant RAM
3. **Frontend Dev Server:** Next.js dev server can be memory intensive

## Debugging Tools

### Backend Debugging

1. Enable debug logging:
   ```bash
   export DEBUG=1
   uvicorn main:app --reload
   ```

2. Check logs in `backend/logs/` directory

### Frontend Debugging

1. Check browser console for JavaScript errors
2. Use React DevTools for component debugging
3. Check Network tab for API call failures

### Database Debugging

1. Use Prisma Studio:
   ```bash
   npx prisma studio
   ```
2. Check PostgreSQL logs for errors
3. Verify database connection with:
   ```bash
   psql $DATABASE_URL -c "\dt"
   ```

## Emergency Recovery

### Reset Database

1. Drop and recreate database:
   ```bash
   dropdb saferoute_db
   createdb saferoute_db
   ```
2. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Reset OSRM Data

1. Delete processed OSRM files:
   ```bash
   rm backend/chennai.osrm*
   ```
2. Re-process OSM data:
   ```bash
   cd backend
   setup-osrm.bat
   ```

### Full System Reset

1. Stop all services
2. Delete `.next` directory
3. Delete `backend/.venv` directory
4. Delete processed OSRM files
5. Re-setup environment from scratch

## Support

If you're still experiencing issues:

1. Check GitHub issues: https://github.com/safeguard-navigators/safeguard-navigators/issues
2. Contact support team
3. Provide detailed error messages and system information