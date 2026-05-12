#!/bin/bash

# FinSpark Prototype Launcher
echo "🚀 Starting FinSpark Feature Intelligence Framework..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies if needed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install
    cd ..
    echo "✅ Backend dependencies installed"
    echo ""
fi

if [ ! -d "dashboard/node_modules" ]; then
    echo "📦 Installing dashboard dependencies..."
    cd dashboard && npm install
    cd ..
    echo "✅ Dashboard dependencies installed"
    echo ""
fi

echo "🎯 Starting components..."
echo ""

# Start backend in background
echo "Starting backend server on http://localhost:3000..."
cd backend && npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start dashboard in background
echo "Starting dashboard on http://localhost:5173..."
cd dashboard && npm run dev &
DASHBOARD_PID=$!
cd ..

# Wait for dashboard to start
sleep 3

echo ""
echo "✨ FinSpark is running!"
echo ""
echo "📊 Dashboard: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3000"
echo "🏦 Demo App: Open demo-app/index.html in your browser"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for interrupt
trap "kill $BACKEND_PID $DASHBOARD_PID; exit" INT
wait
