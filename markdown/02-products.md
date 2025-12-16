# Products - CRUD Implementation

## Overview

This guide implements a complete CRUD (Create, Read, Update, Delete) application for products:

- Backend REST API with NestJS and TypeORM
- PostgreSQL database with proper entity relationships
- Frontend UI with Next.js App Router
- Comprehensive unit and E2E tests

## Product Model

- **id**: number (auto-generated)
- **name**: string
- **description**: string (text field)
- **price**: number (decimal, precision 10, scale 2)
- **createdAt**: Date (auto-generated)
- **updatedAt**: Date (auto-updated)

---

## Backend Implementation

### Step 1: Generate Product Module

```bash
cd backend

# Generate module, controller, and service
nest generate resource products

# When prompted:
# - What transport layer? REST API
# - Generate CRUD entry points? Yes
```

### Step 2: Create Product Entity

Create `backend/src/products/entities/product.entity.ts`:

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column("text")
  description: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Step 3: Create DTOs

Create `backend/src/products/dto/create-product.dto.ts`:

```typescript
import { IsString, IsNotEmpty, IsNumber, Min } from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;
}
```

Create `backend/src/products/dto/update-product.dto.ts`:

```typescript
import { PartialType } from "@nestjs/mapped-types";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### Step 4: Implement Products Service

Update `backend/src/products/products.service.ts`:

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productsRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto
  ): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }
}
```

### Step 5: Implement Products Controller

Update `backend/src/products/products.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.productsService.remove(+id);
  }
}
```

### Step 6: Update Products Module

Update `backend/src/products/products.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { Product } from "./entities/product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
```

### Step 7: Update App Module

Make sure `backend/src/app.module.ts` imports ProductsModule:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsModule } from "./products/products.module";

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
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
  ],
})
export class AppModule {}
```

### Step 8: Backend Testing

Create `backend/src/products/products.service.spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductsService } from "./products.service";
import { Product } from "./entities/product.entity";
import { NotFoundException } from "@nestjs/common";

describe("ProductsService", () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  const mockProduct = {
    id: 1,
    name: "Test Product",
    description: "Test Description",
    price: 99.99,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
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

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a product", async () => {
      const createDto = {
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
      };

      mockRepository.create.mockReturnValue(mockProduct);
      mockRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe("findAll", () => {
    it("should return an array of products", async () => {
      mockRepository.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(result).toEqual([mockProduct]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a product", async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
    });

    it("should throw NotFoundException if product not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a product", async () => {
      const updateDto = { name: "Updated Product" };
      const updatedProduct = { ...mockProduct, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updatedProduct);
    });
  });

  describe("remove", () => {
    it("should remove a product", async () => {
      mockRepository.findOne.mockResolvedValue(mockProduct);
      mockRepository.remove.mockResolvedValue(mockProduct);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockProduct);
    });
  });
});
```

Create `backend/test/products.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "./../src/app.module";

describe("ProductsController (e2e)", () => {
  let app: INestApplication;
  let createdProductId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true })
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/products (POST)", () => {
    return request(app.getHttpServer())
      .post("/products")
      .send({
        name: "Test Product",
        description: "Test Description",
        price: 99.99,
      })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty("id");
        expect(response.body.name).toBe("Test Product");
        expect(typeof response.body.price).toBe("number");
        createdProductId = response.body.id;
      });
  });

  it("/products (GET)", () => {
    return request(app.getHttpServer())
      .get("/products")
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
  });

  it("/products/:id (GET)", () => {
    return request(app.getHttpServer())
      .get(`/products/${createdProductId}`)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe(createdProductId);
        expect(response.body.name).toBe("Test Product");
      });
  });

  it("/products/:id (PATCH)", () => {
    return request(app.getHttpServer())
      .patch(`/products/${createdProductId}`)
      .send({ price: 149.99 })
      .expect(200)
      .then((response) => {
        expect(typeof response.body.price).toBe("number");
        expect(response.body.price).toBe(149.99);
      });
  });

  it("/products/:id (DELETE)", () => {
    return request(app.getHttpServer())
      .delete(`/products/${createdProductId}`)
      .expect(204);
  });
});
```

Run tests:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## Frontend Implementation

### Step 1: Create API Client

Create `frontend/src/lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
}

export const productsApi = {
  async getAll(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
  },

  async getOne(id: number): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`);
    if (!response.ok) throw new Error("Failed to fetch product");
    return response.json();
  },

  async create(data: CreateProductDto): Promise<Product> {
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create product");
    return response.json();
  },

  async update(id: number, data: UpdateProductDto): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update product");
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete product");
  },
};
```

### Step 2: Create Product List Component

Create `frontend/src/components/ProductList.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Product, productsApi } from "@/lib/api";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productsApi.delete(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete product");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 py-8">{error}</div>;

  return (
    <div className="space-y-4">
      {products.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No products found</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">
                  ${Number(product.price).toFixed(2)}
                </span>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 3: Create Product Form Component

Create `frontend/src/components/ProductForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { productsApi, CreateProductDto } from "@/lib/api";

interface ProductFormProps {
  onSuccess?: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    description: "",
    price: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await productsApi.create(formData);
      setFormData({ name: "", description: "", price: 0 });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to create product");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-lg shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Add New Product</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          required
          rows={3}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium mb-1">
          Price
        </label>
        <input
          type="number"
          id="price"
          required
          min="0"
          step="0.01"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: parseFloat(e.target.value) })
          }
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
```

### Step 4: Create Products Page

Update `frontend/src/app/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import ProductList from "@/components/ProductList";
import ProductForm from "@/components/ProductForm";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleProductCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Products Management
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProductForm onSuccess={handleProductCreated} />
        </div>

        <div className="lg:col-span-2">
          <ProductList key={refreshKey} />
        </div>
      </div>
    </main>
  );
}
```

### Step 5: Frontend Testing

Create `frontend/src/__tests__/ProductList.test.tsx`:

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import ProductList from "@/components/ProductList";
import { productsApi } from "@/lib/api";

jest.mock("@/lib/api");

describe("ProductList", () => {
  const mockProducts = [
    {
      id: 1,
      name: "Test Product",
      description: "Test Description",
      price: 99.99,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ];

  it("renders products", async () => {
    (productsApi.getAll as jest.Mock).mockResolvedValue(mockProducts);

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("Test Product")).toBeInTheDocument();
    });
  });

  it("shows loading state", () => {
    (productsApi.getAll as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<ProductList />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
```

Setup Jest for Next.js by creating `frontend/jest.config.js`:

```javascript
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(customJestConfig);
```

Create `frontend/jest.setup.js`:

```javascript
import "@testing-library/jest-dom";
```

Install testing dependencies:

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

Run tests:

```bash
npm test
```

---

## Testing the Complete Flow

1. **Start the backend**:

   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start the frontend**:

   ```bash
   cd frontend
   npm run dev
   ```

3. **Test manually**:

   - Visit http://localhost:3000
   - Create a new product using the form
   - View the product in the list
   - Delete the product

4. **Test API directly**:

   ```bash
   # Create a product
   curl -X POST http://localhost:3001/products \
     -H "Content-Type: application/json" \
     -d '{"name":"Laptop","description":"High-end laptop","price":1299.99}'

   # Get all products
   curl http://localhost:3001/products

   # Get one product
   curl http://localhost:3001/products/1

   # Update a product
   curl -X PATCH http://localhost:3001/products/1 \
     -H "Content-Type: application/json" \
     -d '{"price":1199.99}'

   # Delete a product
   curl -X DELETE http://localhost:3001/products/1
   ```

## Next Steps

Proceed to [03-orders.md](./03-orders.md) to implement order management (optional).

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `docker ps`
- Check `.env` configuration in backend

### CORS Errors

- Verify `app.enableCors()` in `backend/src/main.ts`
- Check API URL in `frontend/.env.local`

### Validation Errors

- Ensure `class-validator` and `class-transformer` are installed
- Verify `ValidationPipe` is enabled in `main.ts`
