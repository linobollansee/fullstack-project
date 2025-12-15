# Setup - Project Initialization

## Overview

In this guide, you'll set up the complete development environment including:

- Git repository
- NestJS backend
- Next.js frontend
- PostgreSQL database
- GitHub branch protection
- CI/CD workflow

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

### Using Docker

```bash
# Create docker-compose.yml in project root
cat > docker-compose.yml << EOF
services:
  postgres:
    image: postgres:18-alpine
    container_name: fullstack-postgres
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: shopdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
EOF

# Start PostgreSQL
docker-compose up -d

# Verify it's running
docker ps
```

## Step 5: Configure Backend Environment

```bash
cd backend

# Create .env file
cat > .env << EOF
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=shopdb

PORT=3001
NODE_ENV=development
EOF
```

### Update `app.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

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
})
export class AppModule {}
```

### Enable CORS in `main.ts`

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

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
```

## Step 6: Configure Frontend Environment

```bash
cd ../frontend

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
```

## Step 7: Setup GitHub Repository

```bash
# Go back to project root
cd ..

# Create GitHub repository (via GitHub CLI or web interface)
gh repo create fullstack-project --public --source=. --remote=origin

# Or add remote manually
git remote add origin https://github.com/YOUR_USERNAME/fullstack-project.git

# Push to GitHub
git add .
git commit -m "Add NestJS backend and Next.js frontend"
git push -u origin main
```

## Step 8: Setup Branch Protection

1. Go to your GitHub repository
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** under "Branch protection rules"
4. Branch name pattern: `main`
5. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
6. Click **Create**

## Step 9: Setup CI/CD Workflow

Create `.github/workflows/ci.yml` in project root:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend-tests:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_USER: admin
          POSTGRES_PASSWORD: admin123
          POSTGRES_DB: shopdb_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run tests
        working-directory: ./backend
        run: npm test
        env:
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_USER: admin
          DATABASE_PASSWORD: admin123
          DATABASE_NAME: shopdb_test

  frontend-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run tests
        working-directory: ./frontend
        run: npm test

      - name: Build
        working-directory: ./frontend
        run: npm run build
```

## Step 10: Verify Setup

### Test Backend

```bash
cd backend
npm run start:dev
# Should start on http://localhost:3001
```

### Test Frontend

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

## Project Structure Check

Your project should now look like this:

```
fullstack-project/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── src/
│   ├── test/
│   ├── .env
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── .env.local
│   ├── package.json
│   └── ...
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Next Steps

Proceed to [02-products.md](./02-products.md) to implement the product CRUD functionality.

## Troubleshooting

### PostgreSQL Connection Issues

- Ensure Docker is running: `docker ps`
- Check PostgreSQL logs: `docker logs fullstack-postgres`
- Verify port 5432 is not in use: `netstat -an | grep 5432`

### CORS Issues

- Ensure `app.enableCors()` is called in backend `main.ts`
- Check that frontend is using correct API URL

### CI/CD Failures

- Verify all tests pass locally first
- Check GitHub Actions logs for specific errors
- Ensure environment variables are properly set
