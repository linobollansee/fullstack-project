#!/bin/bash

# Fullstack Project Stop Script

echo "🛑 Stopping all services..."

# Kill node processes (backend and frontend)
pkill -f "nest start" 2>/dev/null
pkill -f "next dev" 2>/dev/null

# Stop Docker containers
docker compose down

echo "✅ All services stopped"
