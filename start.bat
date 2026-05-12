@echo off
echo.
echo Starting FinSpark Feature Intelligence Framework...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo Python found:
python --version
echo.

REM Install dependencies if needed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
    echo Backend dependencies installed
    echo.
)

if not exist "dashboard\node_modules" (
    echo Installing dashboard dependencies...
    cd dashboard
    call npm install
    cd ..
    echo Dashboard dependencies installed
    echo.
)

echo Checking Python dependencies...
cd ml-service
pip install -r requirements.txt --quiet
cd ..
echo Python dependencies ready
echo.

echo Starting components...
echo.

REM Start backend
echo Starting backend server on http://localhost:3000...
cd backend
start cmd /k "title Backend Server && npm start"
cd ..

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start ML service
echo Starting ML service on http://localhost:5000...
cd ml-service
start cmd /k "title ML Service && python ml_service.py"
cd ..

REM Wait a bit
timeout /t 3 /nobreak >nul

REM Start dashboard
echo Starting dashboard on http://localhost:5173...
cd dashboard
start cmd /k "title Dashboard && npm run dev"
cd ..

echo.
echo ================================================================
echo FinSpark is running!
echo ================================================================
echo.
echo Dashboard:    http://localhost:5173
echo Backend API:  http://localhost:3000
echo ML Service:   http://localhost:5000
echo Demo App:     Open demo-app\index.html in your browser
echo.
echo You should see 3 terminal windows:
echo   1. Backend Server (port 3000)
echo   2. ML Service (port 5000)
echo   3. Dashboard (port 5173)
echo.
echo Close all terminal windows to stop the services
echo ================================================================
echo.
pause
