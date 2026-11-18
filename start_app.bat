@echo off
title AquaShield Launcher
echo ========================================================
echo   Starting AquaShield AI Decision-Support System
echo ========================================================
echo.
echo [1/2] Launching Python Flask Backend API on http://localhost:5000...
start "AquaShield Backend API" cmd /k "python backend\app.py"

echo [2/2] Launching React Vite Frontend on http://localhost:5173...
start "AquaShield Frontend" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ========================================================
echo   System Launched Successfully!
echo   Frontend Dashboard: http://localhost:5173
echo   Backend Health API: http://localhost:5000/api/health
echo ========================================================
pause
