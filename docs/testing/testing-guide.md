# Testing Guide

## Overview

Comprehensive testing strategy for the Fullstack Online Shop, covering unit tests, integration tests, and end-to-end (E2E) tests.

---

## Testing Stack

### Backend (NestJS)
- **Framework:** Jest
- **Testing utilities:** `@nestjs/testing`
- **HTTP testing:** Supertest
- **Mocking:** Jest mocks

### Frontend (Next.js)
- **Framework:** Jest
- **React testing:** React Testing Library
- **Component testing:** `@testing-library/react`, `@testing-library/jest-dom`
- **User interactions:** `@testing-library/user-event`

---

## Project Structure

```
backend/
├── src/
│   ├── products/
│   │   ├── products.controller.ts
│   │   ├── products.controller.spec.ts      # Unit tests
│   │   ├── products.service.ts
│   │   └── products.service.spec.ts         # Unit tests
│   └── auth/
│       ├── auth.service.ts
│       └── auth.service.spec.ts
├── test/
│   ├── app.e2e-spec.ts                      # E2E tests
│   ├── products.e2e-spec.ts                 # E2E tests
│   └── jest-e2e.json                        # E2E Jest config

frontend/
├── src/
│   └── components/
│       ├── ProductList.tsx
│       └── __tests__/
│           └── ProductList.test.tsx         # Component tests
├── jest.config.js
└── jest.setup.js
```

---

## Running Tests

### Backend

```bash
cd backend

# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run E2E tests
npm run test:e2e

# Run specific test file
npm test -- products.service.spec.ts

# Run tests matching pattern
npm test -- --testNamePattern="create product"
```

### Frontend

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- ProductList.test.tsx
```

---

## Backend Testing

### Unit Tests

#### Service Tests

```typescript
// backend/src/products/products.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  // Mock repository
  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [
        { id: 1, name: 'Product 1', price: 10 },
        { id: 2, name: 'Product 2', price: 20 },
      ];
      mockRepository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(result).toEqual(products);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const createDto = {
        name: 'New Product',
        description: 'Description',
        price: 29.99,
      };
      const savedProduct = { id: 1, ...createDto };

      mockRepository.create.mockReturnValue(createDto);
      mockRepository.save.mockResolvedValue(savedProduct);

      const result = await service.create(createDto);

      expect(result).toEqual(savedProduct);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      const product = { id: 1, name: 'Product 1', price: 10 };
      mockRepository.findOne.mockResolvedValue(product);

      const result = await service.findOne(1);

      expect(result).toEqual(product);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when product not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        'Product with ID 999 not found',
      );
    });
  });
});
```

#### Controller Tests

```typescript
// backend/src/products/products.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const products = [{ id: 1, name: 'Product 1' }];
      mockProductsService.findAll.mockResolvedValue(products);

      const result = await controller.findAll();

      expect(result).toEqual(products);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto = { name: 'New Product', price: 29.99 };
      const createdProduct = { id: 1, ...createDto };
      mockProductsService.create.mockResolvedValue(createdProduct);

      const result = await controller.create(createDto);

      expect(result).toEqual(createdProduct);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });
});
```

---

### Integration / E2E Tests

```typescript
// backend/test/products.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '../src/products/entities/product.entity';
import { Repository } from 'typeorm';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let productRepository: Repository<Product>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    productRepository = moduleFixture.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await productRepository.clear();
  });

  describe('/products (POST)', () => {
    it('should create a new product', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 29.99,
          imageUrl: 'https://example.com/image.jpg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Test Product');
          expect(res.body.price).toBe('29.99');
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 400 for invalid data', () => {
      return request(app.getHttpServer())
        .post('/products')
        .send({
          name: '',  // Invalid: empty name
          price: -10,  // Invalid: negative price
        })
        .expect(400);
    });
  });

  describe('/products (GET)', () => {
    it('should return all products', async () => {
      // Seed data
      await productRepository.save([
        { name: 'Product 1', price: 10, description: 'Desc 1' },
        { name: 'Product 2', price: 20, description: 'Desc 2' },
      ]);

      return request(app.getHttpServer())
        .get('/products')
        .expect(200)
        .expect((res) => {
          expect(res.body.length).toBe(2);
          expect(res.body[0].name).toBe('Product 1');
        });
    });
  });

  describe('/products/:id (GET)', () => {
    it('should return a single product', async () => {
      const product = await productRepository.save({
        name: 'Test Product',
        price: 29.99,
        description: 'Description',
      });

      return request(app.getHttpServer())
        .get(`/products/${product.id}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(product.id);
          expect(res.body.name).toBe('Test Product');
        });
    });

    it('should return 404 for non-existent product', () => {
      return request(app.getHttpServer())
        .get('/products/9999')
        .expect(404);
    });
  });

  describe('/products/:id (PATCH)', () => {
    it('should update a product', async () => {
      const product = await productRepository.save({
        name: 'Original Name',
        price: 10,
        description: 'Original',
      });

      return request(app.getHttpServer())
        .patch(`/products/${product.id}`)
        .send({ name: 'Updated Name', price: 15 })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated Name');
          expect(res.body.price).toBe('15');
        });
    });
  });

  describe('/products/:id (DELETE)', () => {
    it('should delete a product', async () => {
      const product = await productRepository.save({
        name: 'To Delete',
        price: 10,
        description: 'Delete me',
      });

      await request(app.getHttpServer())
        .delete(`/products/${product.id}`)
        .expect(200);

      // Verify deletion
      const found = await productRepository.findOne({
        where: { id: product.id },
      });
      expect(found).toBeNull();
    });
  });
});
```

---

## Frontend Testing

### Component Tests

```typescript
// frontend/src/components/__tests__/ProductList.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductList from '../ProductList';

// Mock fetch
global.fetch = jest.fn();

describe('ProductList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}),  // Never resolves
    );

    render(<ProductList />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 10, description: 'Desc 1' },
      { id: 2, name: 'Product 2', price: 20, description: 'Desc 2' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  it('renders error message on fetch failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error'),
    );

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('calls onProductClick when product is clicked', async () => {
    const mockOnClick = jest.fn();
    const mockProducts = [
      { id: 1, name: 'Product 1', price: 10 },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    render(<ProductList onProductClick={mockOnClick} />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Product 1'));

    expect(mockOnClick).toHaveBeenCalledWith(1);
  });
});
```

### Form Testing

```typescript
// frontend/src/components/__tests__/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../LoginForm';

describe('LoginForm', () => {
  it('submits form with email and password', async () => {
    const mockOnSubmit = jest.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const user = userEvent.setup();

    // Fill out form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('shows validation errors for empty fields', async () => {
    const mockOnSubmit = jest.fn();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const user = userEvent.setup();

    // Submit without filling
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

---

## Test Coverage

### Generate Coverage Reports

```bash
# Backend
cd backend
npm run test:cov

# Frontend
cd frontend
npm test -- --coverage
```

### Coverage Output

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   85.23 |    78.45 |   82.67 |   85.89 |
 products/            |   92.31 |    87.50 |   91.67 |   93.75 |
  products.service.ts |   95.00 |    90.00 |   92.86 |   96.00 |
  products.controller |   88.89 |    83.33 |   90.00 |   90.91 |
----------------------|---------|----------|---------|---------|
```

### Coverage Goals

- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Lines:** > 80%

---

## Best Practices

### ✅ DO

1. **Write tests first** (TDD) or alongside code
2. **Test behavior, not implementation**
3. **Use descriptive test names** (`it('should create product with valid data')`)
4. **Arrange-Act-Assert pattern**
5. **Mock external dependencies** (database, API calls)
6. **Clean up after tests** (clear database, reset mocks)
7. **Test edge cases** (null, undefined, empty strings, negative numbers)
8. **Test error handling**

### ❌ DON'T

1. **Test implementation details**
2. **Write brittle tests** (depending on exact text/styling)
3. **Share state between tests**
4. **Skip cleanup**
5. **Test third-party libraries**
6. **Over-mock** (mock only what's necessary)

---

## Related Documentation

- [E2E Testing Guide](e2e-testing.md)
- [CI/CD Pipeline](../planning/roadmap.md#ci-cd)
- [Code Style Guide](../development/code-style.md)
- [Troubleshooting Tests](../troubleshooting/debugging.md#test-failures)
