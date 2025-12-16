# Development Workflow

## Git Workflow

### Branch Strategy

We use a simplified Git Flow:

```
main (production-ready code)
  ↑
  └── feature branches
```

### Branch Naming

Use descriptive branch names:
- `feat/add-product-search`
- `fix/login-validation-error`
- `docs/update-api-reference`
- `refactor/simplify-auth-service`
- `test/add-order-e2e-tests`

### Creating a Feature Branch

```bash
# Update main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/your-feature-name
```

### Committing Code

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat(products): add search by name functionality"
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code change that neither fixes bug nor adds feature
- `test`: Adding or updating tests
- `chore`: Changes to build process or tools

**Examples:**
```
feat(auth): implement JWT refresh token
fix(orders): calculate total amount correctly
docs(readme): add installation instructions
refactor(customers): extract validation logic to utils
test(products): add unit tests for product service
chore(deps): update nestjs to 11.0.2
```

### Pushing Changes

```bash
# Push to remote
git push origin feat/your-feature-name
```

### Creating Pull Requests

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your feature branch
4. Fill in PR template:
   - **Description**: What does this PR do?
   - **Changes**: List of changes
   - **Testing**: How was this tested?
   - **Screenshots**: If UI changes

### Code Review Process

1. **Submit PR**: Create pull request
2. **CI Checks**: Automated tests must pass
3. **Review**: At least one reviewer approves
4. **Address Feedback**: Make requested changes
5. **Merge**: Squash and merge to main

### Merging

```bash
# Option 1: Squash and merge (recommended for feature branches)
# - Keeps clean history
# - One commit per feature

# Option 2: Rebase and merge
# - Preserves individual commits
# - Linear history
```

## Development Environment

### Prerequisites

Ensure you have installed:
- Node.js 22+
- Docker Desktop
- Git
- VS Code (recommended)

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "mtxr.sqltools",
    "mtxr.sqltools-driver-pg"
  ]
}
```

### Project Setup

```bash
# Clone repository
git clone <repo-url>
cd fullstack-project

# Install dependencies
npm run install:all  # Installs both backend and frontend

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# Generate JWT secret
node secrets/generate-jwt-secret.js
# Copy output to backend/.env JWT_SECRET

# Start database
docker compose up -d postgres

# Start backend (terminal 1)
cd backend
npm run start:dev

# Start frontend (terminal 2)
cd frontend
npm run dev
```

### Development Servers

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api
- **Database**: localhost:5432

## Code Style

### TypeScript

- Use strict mode
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Use enums for constants

```typescript
// ✅ Good
interface CreateProductDto {
  name: string;
  price: number;
}

// ❌ Avoid
function createProduct(data: any) { }
```

### Formatting

- **Prettier**: Automatic formatting
- **ESLint**: Code quality rules
- **Line length**: 80-100 characters
- **Indentation**: 2 spaces

```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Naming Conventions

**Files:**
- Components: `PascalCase.tsx` (e.g., `ProductList.tsx`)
- Services: `kebab-case.service.ts` (e.g., `products.service.ts`)
- DTOs: `kebab-case.dto.ts` (e.g., `create-product.dto.ts`)

**Variables:**
- camelCase for variables and functions
- PascalCase for classes and interfaces
- UPPER_CASE for constants

```typescript
// Variables and functions
const productName = 'Widget';
function calculateTotal() { }

// Classes and interfaces
class ProductService { }
interface Product { }

// Constants
const MAX_ITEMS = 100;
```

## Testing

### Running Tests

```bash
# Backend unit tests
cd backend
npm test

# Backend with coverage
npm run test:cov

# Backend E2E tests
npm run test:e2e

# Frontend tests
cd frontend
npm test

# Frontend in watch mode
npm run test
```

### Writing Tests

**Unit Tests:**
```typescript
describe('ProductsService', () => {
  it('should create a product', async () => {
    const dto = { name: 'Test', price: 10 };
    const result = await service.create(dto);
    expect(result.name).toBe('Test');
  });
});
```

**E2E Tests:**
```typescript
describe('Products (e2e)', () => {
  it('/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200);
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80%+ coverage
- **E2E Tests**: Cover critical paths
- **Component Tests**: All user-facing components

## Database Management

### Accessing Database

```bash
# psql CLI
docker exec -it fullstack-postgres psql -U admin -d shopdb

# Common commands
\dt          # List tables
\d products  # Describe table
SELECT * FROM products;
```

### Schema Changes

**Current (Development):**
1. Modify entity files
2. Restart server (auto-syncs with `synchronize: true`)

**Production (Recommended):**
1. Create migration:
```bash
npm run typeorm migration:generate -- -n AddColumnToProducts
```

2. Run migration:
```bash
npm run typeorm migration:run
```

### Seeding Data

Create seed scripts in `backend/src/seeds/`:

```typescript
// seed.ts
async function seed() {
  const products = [
    { name: 'Widget', price: 10 },
    { name: 'Gadget', price: 20 },
  ];
  
  for (const p of products) {
    await productsRepository.save(p);
  }
}
```

## Debugging

### Backend Debugging (VS Code)

1. **Start debug server:**
```bash
npm run start:debug
```

2. **Attach debugger** (F5 in VS Code)

3. **Set breakpoints** in code

### Frontend Debugging

1. **Browser DevTools**: F12
2. **React DevTools**: Install browser extension
3. **Network Tab**: Monitor API calls

### Common Issues

See [Troubleshooting Guide](../troubleshooting/common-issues.md)

## Code Quality

### Before Committing

Run these checks:

```bash
# Lint
npm run lint

# Format
npm run format

# Tests
npm test

# Type check
npm run build
```

### Pre-commit Hooks (Optional)

Install Husky:
```bash
npm install --save-dev husky
npx husky install
```

Create pre-commit hook:
```bash
npx husky add .husky/pre-commit "npm run lint && npm test"
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=shopdb

# Server
PORT=3001
NODE_ENV=development

# Auth
JWT_SECRET=your-32-character-secret-key
JWT_EXPIRES_IN=1d
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Managing Secrets

- Never commit `.env` files
- Use `.env.example` for documentation
- Generate strong secrets:
```bash
node secrets/generate-jwt-secret.js
```

## Performance Optimization

### Backend

- Use database indexes
- Implement pagination
- Add caching (Redis)
- Optimize queries (avoid N+1)
- Use connection pooling

### Frontend

- Code splitting
- Image optimization
- Lazy loading
- Memoization (`useMemo`, `useCallback`)

## Continuous Integration

### GitHub Actions

Automated checks on every push:
- Linting
- Tests
- Build verification

See `.github/workflows/ci.yml`

### Local CI Simulation

```bash
# Run all checks locally
npm run lint && npm test && npm run build
```

## Documentation

### Code Comments

```typescript
/**
 * Creates a new product in the database
 * @param dto Product creation data
 * @returns Created product with ID
 * @throws ConflictException if product name exists
 */
async create(dto: CreateProductDto): Promise<Product> {
  // Implementation
}
```

### API Documentation

- Use Swagger decorators
- Document all endpoints
- Provide examples

```typescript
@ApiOperation({ summary: 'Create a new product' })
@ApiResponse({ status: 201, description: 'Product created' })
@ApiResponse({ status: 400, description: 'Validation failed' })
```

## Related Documentation

- [Testing Guide](../testing/testing-guide.md)
- [Code Style Guide](./code-style.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)
