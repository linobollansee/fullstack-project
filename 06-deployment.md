# Deployment - Docker & Render (Bonus)

## Overview

In this guide, you'll learn how to:

- Containerize backend and frontend with Docker
- Create a docker-compose setup for local development
- Deploy to Render (cloud platform)
- Configure environment variables for production

---

## Part 1: Docker Setup

### Step 1: Create Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for nest CLI)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main"]
```

Create `backend/.dockerignore`:

```
node_modules
dist
.env
.git
.gitignore
README.md
npm-debug.log
coverage
.vscode
```

### Step 2: Create Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Dependencies stage
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept build argument for API URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
```

Create `frontend/.dockerignore`:

```
node_modules
.next
.env.local
.git
.gitignore
README.md
npm-debug.log
.vscode
```

### Step 3: Update docker-compose.yml

Update `docker-compose.yml` in project root:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: fullstack-postgres
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: shopdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: fullstack-backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: admin
      DATABASE_PASSWORD: admin123
      DATABASE_NAME: shopdb
      JWT_SECRET: your-super-secret-jwt-key-change-this
      JWT_EXPIRES_IN: 1d
      PORT: 3001
      NODE_ENV: production
    depends_on:
      - postgres
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: fullstack-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - backend
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### Step 4: Test Docker Setup Locally

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes (clean start)
docker-compose down -v
```

---

## Part 2: Deploy to Render

### Prerequisites

1. Create a [Render account](https://render.com)
2. Push your code to GitHub
3. Ensure your repository is public or connected to Render

### Step 1: Deploy PostgreSQL Database

1. Go to Render Dashboard
2. Click **New** → **PostgreSQL**
3. Configure:
   - **Name**: `fullstack-shop-db`
   - **Database**: `shopdb`
   - **User**: `admin`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **Create Database**
5. **Save the connection details** (Internal Database URL)

### Step 2: Deploy Backend

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:

   - **Name**: `fullstack-shop-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci --include=dev && npm run build`
   - **Start Command**: `node dist/main`
   - **Plan**: Free

4. **Add Environment Variables**:

   **Important**: Render requires individual DATABASE\_\* variables, not DATABASE_URL

   ```
   DATABASE_HOST=<from-render-postgres-internal-host>
   DATABASE_PORT=5432
   DATABASE_USER=admin
   DATABASE_PASSWORD=<from-render-postgres>
   DATABASE_NAME=shopdb
   JWT_SECRET=<generate-strong-secret>
   JWT_EXPIRES_IN=1d
   PORT=3001
   NODE_ENV=production
   ```

   **Note**: Get the individual connection details from your PostgreSQL service on Render.

5. Click **Create Web Service**

### Step 3: Deploy Frontend

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:

   - **Name**: `fullstack-shop-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `frontend/Dockerfile`
   - **Docker Build Context Directory**: `frontend`
   - **Plan**: Free

4. **Add Build Args** (important for Docker build):

   In the "Advanced" section, add:

   ```
   NEXT_PUBLIC_API_URL=https://fullstack-shop-backend.onrender.com
   ```

5. **Add Environment Variables** (for runtime):

   ```
   NEXT_PUBLIC_API_URL=https://fullstack-shop-backend.onrender.com
   ```

   _(Replace with your actual backend URL from Render)_

6. Click **Create Web Service**

**Deployment URLs** (example):

- Backend: https://fullstack-shop-backend.onrender.com
- Frontend: https://fullstack-shop-frontend.onrender.com

### Step 4: Update CORS Configuration

Update `backend/src/main.ts` for production CORS:

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with specific origins in production
  const allowedOrigins = [
    "http://localhost:3000",
    "https://fullstack-shop-frontend.onrender.com", // Your frontend URL
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
```

### Step 5: Push Changes to GitHub

```bash
git add .
git commit -m "Add Docker and production configuration"
git push origin main
```

Render will automatically redeploy when you push to GitHub.

---

## Part 3: Advanced Docker Setup

### Docker Compose for Different Environments

Create `docker-compose.dev.yml` for development:

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: fullstack-postgres-dev
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: shopdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    container_name: fullstack-backend-dev
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USER: admin
      DATABASE_PASSWORD: admin123
      DATABASE_NAME: shopdb
      JWT_SECRET: dev-secret
      JWT_EXPIRES_IN: 7d
      PORT: 3001
      NODE_ENV: development
    depends_on:
      - postgres
    command: npm run start:dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    container_name: fullstack-frontend-dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/.next
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001
    depends_on:
      - backend
    command: npm run dev

volumes:
  postgres_data_dev:
```

Create `backend/Dockerfile.dev`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
```

Create `frontend/Dockerfile.dev`:

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

Run development environment:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Health Check Configuration

Update production `docker-compose.yml` with health checks:

```yaml
services:
  postgres:
    # ... previous config
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d shopdb"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    # ... previous config
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    # ... previous config
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

Add health endpoint to backend `backend/src/app.controller.ts`:

```typescript
import { Controller, Get } from "@nestjs/common";
import { Public } from "./auth/decorators/public.decorator";

@Controller()
export class AppController {
  @Public()
  @Get("health")
  healthCheck() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
```

---

## Part 4: Environment Variable Management

### Create Environment Template Files

Create `backend/.env.example`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=shopdb

PORT=3001
NODE_ENV=development

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1d
```

Create `frontend/.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Production Environment Checklist

- [ ] Use strong JWT secret
- [ ] Enable HTTPS
- [ ] Set appropriate CORS origins
- [ ] Use production database
- [ ] Configure database connection pooling
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Use secrets management (e.g., AWS Secrets Manager)

---

## Part 5: CI/CD for Deployment

### GitHub Actions for Docker Build

Create `.github/workflows/docker.yml`:

```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build Backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: false
          tags: fullstack-backend:latest

  build-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Build Frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: false
          tags: fullstack-frontend:latest
```

---

## Testing Deployment

### Local Docker Testing

```bash
# Build and start
docker-compose up --build

# Test backend health
curl http://localhost:3001/health

# Test frontend
curl http://localhost:3000

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Production Testing on Render

1. **Backend Health Check**:

   ```bash
   curl https://your-backend.onrender.com/health
   ```

2. **Test API endpoints**:

   ```bash
   curl https://your-backend.onrender.com/products
   ```

3. **Test Frontend**:
   - Open browser to your frontend URL
   - Register a new user
   - Login
   - Create products and orders

---

## Monitoring and Maintenance

### View Logs on Render

1. Go to your service dashboard
2. Click on **Logs** tab
3. View real-time logs

### Database Backup on Render

1. Go to your PostgreSQL dashboard
2. Click on **Backups** tab
3. Configure automatic backups (available on paid plans)

### Manual Database Backup

```bash
# Export database
docker exec fullstack-postgres pg_dump -U admin shopdb > backup.sql

# Import database
docker exec -i fullstack-postgres psql -U admin shopdb < backup.sql
```

---

## Troubleshooting

### Container Won't Start

- Check logs: `docker-compose logs backend`
- Verify environment variables
- Ensure ports aren't already in use

### Database Connection Issues

- Verify DATABASE_HOST is correct for Docker network
- Check PostgreSQL is running: `docker-compose ps`
- Test connection: `docker exec -it fullstack-postgres psql -U admin -d shopdb`

### CORS Errors in Production

- Verify frontend URL in CORS configuration
- Check environment variables are set correctly
- Ensure HTTPS is used in production

### Render Deployment Issues

- Check build logs in Render dashboard
- Verify environment variables are set
- Ensure start command is correct
- Check for out of memory errors (common on free tier)

---

## Next Steps

Proceed to [07-documentation.md](./07-documentation.md) to add Swagger API documentation (Bonus).

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Render Documentation](https://render.com/docs)
- [Docker Compose Best Practices](https://docs.docker.com/compose/production/)
- [NestJS Production Deployment](https://docs.nestjs.com/deployment)
