# End-to-End (E2E) Testing Guide

## Overview

E2E tests simulate real user scenarios, testing the entire application stack from frontend to backend to database.

---

## Current E2E Setup

### Backend E2E Tests

Located in `backend/test/`:

- `app.e2e-spec.ts` - Application health check
- `products.e2e-spec.ts` - Products API testing
- `jest-e2e.json` - E2E Jest configuration

### Running E2E Tests

```bash
cd backend

# Run all E2E tests
npm run test:e2e

# Run specific E2E test
npm run test:e2e -- products.e2e-spec.ts

# Run with coverage
npm run test:e2e -- --coverage
```

---

## Writing E2E Tests

### Complete User Flow Example

```typescript
// backend/test/user-flow.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('User Purchase Flow (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let customerId: number;
  let productId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Complete purchase flow', async () => {
    // Step 1: Register customer
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'testuser@example.com',
        name: 'Test User',
        password: 'SecurePassword123!',
      })
      .expect(201);

    authToken = registerResponse.body.access_token;
    customerId = registerResponse.body.customer.id;
    
    // Step 2: Create product (as admin)
    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Test Product',
        description: 'E2E Test Product',
        price: 99.99,
        imageUrl: 'https://example.com/product.jpg',
      })
      .expect(201);

    productId = productResponse.body.id;

    // Step 3: Get all products
    await request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'Test Product' }),
          ]),
        );
      });

    // Step 4: Get single product details
    await request(app.getHttpServer())
      .get(`/products/${productId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Test Product');
        expect(res.body.price).toBe('99.99');
      });

    // Step 5: Create order
    const orderResponse = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        customerId,
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
      })
      .expect(201);

    const orderId = orderResponse.body.id;
    expect(orderResponse.body.totalAmount).toBe('199.98');
    expect(orderResponse.body.status).toBe('pending');

    // Step 6: Get customer's orders
    await request(app.getHttpServer())
      .get(`/orders/customer/${customerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(orderId);
      });

    // Step 7: Update order status
    await request(app.getHttpServer())
      .patch(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'completed' })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('completed');
      });

    // Step 8: Get customer details
    await request(app.getHttpServer())
      .get(`/customers/${customerId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.email).toBe('testuser@example.com');
        expect(res.body.password).toBeUndefined(); // Password should not be returned
      });
  });
});
```

---

## Authentication Testing

### Testing Protected Routes

```typescript
describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Register and login
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'auth@example.com',
        name: 'Auth User',
        password: 'Password123!',
      });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'auth@example.com',
        password: 'Password123!',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should deny access without token', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({ customerId: 1, items: [] })
      .expect(401);
  });

  it('should allow access with valid token', async () => {
    await request(app.getHttpServer())
      .get('/customers/1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('should deny access with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/customers/1')
      .set('Authorization', 'Bearer invalid_token')
      .expect(401);
  });
});
```

---

## Database Testing

### Test Database Setup

Create separate test database:

```typescript
// backend/test/test-database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testDatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.TEST_DATABASE_HOST || 'localhost',
  port: parseInt(process.env.TEST_DATABASE_PORT) || 5432,
  username: process.env.TEST_DATABASE_USER || 'test_user',
  password: process.env.TEST_DATABASE_PASSWORD || 'test_password',
  database: process.env.TEST_DATABASE_NAME || 'shopdb_test',
  entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
  synchronize: true, // OK for test database
  dropSchema: true, // Clear database before each test run
};
```

### Database Cleanup

```typescript
describe('Orders E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clear all tables after each test
    const entities = dataSource.entityMetadatas;
    
    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  });

  it('should create order', async () => {
    // Test implementation
  });
});
```

---

## Validation Testing

### Input Validation

```typescript
describe('Product Validation (e2e)', () => {
  it('should reject product with empty name', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({
        name: '',  // Invalid
        price: 10,
        description: 'Valid',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('name should not be empty');
      });
  });

  it('should reject product with negative price', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Valid Product',
        price: -10,  // Invalid
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('price must be a positive number');
      });
  });

  it('should reject product with invalid imageUrl', async () => {
    await request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Valid Product',
        price: 10,
        imageUrl: 'not-a-url',  // Invalid
      })
      .expect(400);
  });
});
```

---

## Error Handling Testing

```typescript
describe('Error Handling (e2e)', () => {
  it('should return 404 for non-existent product', async () => {
    await request(app.getHttpServer())
      .get('/products/99999')
      .expect(404)
      .expect((res) => {
        expect(res.body.message).toContain('not found');
      });
  });

  it('should return 400 for invalid ID format', async () => {
    await request(app.getHttpServer())
      .get('/products/invalid-id')
      .expect(400);
  });

  it('should handle database connection errors', async () => {
    // Simulate database error by closing connection
    // This is advanced testing - use with caution
  });
});
```

---

## Performance Testing

### Response Time Testing

```typescript
describe('Performance (e2e)', () => {
  it('should respond to GET /products within 500ms', async () => {
    const startTime = Date.now();
    
    await request(app.getHttpServer())
      .get('/products')
      .expect(200);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    expect(responseTime).toBeLessThan(500);
  });

  it('should handle concurrent requests', async () => {
    const requests = Array(10).fill(null).map(() =>
      request(app.getHttpServer()).get('/products'),
    );

    const responses = await Promise.all(requests);
    
    responses.forEach((res) => {
      expect(res.status).toBe(200);
    });
  });
});
```

---

## Frontend E2E Testing (Future Enhancement)

### Using Playwright

```bash
npm install --save-dev @playwright/test
```

```typescript
// frontend/e2e/purchase-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete purchase flow', async ({ page }) => {
  // Navigate to home page
  await page.goto('http://localhost:3000');

  // View products
  await expect(page.locator('h1')).toContainText('Products');
  
  // Click on first product
  await page.locator('[data-testid="product-card"]').first().click();

  // Add to cart
  await page.locator('[data-testid="add-to-cart"]').click();

  // Go to cart
  await page.locator('[data-testid="cart-icon"]').click();

  // Proceed to checkout
  await page.locator('button:has-text("Checkout")').click();

  // Fill checkout form
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="name"]', 'Test User');
  
  // Submit order
  await page.click('button:has-text("Place Order")');

  // Verify success
  await expect(page.locator('.success-message')).toBeVisible();
  await expect(page).toHaveURL(/.*order-confirmation/);
});
```

---

## CI/CD Integration

### GitHub Actions E2E Tests

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: shopdb_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run E2E tests
        working-directory: ./backend
        env:
          TEST_DATABASE_HOST: localhost
          TEST_DATABASE_PORT: 5432
          TEST_DATABASE_USER: test_user
          TEST_DATABASE_PASSWORD: test_password
          TEST_DATABASE_NAME: shopdb_test
          JWT_SECRET: test-jwt-secret-key
        run: npm run test:e2e
```

---

## Best Practices

### ✅ DO

1. **Test happy path** (successful scenarios)
2. **Test error scenarios** (failures, edge cases)
3. **Test authentication/authorization**
4. **Clean database between tests**
5. **Use descriptive test names**
6. **Test complete user flows**
7. **Assert on response bodies, not just status codes**
8. **Test data persistence** (check database after operations)

### ❌ DON'T

1. **Test implementation details**
2. **Share state between tests**
3. **Use production database**
4. **Skip cleanup**
5. **Test only happy paths**
6. **Ignore flaky tests**

---

## Troubleshooting

### Tests Failing Intermittently

**Problem:** Random test failures

**Solutions:**
- Clear database between tests
- Use `beforeEach` for setup
- Avoid race conditions (use `await`)
- Increase timeout for slow operations

### Database Connection Issues

**Problem:** "Connection refused" errors

**Solutions:**
- Check test database is running
- Verify environment variables
- Wait for database to be ready (use health checks)

### Port Already in Use

**Problem:** "EADDRINUSE" error

**Solutions:**
```typescript
// Use random port for testing
const app = moduleFixture.createNestApplication();
await app.listen(0);  // Random available port
const url = await app.getUrl();
```

---

## Related Documentation

- [Testing Guide](testing-guide.md)
- [Development Workflow](../development/workflow.md)
- [Debugging Guide](../troubleshooting/debugging.md)
- [CI/CD Setup](../planning/roadmap.md)
