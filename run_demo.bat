@echo off
title AEROLAB - Drone Flight Controller Digital Twin
cls
echo.
echo ==============================================================
echo  AEROLAB: FLIGHT CONTROLLER DIGITAL TWIN ^& FLIGHT INTELLIGENCE
echo  STM32F7 Flight Controller ^| 'Bharati Kshetra' DGCA Lock
echo  Google Coral Edge TPU [4 TOPS] ^| 6-DOF Aerodynamics
echo  Graph Theory Lab, Sem V 2026-27
echo ==============================================================
echo.

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo [ERROR] Node.js is required to run the AEROLAB production server.
  echo Please install Node.js version 18 or newer from https://nodejs.org/
  pause
  exit /b 1
)

if not exist "dist\index.html" (
  echo [BUILD] Production bundle not found. Building precompiled package...
  call npm run build
  if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Production build failed.
    pause
    exit /b 1
  )
)

echo [READY] Launching AEROLAB Production Server...
node server.js
