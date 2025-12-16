# Debugging Guide

## Overview

This guide covers debugging techniques for both backend and frontend development.

## Backend Debugging (NestJS)

### Using VS Code Debugger

**1. Start Debug Mode:**
```bash
cd backend
npm run start:debug
```

**2. Attach Debugger in VS Code:**

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to NestJS",
      "port": 9229,
      "restart": true,
      "stopOnEntry": false,
      "protocol": "inspector"
    }
  ]
}
```

**3. Set Breakpoints:**
- Click left margin next to line numbers
- Red dot appears

**4. Trigger the Code:**
- Make API request that hits your breakpoint
- Execution pauses at breakpoint

**5. Debug Controls:**
- **Continue (F5):** Resume execution
- **Step Over (F10):** Execute current line, move to next
- **Step Into (F11):** Enter function call
- **Step Out (Shift+F11):** Exit current function

### Console Logging

**Basic Logging:**
```typescript
console.log('Product created:', product);
console.error('Error occurred:', error);
console.warn('Warning:', message);
```

**Structured Logging (Better):**
```typescript
import { Logger } from '@nestjs/common';

export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  async create(dto: CreateProductDto) {
    this.logger.log(`Creating product: ${dto.name}`);
    this.logger.debug(`Product details: ${JSON.stringify(dto)}`);
    
    try {
      const product = await this.repository.save(dto);
      this.logger.log(`Product created with ID: ${product.id}`);
      return product;
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

### Database Query Debugging

**Enable Query Logging:**

In `app.module.ts`:
```typescript
TypeOrmModule.forRoot({
  // ... other config
  logging: true,  // Log all queries
  logger: 'advanced-console',  // Pretty print
})
```

**Or selectively:**
```typescript
TypeOrmModule.forRoot({
  logging: ['query', 'error', 'schema'],  // Only specific types
})
```

**View Queries:**
```typescript
// Add .getQuery() to see generated SQL
const query = this.repository
  .createQueryBuilder('product')
  .where('product.price > :price', { price: 10 })
  .getQuery();
  
console.log('Generated SQL:', query);
```

### Testing Individual Services

**Unit Test in Isolation:**
```typescript
// products.service.spec.ts
describe('ProductsService', () => {
  it('should create a product', async () => {
    const dto = { name: 'Test', description: 'Test', price: 10 };
    const result = await service.create(dto);
    
    console.log('Created product:', result);
    expect(result.id).toBeDefined();
  });
});
```

**Run single test:**
```bash
npm test -- products.service.spec.ts
```

### Debugging Validation Issues

**Check DTO Validation:**
```typescript
import { validate } from 'class-validator';

const dto = new CreateProductDto();
dto.name = '';  // Invalid
dto.price = -5;  // Invalid

const errors = await validate(dto);
console.log('Validation errors:', errors);
```

### Inspect Request/Response

**Add Logging Interceptor:**
```typescript
// logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    
    this.logger.log(`➡️ ${method} ${url}`);
    this.logger.debug(`Request body: ${JSON.stringify(body)}`);

    const now = Date.now();
    return next.handle().pipe(
      tap((data) => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.log(`⬅️ ${method} ${url} ${response.statusCode} - ${delay}ms`);
      }),
    );
  }
}
```

Apply globally in `main.ts`:
```typescript
app.useGlobalInterceptors(new LoggingInterceptor());
```

---

## Frontend Debugging (Next.js/React)

### Browser DevTools

**Open DevTools:** Press `F12` or right-click → "Inspect"

**Console Tab:**
```javascript
// Log data
console.log('Products:', products);

// Log with label
console.log('API Response:', { products, loading, error });

// Table format (for arrays)
console.table(products);

// Group logs
console.group('Order Processing');
console.log('Step 1: Validate cart');
console.log('Step 2: Calculate total');
console.groupEnd();
```

**Network Tab:**
1. Open Network tab
2. Make API request
3. Click request to see:
   - Request headers (check Authorization token)
   - Request payload
   - Response data
   - Status code
   - Response time

**React DevTools:**

Install browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

Features:
- Inspect component hierarchy
- View component props and state
- Track re-renders
- Profile performance

### Debugging React Components

**Add Console Logs:**
```typescript
export default function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    console.log('🔄 ProductList: Fetching products');
    
    fetch('http://localhost:3001/products')
      .then(res => {
        console.log('📥 Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('✅ Products loaded:', data);
        setProducts(data);
      })
      .catch(error => {
        console.error('❌ Error loading products:', error);
      });
  }, []);
  
  console.log('🎨 Rendering ProductList with', products.length, 'products');
  
  return (/* JSX */);
}
```

**Debug Infinite Loops:**
```typescript
useEffect(() => {
  console.count('Effect ran');  // Shows how many times effect runs
  fetchData();
}, []); // Empty array = run once. Missing = run on every render!
```

**Debug Stale State:**
```typescript
const [count, setCount] = useState(0);

// ❌ Wrong - uses stale state
const increment = () => {
  setCount(count + 1);
  setCount(count + 1);  // Both use same stale value
};

// ✅ Correct - uses updater function
const increment = () => {
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);  // Uses updated value
};
```

### VS Code Debugger for Frontend

**1. Install Extension:**
- "Debugger for Chrome" or "Debugger for Microsoft Edge"

**2. Add Configuration** (`.vscode/launch.json`):
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/frontend"
    }
  ]
}
```

**3. Set Breakpoints** in `.tsx` files

**4. Start Debug Mode** (F5)

### API Debugging

**Create Debug Utility:**
```typescript
// lib/debug.ts
export const debugApi = (endpoint: string, options?: RequestInit) => {
  console.group(`🌐 API Call: ${endpoint}`);
  console.log('Options:', options);
  console.log('Timestamp:', new Date().toISOString());
  
  return fetch(endpoint, options)
    .then(async (response) => {
      const data = await response.json();
      console.log('Status:', response.status);
      console.log('Data:', data);
      console.groupEnd();
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return data;
    })
    .catch((error) => {
      console.error('API Error:', error);
      console.groupEnd();
      throw error;
    });
};

// Usage
const products = await debugApi('http://localhost:3001/products');
```

### Authentication Debugging

**Check Token:**
```javascript
// Browser console
const token = localStorage.getItem('token');
console.log('Token:', token);

// Decode JWT (without verification)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token payload:', payload);
console.log('Expires at:', new Date(payload.exp * 1000));
```

**Check if Token is Expired:**
```typescript
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

const token = localStorage.getItem('token');
console.log('Token expired?', isTokenExpired(token));
```

---

## Database Debugging

### Connect to Database

```bash
# Using psql
docker exec -it fullstack-postgres psql -U admin -d shopdb

# Common commands:
\dt              # List tables
\d products      # Describe table
\d+ products     # Detailed table info
SELECT * FROM products;
SELECT * FROM customers WHERE email = 'test@example.com';
```

### Check Data

```sql
-- Count records
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;

-- View recent orders
SELECT * FROM orders ORDER BY "createdAt" DESC LIMIT 10;

-- Join orders with items
SELECT o.id, o."customerName", oi.quantity, p.name
FROM orders o
JOIN order_items oi ON o.id = oi."orderId"
JOIN products p ON oi."productId" = p.id;

-- Find orphaned records
SELECT * FROM orders WHERE "customerId" NOT IN (SELECT id FROM customers);
```

### Monitor Queries

**Enable Query Logging in PostgreSQL:**

```bash
# Edit postgresql.conf
docker exec -it fullstack-postgres bash
# Then in container:
echo "log_statement = 'all'" >> /var/lib/postgresql/data/postgresql.conf
```

**View Logs:**
```bash
docker logs fullstack-postgres 2>&1 | grep -i select
```

---

## Testing & Debugging

### Run Tests with Debugging

```bash
# Backend - Run tests in debug mode
npm run test:debug

# Then attach VS Code debugger
```

### Debug Failing Test

```typescript
describe('ProductsService', () => {
  it('should create a product', async () => {
    const dto = { name: 'Test', description: 'Test', price: 10 };
    
    // Add breakpoint here
    const result = await service.create(dto);
    
    console.log('Test result:', result);
    expect(result.id).toBeDefined();
  });
});
```

---

## Docker Debugging

### View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs postgres

# Follow logs in real-time
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

### Inspect Container

```bash
# Container details
docker inspect fullstack-backend

# Enter container shell
docker exec -it fullstack-backend sh

# Check environment variables
docker exec fullstack-backend env
```

### Network Debugging

```bash
# List networks
docker network ls

# Inspect network
docker network inspect fullstack-project_fullstack-network

# Test connectivity between containers
docker exec fullstack-backend ping postgres
```

---

## Performance Debugging

### Measure Response Times

```typescript
// Backend
@Get()
async findAll() {
  const start = Date.now();
  const products = await this.productsService.findAll();
  const duration = Date.now() - start;
  
  this.logger.log(`findAll took ${duration}ms`);
  return products;
}
```

### Profile React Components

Use React DevTools Profiler:
1. Open React DevTools
2. Click "Profiler" tab
3. Click record button
4. Interact with app
5. Stop recording
6. Analyze render times

### Identify Memory Leaks

**Browser:**
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Interact with app
4. Take another snapshot
5. Compare to find leaks

**Common causes:**
- Event listeners not cleaned up
- Intervals/timeouts not cleared
- Subscriptions not unsubscribed

```typescript
// ✅ Clean up in useEffect
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 5000);
  
  return () => clearInterval(interval);  // Cleanup
}, []);
```

---

## Common Debugging Commands

```bash
# Backend
npm run start:dev      # Start with hot reload
npm run start:debug    # Start with debugger
npm test              # Run tests
npm run lint          # Check for errors

# Frontend
npm run dev           # Start dev server
npm run build         # Build for production
npm test              # Run tests

# Database
docker compose logs postgres          # View logs
docker exec -it fullstack-postgres psql -U admin -d shopdb  # Connect

# Docker
docker ps                    # List containers
docker compose down -v       # Stop and remove volumes
docker compose build --no-cache  # Rebuild images
```

---

## Debugging Checklist

When something isn't working:

- [ ] Check terminal/console for error messages
- [ ] Verify environment variables are loaded
- [ ] Confirm services are running (docker ps)
- [ ] Check database connection and data
- [ ] Inspect network requests in browser DevTools
- [ ] Verify JWT token is valid and not expired
- [ ] Check CORS configuration
- [ ] Look for typos in URLs, variable names
- [ ] Review recent code changes
- [ ] Check if issue exists in clean state (restart services)
- [ ] Search error message online
- [ ] Consult [Common Issues](./common-issues.md)

## Related Documentation

- [Common Issues](./common-issues.md)
- [FAQ](./faq.md)
- [Testing Guide](../testing/testing-guide.md)
