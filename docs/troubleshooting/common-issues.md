# Common Issues and Solutions

This guide covers common problems you might encounter and their solutions.

## Table of Contents

- [Database Connection Issues](#database-connection-issues)
- [Authentication Problems](#authentication-problems)
- [CORS Errors](#cors-errors)
- [Build Errors](#build-errors)
- [Runtime Errors](#runtime-errors)
- [Docker Issues](#docker-issues)
- [Environment Variable Problems](#environment-variable-problems)

---

## Database Connection Issues

### Issue: "ECONNREFUSED" or Cannot Connect to Database

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Causes & Solutions:**

1. **Docker not running**
   ```bash
   # Check if Docker is running
   docker ps
   
   # Start Docker Desktop
   # Then start the database
   docker compose up -d postgres
   ```

2. **Wrong database host**
   - In `backend/.env`, use `DATABASE_HOST=localhost` for local development
   - In Docker Compose, services use `DATABASE_HOST=postgres` (service name)

3. **Port already in use**
   ```bash
   # Check what's using port 5432
   # Windows:
   netstat -ano | findstr :5432
   
   # Kill the process or change the port in docker-compose.yml
   ```

4. **Database container not healthy**
   ```bash
   # Check container status
   docker ps
   
   # View logs
   docker compose logs postgres
   
   # Restart container
   docker compose restart postgres
   ```

### Issue: "password authentication failed"

**Symptoms:**
```
error: password authentication failed for user "admin"
```

**Solution:**
Verify credentials match in both places:

**`backend/.env`:**
```env
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=shopdb
```

**`.env` (root):**
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
POSTGRES_DB=shopdb
```

If you changed passwords after container creation:
```bash
# Remove old container and volume
docker compose down -v
# Restart with new credentials
docker compose up -d postgres
```

### Issue: Tables Not Created

**Symptoms:**
- Database exists but tables are missing
- Errors like "relation 'products' does not exist"

**Solution:**

With `synchronize: true` (development), tables should auto-create. If not:

1. **Check TypeORM config** in `backend/src/app.module.ts`:
   ```typescript
   synchronize: true, // Should be true in development
   ```

2. **Restart backend** to trigger synchronization:
   ```bash
   cd backend
   npm run start:dev
   ```

3. **Manually create tables** (if needed):
   ```bash
   docker exec -it fullstack-postgres psql -U admin -d shopdb
   ```

---

## Authentication Problems

### Issue: 401 Unauthorized on Protected Routes

**Symptoms:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Causes & Solutions:**

1. **Token not included**
   ```javascript
   // ✅ Correct
   fetch('http://localhost:3001/products', {
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   
   // ❌ Wrong - missing Authorization header
   fetch('http://localhost:3001/products');
   ```

2. **Token expired**
   - Default expiration: 24 hours
   - Solution: Login again to get new token
   ```javascript
   localStorage.removeItem('token');
   // Redirect to login
   ```

3. **Token format wrong**
   ```javascript
   // ✅ Correct format
   'Authorization': `Bearer eyJhbGciOiJIUzI1NiIs...`
   
   // ❌ Wrong - missing "Bearer " prefix
   'Authorization': `eyJhbGciOiJIUzI1NiIs...`
   ```

4. **JWT secret changed**
   - If you changed `JWT_SECRET` in `.env`, existing tokens are invalid
   - Solution: All users must login again

### Issue: "Invalid credentials" When Logging In

**Symptoms:**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

**Causes:**
1. Wrong email or password
2. User doesn't exist (typo in email)
3. Password case-sensitive (check caps lock)

**Debug Steps:**
```bash
# Check if user exists in database
docker exec -it fullstack-postgres psql -U admin -d shopdb
shopdb=# SELECT id, email FROM customers WHERE email='user@example.com';
```

### Issue: Token Stored But Not Working

**Check localStorage:**
```javascript
// In browser console
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('user'));

// Clear if corrupted
localStorage.clear();
```

---

## CORS Errors

### Issue: CORS Policy Blocking Requests

**Symptoms (Browser Console):**
```
Access to fetch at 'http://localhost:3001/products' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**

1. **Check backend CORS config** in `backend/src/main.ts`:
   ```typescript
   app.enableCors({
     origin: [
       'http://localhost:3000',  // Add your frontend URL
       'https://your-production-url.com',
     ],
     credentials: true,
   });
   ```

2. **Restart backend** after changing CORS config

3. **Check frontend URL** matches exactly:
   - `http://localhost:3000` ≠ `http://127.0.0.1:3000`
   - Port must match

### Issue: CORS Error in Production

**Solution:**
Add production URL to CORS origins:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-production.com',
  ],
  credentials: true,
});
```

---

## Build Errors

### Issue: TypeScript Errors During Build

**Symptoms:**
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
```

**Solutions:**

1. **Check TypeScript version**
   ```bash
   npm list typescript
   ```

2. **Fix type errors**
   - Review error messages
   - Add proper type annotations
   - Use TypeScript strict mode

3. **Clear build cache**
   ```bash
   # Backend
   cd backend
   rm -rf dist
   npm run build
   
   # Frontend
   cd frontend
   rm -rf .next
   npm run build
   ```

### Issue: Module Not Found

**Symptoms:**
```
Cannot find module '@nestjs/common' or its corresponding type declarations
```

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use clean install
npm ci
```

### Issue: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution:**

**Windows:**
```powershell
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

**Alternative:** Change port in `.env`:
```env
PORT=3002
```

---

## Runtime Errors

### Issue: "Cannot read property of undefined"

**Common Cause:** Accessing nested property before data loads

**Solution:**
```typescript
// ❌ Wrong
const userName = user.name;

// ✅ Better - optional chaining
const userName = user?.name;

// ✅ Best - with default
const userName = user?.name || 'Guest';
```

### Issue: Validation Errors Not Showing

**Check:**
1. ValidationPipe enabled in `main.ts`:
   ```typescript
   app.useGlobalPipes(new ValidationPipe({
     whitelist: true,
     transform: true,
   }));
   ```

2. DTO decorators present:
   ```typescript
   import { IsString, IsNotEmpty } from 'class-validator';
   
   export class CreateProductDto {
     @IsString()
     @IsNotEmpty()
     name: string;
   }
   ```

### Issue: Database Queries Returning Stale Data

**Causes:**
1. Missing `await` on async operations
2. Caching issues
3. Transaction not committed

**Solution:**
```typescript
// ✅ Always await database operations
const products = await this.productsRepository.find();
```

---

## Docker Issues

### Issue: Container Won't Start

**Check logs:**
```bash
docker compose logs postgres
docker compose logs backend
docker compose logs frontend
```

**Common solutions:**
```bash
# Stop all containers
docker compose down

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Rebuild images
docker compose build --no-cache

# Start fresh
docker compose up -d
```

### Issue: "no space left on device"

**Solution:**
```bash
# Clean up Docker system
docker system prune -a --volumes

# Warning: This removes unused containers, networks, images, and volumes
```

### Issue: Can't Access Service from Host

**Check port mappings** in `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "3001:3001"  # host:container
```

Ensure host port (left side) matches what you're accessing.

---

## Environment Variable Problems

### Issue: Environment Variables Not Loading

**Symptoms:**
- `undefined` when accessing `process.env.DATABASE_HOST`
- Default values being used

**Solutions:**

1. **Check file exists:**
   - Backend: `backend/.env`
   - Frontend: `frontend/.env.local`

2. **Check file format:**
   ```env
   # ✅ Correct
   DATABASE_HOST=localhost
   JWT_SECRET=your-secret-key
   
   # ❌ Wrong - no spaces around =
   DATABASE_HOST = localhost
   
   # ❌ Wrong - no quotes needed
   DATABASE_HOST="localhost"
   ```

3. **Restart server** after changing `.env`:
   ```bash
   # Kill server (Ctrl+C)
   # Start again
   npm run start:dev
   ```

4. **Frontend variables must start with `NEXT_PUBLIC_`:**
   ```env
   # ✅ Accessible in browser
   NEXT_PUBLIC_API_URL=http://localhost:3001
   
   # ❌ Not accessible in browser
   API_URL=http://localhost:3001
   ```

### Issue: Variables Work Locally But Not in Production

**Solution:**
Set environment variables in hosting platform:
- Render: Environment tab in dashboard
- Heroku: Config Vars in settings
- Vercel: Environment Variables in project settings

---

## Performance Issues

### Issue: API Responses Are Slow

**Diagnosis:**
1. Check database query performance
2. Look for N+1 query problems
3. Missing database indexes

**Solutions:**
```typescript
// ❌ N+1 query problem
const orders = await this.ordersRepository.find();
for (const order of orders) {
  order.items = await this.orderItemsRepository.find({ where: { orderId: order.id } });
}

// ✅ Use relations to load in one query
const orders = await this.ordersRepository.find({
  relations: ['items', 'items.product'],
});
```

---

## Getting More Help

### Enable Debug Logging

**Backend:**
```bash
npm run start:debug
```

**Database Queries:**
Add to TypeORM config:
```typescript
TypeOrmModule.forRoot({
  // ...other config
  logging: true,  // Log all queries
})
```

### Check Application Logs

```bash
# Backend logs (when running npm run start:dev)
# Check terminal output

# Docker logs
docker compose logs -f backend
docker compose logs -f postgres

# Frontend logs
# Check browser console (F12)
```

### Still Stuck?

1. Check [FAQ](./faq.md)
2. Review [Debugging Guide](./debugging.md)
3. Search GitHub issues
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details
   - Relevant code snippets

## Related Documentation

- [FAQ](./faq.md)
- [Debugging Guide](./debugging.md)
- [Development Workflow](../development/workflow.md)
