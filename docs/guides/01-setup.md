# Setup - Project Initialization

## Overview

In this guide, you'll set up the complete development environment including:

- Git repository
- NestJS backend
- Next.js frontend
- PostgreSQL database
- Environment configuration
- Startup scripts

## Step 1: Initialize Git Repository

```bash
# Create project directory
mkdir fullstack-project
cd fullstack-project

# Initialize git repository
git init

# Create .gitignore
cat > .gitignore << EOF
node_modules/
.env
.env.local
dist/
.next/
coverage/
*.log
.DS_Store
EOF

# Initial commit
git add .
git commit -m "Initial commit"
```

## Step 2: Create NestJS Backend

```bash
# Install NestJS CLI globally (if not already installed)
npm i -g @nestjs/cli

# Create NestJS project
nest new backend

# When prompted, choose your preferred package manager (npm/yarn/pnpm)
# Navigate to backend directory
cd backend
```

### Install Additional Dependencies

```bash
# Database dependencies
npm install @nestjs/typeorm typeorm pg

# Configuration
npm install @nestjs/config

# Validation
npm install class-validator class-transformer

# Testing (should already be installed)
npm install --save-dev @nestjs/testing jest supertest @types/supertest
```

## Step 3: Create Next.js Frontend

```bash
# Go back to project root
cd ..

# Create Next.js project
npx create-next-app@latest frontend

# When prompted, select:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes (recommended)
# - src/ directory: Yes
# - App Router: Yes
# - Import alias: Yes (default @/*)
```

## Step 4: Setup PostgreSQL Database

### Using Docker Compose

Create `docker-compose.yml` in project root:

```yaml
services:
  postgres:
    image: postgres:18-alpine
    container_name: fullstack-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - fullstack-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fullstack-backend
    environment:
      DATABASE_HOST: ${DATABASE_HOST}
      DATABASE_PORT: ${DATABASE_PORT}
      DATABASE_USER: ${POSTGRES_USER}
      DATABASE_PASSWORD: ${POSTGRES_PASSWORD}
      DATABASE_NAME: ${POSTGRES_DB}
      PORT: 3001
      NODE_ENV: ${NODE_ENV}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - fullstack-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    container_name: fullstack-frontend
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - fullstack-network

networks:
  fullstack-network:
    driver: bridge

volumes:
  postgres_data:
```

Start PostgreSQL:

```bash
docker-compose up -d postgres

# Verify it's running
docker ps
```

## Step 5: Configure Environment Variables

### Root Directory .env

Create `.env` in project root:

```env
# PostgreSQL Configuration
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=shopdb

# Backend Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
JWT_SECRET=dev-secret-key-replace-in-production-with-generated-key
JWT_EXPIRES_IN=1d
NODE_ENV=development

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend .env

Create `backend/.env`:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=shopdb

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=dev-secret-key-replace-in-production-with-generated-key
JWT_EXPIRES_IN=1d
```

### Frontend .env.local

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Step 6: Configure Backend Database Connection

### Update `app.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DATABASE_HOST"),
        port: +configService.get("DATABASE_PORT"),
        username: configService.get("DATABASE_USER"),
        password: configService.get("DATABASE_PASSWORD"),
        database: configService.get("DATABASE_NAME"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true, // Set to false in production
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Enable CORS and Validation in `main.ts`

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
```

## Step 7: Create Startup Scripts

### Windows: `start-all-services.bat`

```batch
@echo off
REM Fullstack Project Startup Script for Windows

echo 🚀 Starting Fullstack Project...
echo.

REM Get the directory where the script is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Ensure Docker is authenticated
echo 🔐 Checking Docker authentication...
docker login >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Not logged into Docker. Please authenticate:
    docker login
    if errorlevel 1 (
        echo ❌ Docker login failed.
        pause
        exit /b 1
    )
)
echo ✅ Docker authenticated
echo.

REM Start PostgreSQL database
echo 📦 Starting PostgreSQL database...
docker-compose up -d postgres
if errorlevel 1 (
    echo ❌ Failed to start database. Make sure Docker is running.
    pause
    exit /b 1
)

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 3 /nobreak >nul

REM Start backend in new terminal
echo 🔧 Starting backend API...
start "Backend API" cmd /k "cd /d "%SCRIPT_DIR%backend" && npm run start:dev"

REM Wait for backend to initialize
echo ⏳ Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend in new terminal
echo 🎨 Starting frontend...
start "Frontend App" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"

echo.
echo ✅ All services started in separate windows!
echo.
echo 📍 Access points:
echo    Frontend:     http://localhost:3000
echo    Backend API:  http://localhost:3001
echo    Swagger Docs: http://localhost:3001/api
echo    Database:     localhost:5432
echo.
echo To stop all services, run: stop-all-services.bat
echo.
pause
```

### Linux/Mac: `start-all-services.sh`

```bash
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
```

Make the shell script executable:

```bash
chmod +x start-all-services.sh
```

## Step 8: Verify Setup

### Quick Start

**Windows:**

```batch
start-all-services.bat
```

**Linux/Mac:**

```bash
./start-all-services.sh
```

### Manual Start

**Backend:**

```bash
cd backend
npm run start:dev
# Should start on http://localhost:3001
```

**Frontend:**

```bash
cd frontend
npm run dev
# Should start on http://localhost:3000
```

### Test Database Connection

```bash
# Connect to PostgreSQL
docker exec -it fullstack-postgres psql -U admin -d shopdb

# List databases
\l

# Exit
\q
```

## Project Structure

Your project should now look like this:

```
fullstack-project/
├── backend/
│   ├── src/
│   │   ├── app.controller.ts
│   │   ├── app.module.ts (✅ TypeORM configured)
│   │   ├── app.service.ts
│   │   └── main.ts (✅ CORS + Validation)
│   ├── test/
│   ├── .env (✅ configured)
│   └── package.json
├── frontend/
│   ├── src/
│   │   └── app/
│   ├── .env.local (✅ configured)
│   └── package.json
├── docker-compose.yml (✅ PostgreSQL + Backend + Frontend)
├── .env (✅ Root environment variables)
├── .gitignore
├── start-all-services.bat (Windows)
├── start-all-services.sh (Linux/Mac)
└── README.md
```

## Next Steps

Proceed to [02-products.md](./02-products.md) to implement the product CRUD functionality.

## Troubleshooting

### Docker Authentication Issues

If you see authentication errors when pulling images:

```bash
docker login
```

Enter your Docker Hub credentials when prompted.

### PostgreSQL Connection Issues

- Ensure Docker is running: `docker ps`
- Check PostgreSQL logs: `docker logs fullstack-postgres`
- Recreate database with clean state:
  ```bash
  docker-compose down -v
  docker-compose up -d postgres
  ```

### Port Already in Use

**Port 3001 (Backend):**

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3001
kill -9 <PID>
```

**Port 3000 (Frontend):**

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### CORS Issues

- Ensure `app.enableCors()` is called in backend `main.ts`
- Check that frontend is using correct API URL in `.env.local`
- Verify backend is accessible at http://localhost:3001
