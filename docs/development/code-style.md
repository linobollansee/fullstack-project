# Code Style Guide

## Overview

This guide defines the coding standards and style conventions for the Fullstack Online Shop project.

## General Principles

- **Consistency**: Follow existing patterns in the codebase
- **Readability**: Write code for humans first, computers second
- **Simplicity**: Prefer simple solutions over clever ones
- **Documentation**: Comment complex logic, not obvious code

---

## TypeScript

### Type Annotations

**Always use explicit types:**
```typescript
// ✅ Good
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

// ❌ Avoid
function calculateTotal(price, quantity) {
  return price * quantity;
}
```

**Avoid `any`:**
```typescript
// ❌ Bad
function processData(data: any) {
  return data.map((item: any) => item.name);
}

// ✅ Good
interface DataItem {
  name: string;
  value: number;
}

function processData(data: DataItem[]): string[] {
  return data.map(item => item.name);
}
```

### Interfaces vs Types

**Prefer interfaces for object shapes:**
```typescript
// ✅ Good
interface Product {
  id: number;
  name: string;
  price: number;
}

// Use type for unions, intersections
type Status = 'pending' | 'processing' | 'shipped';
type ProductWithStatus = Product & { status: Status };
```

### Enums

**Use enums for constants:**
```typescript
// ✅ Good
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// ❌ Avoid
const STATUS_PENDING = 'pending';
const STATUS_PROCESSING = 'processing';
```

---

## Naming Conventions

### Variables and Functions

**Use camelCase:**
```typescript
// ✅ Good
const productList = [];
function calculateTotal() {}
const isAuthenticated = true;

// ❌ Bad
const ProductList = [];
const product_list = [];
```

### Classes and Interfaces

**Use PascalCase:**
```typescript
// ✅ Good
class ProductService {}
interface CreateProductDto {}

// ❌ Bad
class productService {}
interface createProductDto {}
```

### Constants

**Use UPPER_SNAKE_CASE:**
```typescript
// ✅ Good
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'http://localhost:3001';

// ❌ Bad
const maxRetryAttempts = 3;
const apiBaseUrl = 'http://localhost:3001';
```

### Files and Folders

**Backend (NestJS):**
- Controllers: `products.controller.ts`
- Services: `products.service.ts`
- DTOs: `create-product.dto.ts`
- Entities: `product.entity.ts`
- Modules: `products.module.ts`

**Frontend (React/Next.js):**
- Components: `ProductList.tsx`
- Pages: `page.tsx`, `products/page.tsx`
- Utilities: `api.ts`, `formatters.ts`
- Types: `types.ts` or `product.types.ts`

### Boolean Variables

**Prefix with is/has/should/can:**
```typescript
// ✅ Good
const isLoading = false;
const hasPermission = true;
const shouldRefresh = false;
const canEdit = user.role === 'admin';

// ❌ Bad
const loading = false;
const permission = true;
```

---

## Code Formatting

### Line Length

**Maximum 80-100 characters per line:**
```typescript
// ✅ Good
const product = await this.productsRepository.findOne({
  where: { id },
  relations: ['orders'],
});

// ❌ Too long
const product = await this.productsRepository.findOne({ where: { id }, relations: ['orders'] });
```

### Indentation

**Use 2 spaces (configured in .editorconfig):**
```typescript
// ✅ Good
function example() {
  if (condition) {
    doSomething();
  }
}
```

### Semicolons

**Always use semicolons:**
```typescript
// ✅ Good
const name = 'Product';
import { Module } from '@nestjs/common';

// ❌ Bad
const name = 'Product'
import { Module } from '@nestjs/common'
```

### Quotes

**Use single quotes for strings:**
```typescript
// ✅ Good
const message = 'Hello world';
import { Injectable } from '@nestjs/common';

// ❌ Bad
const message = "Hello world";
```

**Use template literals for interpolation:**
```typescript
// ✅ Good
const message = `Hello ${name}`;

// ❌ Bad
const message = 'Hello ' + name;
```

### Trailing Commas

**Use trailing commas:**
```typescript
// ✅ Good
const config = {
  host: 'localhost',
  port: 5432,
};

// Makes diffs cleaner when adding items
```

---

## Backend (NestJS) Conventions

### Controllers

```typescript
@Controller('products')
@ApiTags('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  async findAll(): Promise<Product[]> {
    return this.productsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  async create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }
}
```

**Best practices:**
- Use decorators for routing, validation, auth
- Keep controllers thin (business logic in services)
- Use DTOs for request/response
- Add Swagger documentation

### Services

```typescript
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
    this.logger.log('Fetching all products');
    return this.productsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }
}
```

**Best practices:**
- Business logic goes here, not in controllers
- Use dependency injection
- Add logging for important operations
- Throw appropriate HTTP exceptions
- Always await database operations

### DTOs

```typescript
export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Ergonomic wireless mouse' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @Min(0)
  price: number;
}
```

**Best practices:**
- Use class-validator decorators
- Add Swagger decorators for docs
- One DTO per operation (CreateDto, UpdateDto, etc.)
- Update DTOs use PartialType

### Error Handling

```typescript
// ✅ Good - Use NestJS exceptions
throw new NotFoundException('Product not found');
throw new BadRequestException('Invalid price');
throw new UnauthorizedException('Invalid credentials');
throw new ForbiddenException('Access denied');

// ❌ Bad - Don't throw generic errors
throw new Error('Product not found');
```

---

## Frontend (React/Next.js) Conventions

### Components

```typescript
// ✅ Good - Functional component with TypeScript
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleClick = () => {
    onAddToCart(product);
  };

  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <button onClick={handleClick}>Add to Cart</button>
    </div>
  );
}
```

**Best practices:**
- Use functional components with hooks
- Define prop types with interfaces
- Export component as default
- Keep components focused (single responsibility)
- Extract complex logic to custom hooks

### Hooks

```typescript
// ✅ Good - Custom hook
function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { products, loading, error };
}

// Usage
function ProductList() {
  const { products, loading, error } = useProducts();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* render products */}</div>;
}
```

### Event Handlers

**Name with `handle` prefix:**
```typescript
// ✅ Good
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  // ...
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// ❌ Bad
const onSubmit = () => {};  // Reserve "on" for props
const submitForm = () => {};
```

### State Management

```typescript
// ✅ Good - Descriptive state names
const [products, setProducts] = useState<Product[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// ❌ Bad
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
```

---

## Comments

### When to Comment

**Do comment:**
- Complex algorithms or business logic
- Workarounds or non-obvious solutions
- TODOs and FIXMEs

```typescript
// Calculate discount based on customer tier
// Tier 1: 10%, Tier 2: 15%, Tier 3: 20%
function calculateDiscount(price: number, tier: number): number {
  const discountRates = [0.10, 0.15, 0.20];
  return price * (1 - discountRates[tier - 1]);
}

// TODO: Add email validation
// FIXME: Handle edge case when quantity is 0
```

**Don't comment:**
- Obvious code
- Redundant information

```typescript
// ❌ Bad - Obvious
// Get all products
const products = await this.productsService.findAll();

// ✅ Good - Self-explanatory code needs no comment
const products = await this.productsService.findAll();
```

### JSDoc Comments

**For public APIs:**
```typescript
/**
 * Creates a new product in the database
 * 
 * @param dto - Product creation data
 * @returns The created product with generated ID
 * @throws {NotFoundException} If product validation fails
 */
async create(dto: CreateProductDto): Promise<Product> {
  // Implementation
}
```

---

## Import Organization

**Order imports:**
1. Node built-in modules
2. External libraries
3. Internal modules
4. Relative imports

```typescript
// ✅ Good
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';

// ❌ Bad - Random order
import { Product } from './entities/product.entity';
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
```

---

## Error Messages

**Be descriptive and user-friendly:**
```typescript
// ✅ Good
throw new NotFoundException(`Product with ID ${id} not found`);
throw new BadRequestException('Price must be a positive number');

// ❌ Bad
throw new NotFoundException('Not found');
throw new BadRequestException('Invalid input');
```

---

## Testing

### Test File Names

- Unit tests: `*.spec.ts`
- E2E tests: `*.e2e-spec.ts`
- React tests: `*.test.tsx`

### Test Structure

```typescript
describe('ProductsService', () => {
  describe('create', () => {
    it('should create a product successfully', async () => {
      // Arrange
      const dto = { name: 'Test', description: 'Test', price: 10 };
      
      // Act
      const result = await service.create(dto);
      
      // Assert
      expect(result.id).toBeDefined();
      expect(result.name).toBe(dto.name);
    });

    it('should throw error for invalid price', async () => {
      const dto = { name: 'Test', description: 'Test', price: -10 };
      
      await expect(service.create(dto)).rejects.toThrow();
    });
  });
});
```

---

## Linting and Formatting

### ESLint

Run before committing:
```bash
npm run lint
```

### Prettier

Auto-format code:
```bash
npm run format
```

### Pre-commit Hooks

Consider adding Husky:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run lint && npm test"
    }
  }
}
```

---

## Related Documentation

- [Development Workflow](./workflow.md)
- [Testing Guide](../testing/testing-guide.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)
