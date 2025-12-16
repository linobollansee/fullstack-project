# Environment Variables Reference

## Overview

This document lists all environment variables used in the Fullstack Online Shop project.

---

## Backend Environment Variables

**File:** `backend/.env`

### Database Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_HOST` | Yes | - | Database server hostname (`localhost` for local dev, `postgres` for Docker) |
| `DATABASE_PORT` | Yes | `5432` | PostgreSQL port |
| `DATABASE_USER` | Yes | - | Database username |
| `DATABASE_PASSWORD` | Yes | - | Database password |
| `DATABASE_NAME` | Yes | - | Database name |

**Example:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=securePassword123
DATABASE_NAME=shopdb
```

### Server Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | Backend server port |
| `NODE_ENV` | No | `development` | Environment (`development`, `production`, `test`) |

**Example:**
```env
PORT=3001
NODE_ENV=development
```

### Authentication

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | - | Secret key for signing JWT tokens (min 32 characters) |
| `JWT_EXPIRES_IN` | No | `1d` | Token expiration time (`1h`, `7d`, `30d`, etc.) |

**Example:**
```env
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRES_IN=1d
```

**Generate secure JWT secret:**
```bash
node scripts/security/generate-secret.js
```

---

## Frontend Environment Variables

**File:** `frontend/.env.local`

### API Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | - | Backend API base URL |

**Example:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Note:** Variables accessible in the browser must be prefixed with `NEXT_PUBLIC_`.

---

## Docker Compose Environment Variables

**File:** `.env` (root directory)

### PostgreSQL Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_USER` | Yes | - | PostgreSQL admin username |
| `POSTGRES_PASSWORD` | Yes | - | PostgreSQL admin password |
| `POSTGRES_DB` | Yes | - | Initial database name |

**Example:**
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=securePassword123
POSTGRES_DB=shopdb
```

### Backend Service

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_HOST` | Yes | - | Database hostname (use service name: `postgres`) |
| `JWT_SECRET` | Yes | - | JWT secret key |
| `JWT_EXPIRES_IN` | No | `1d` | Token expiration |
| `NODE_ENV` | No | `production` | Environment |

### Frontend Service

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | - | Backend API URL |

**Example:**
```env
# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=securePassword123
POSTGRES_DB=shopdb

# Backend
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=securePassword123
DATABASE_NAME=shopdb
JWT_SECRET=your-secure-jwt-secret-key
JWT_EXPIRES_IN=1d
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Environment-Specific Configurations

### Development

```env
# backend/.env
DATABASE_HOST=localhost
NODE_ENV=development
JWT_EXPIRES_IN=7d  # Longer for convenience

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Production

```env
# backend/.env (or set in hosting platform)
DATABASE_HOST=your-production-db-host
NODE_ENV=production
JWT_EXPIRES_IN=1h  # Shorter for security
JWT_SECRET=<very-strong-secret-from-secure-vault>

# frontend/.env.local (or set in hosting platform)
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Testing

```env
# backend/.env.test
DATABASE_HOST=localhost
DATABASE_NAME=shopdb_test
NODE_ENV=test
JWT_SECRET=test-secret-key
```

---

## Security Best Practices

### ✅ DO

- Use strong, random secrets (32+ characters)
- Different passwords for each environment
- Store production secrets in secure vault (AWS Secrets Manager, HashiCorp Vault)
- Use environment variables in hosting platform (not .env files)
- Rotate secrets regularly

### ❌ DON'T

- Commit `.env` files to version control
- Use weak or default secrets
- Reuse passwords across environments
- Hardcode secrets in code
- Share secrets in chat/email

---

## Generating Secure Values

### JWT Secret

```bash
# Using provided script
node scripts/security/generate-secret.js

# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passwords

```bash
# Using OpenSSL
openssl rand -base64 16

# Strong password with special characters
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

---

## Accessing Environment Variables

### Backend (NestJS)

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getDbHost(): string {
    return this.configService.get<string>('DATABASE_HOST');
  }
  
  // With default value
  getPort(): number {
    return this.configService.get<number>('PORT', 3001);
  }
}
```

### Frontend (Next.js)

```typescript
// ✅ Accessible in browser (prefixed with NEXT_PUBLIC_)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ❌ Not accessible in browser
const secret = process.env.JWT_SECRET;  // undefined in browser

// Server-side only (in API routes, getServerSideProps)
export async function getServerSideProps() {
  const secret = process.env.SOME_SERVER_SECRET;  // Works here
  return { props: {} };
}
```

---

## Troubleshooting

### Variables Not Loading

**Problem:** `undefined` when accessing variable

**Solutions:**
1. Check file exists (`.env` not `.env.txt`)
2. Restart server after changing `.env`
3. Check variable name spelling
4. For frontend, ensure `NEXT_PUBLIC_` prefix
5. No spaces around `=` sign
6. No quotes around values (usually)

### Wrong Values in Docker

**Problem:** Environment variables not matching between services

**Solution:**
- Check `.env` file in root directory
- Verify `docker-compose.yml` environment section
- Rebuild containers: `docker compose build --no-cache`
- Recreate containers: `docker compose up --force-recreate`

### Sensitive Data in Logs

**Problem:** Secrets appearing in logs

**Solution:**
```typescript
// ❌ Don't log secrets
console.log('JWT Secret:', process.env.JWT_SECRET);

// ✅ Log only that it exists
console.log('JWT Secret:', process.env.JWT_SECRET ? '***SET***' : 'NOT SET');
```

---

## Example Files

### `.env.example` (Backend)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=CHANGE_THIS
DATABASE_NAME=shopdb

# Server
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=GENERATE_WITH_generate-jwt-secret.js
JWT_EXPIRES_IN=1d
```

### `.env.local.example` (Frontend)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### `.env.example` (Root)

```env
# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=CHANGE_THIS
POSTGRES_DB=shopdb

# Backend
DATABASE_HOST=postgres
DATABASE_PORT=5432
JWT_SECRET=GENERATE_WITH_generate-jwt-secret.js
JWT_EXPIRES_IN=1d
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## CI/CD Environment Variables

### GitHub Actions

Set in repository settings:
- Settings → Secrets and variables → Actions
- Add repository secrets

Common secrets:
- `DATABASE_URL`
- `JWT_SECRET`
- `DEPLOYMENT_TOKEN`

---

## Production Deployment

### Render

Set environment variables in dashboard:
- Dashboard → Service → Environment
- Add each variable individually

### Heroku

```bash
heroku config:set JWT_SECRET=your-secret
heroku config:set DATABASE_URL=postgresql://...
```

### Vercel

```bash
vercel env add JWT_SECRET
vercel env add NEXT_PUBLIC_API_URL
```

---

## Related Documentation

- [Setup Guide](../guides/01-setup.md)
- [Deployment Guide](../guides/06-deployment.md)
- [Security Guidelines](../security/guidelines.md)
- [Troubleshooting](../troubleshooting/common-issues.md#environment-variable-problems)
