#!/bin/bash

# Fullstack Project Startup Script

echo "🚀 Starting Fullstack Project..."
echo ""

# Ensure Docker is authenticated
echo "🔐 Checking Docker authentication..."
if ! docker login > /dev/null 2>&1; then
    echo "⚠️  Not logged into Docker. Please authenticate:"
    docker login
    if [ $? -ne 0 ]; then
        echo "❌ Docker login failed."
        exit 1
    fi
fi
echo "✅ Docker authenticated"
echo ""

# Start PostgreSQL database
echo "📦 Starting PostgreSQL database..."
docker compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 3

# Start backend
echo "🔧 Starting backend API..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait for backend to initialize
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Access points:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:3001"
echo "   Swagger Docs: http://localhost:3001/api"
echo "   Database:     localhost:5432"
echo ""
echo "Press Ctrl+C to stop all services..."
echo ""

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker compose stop postgres; echo '✅ All services stopped'; exit 0" INT

# Keep script running
wait
