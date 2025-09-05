@echo off
echo SafeRoute Service Cleanup Script
echo ================================

echo This script will attempt to gracefully stop all running SafeRoute services.
echo.

echo Stopping Frontend Development Server...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Frontend Server*" >nul 2>&1

echo Stopping Backend Server...
taskkill /f /im python.exe /fi "WINDOWTITLE eq Backend Server*" >nul 2>&1

echo Stopping OSRM Service...
taskkill /f /im osrm*.exe /fi "WINDOWTITLE eq OSRM Service*" >nul 2>&1

echo.
echo All SafeRoute services have been stopped.
echo.
echo Note: Some services may take a moment to fully shut down.
echo Please close any remaining command prompt windows manually if needed.
echo.
pause