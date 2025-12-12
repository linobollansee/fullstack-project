# Complete Project File Reference

**Project:** Full-Stack E-Commerce Shop  
**Generated:** December 2025  
**Tech Stack:** NestJS, Next.js, PostgreSQL, Docker, TypeScript

---

## 📁 Root Directory

### `.env`

**Technology:** Environment variables  
**Functionality:** Contains actual secrets for local development (gitignored)  
**Intention:** Store sensitive credentials outside version control  
**Little Known Facts:**

- Referenced by docker-compose.yml using `${VARIABLE}` syntax
- Overrides any defaults from .env.example
- Not committed to git for security

### `.env.example`

**Technology:** Environment variables template  
**Functionality:** Template showing all required environment variables with placeholder values  
**Intention:** Guide developers on what environment variables to configure  
**Little Known Facts:**

- Use `generate-jwt-secret.js` to create a real JWT_SECRET
- Contains instructions for generating secure secrets
- Safe to commit to version control

### `.gitignore`

**Technology:** Git configuration  
**Functionality:** Excludes files/directories from version control  
**Intention:** Prevent committing dependencies, secrets, and build artifacts  
**Little Known Facts:**

- Excludes both root and nested .env files
- Ignores node_modules at all levels
- Excludes .next, dist, and build directories

### `CHALLENGE.md`

**Technology:** Markdown documentation  
**Functionality:** Original project requirements and specifications  
**Intention:** Define the full-stack challenge requirements  
**Little Known Facts:**

- All requirements verified as 100% complete
- Used as acceptance criteria for project completion
- Contains bonus objectives (all implemented)

### `docker-compose.yml`

**Technology:** Docker Compose v3.8  
**Functionality:** Orchestrates PostgreSQL, backend, and frontend services locally  
**Intention:** One-command local development environment setup  
**Little Known Facts:**

- Uses ${VARIABLE} references to .env file (security best practice)
- Previously had hardcoded passwords (now externalized)
- PostgreSQL persists data in named volume `postgres_data`
- All services on same network for container communication

### `package.json`

**Technology:** npm workspace management  
**Functionality:** Root-level scripts for managing both backend and frontend  
**Intention:** Convenience commands to run entire stack  
**Little Known Facts:**

- `npm start` launches all services (DB, backend, frontend)
- `npm run install:all` installs dependencies for both apps
- `npm run test:backend` runs backend tests from root
- No dependencies—pure script orchestration file

### `README.md`

**Technology:** Markdown documentation  
**Functionality:** Primary project documentation and setup guide  
**Intention:** Provide comprehensive overview and quick start instructions  
**Little Known Facts:**

- Links to detailed walkthrough documents (00-07)
- Contains both Docker and manual setup instructions
- Documents all API endpoints with example curl commands
- Updated to reflect Render deployment URLs

### `PROJECT-STATUS.md`

**Technology:** Markdown documentation  
**Functionality:** Tracks implementation status of all features  
**Intention:** Checklist for project completion tracking  
**Little Known Facts:**

- Generated during development process
- All items marked complete (100%)
- Includes deployment, testing, and documentation status

### `PROJECT-SUMMARY.md`

**Technology:** Markdown documentation  
**Functionality:** Comprehensive project overview and achievements  
**Intention:** High-level summary for stakeholders  
**Little Known Facts:**

- Details technology choices and architecture decisions
- Documents security measures (bcrypt 12 rounds, JWT, etc.)
- Lists production URLs for deployed services

### `TESTING_SETUP.md`

**Technology:** Markdown documentation  
**Functionality:** Documents frontend testing implementation  
**Intention:** Guide for understanding and extending tests  
**Little Known Facts:**

- Created after implementing Jest + React Testing Library
- Documents all 12 test cases across 2 components
- Includes best practices and optional next steps
- Shows how to run tests in development and CI modes

### Walkthrough Documents (`00-overview.md` through `07-documentation.md`)

**Technology:** Markdown documentation  
**Functionality:** Step-by-step implementation guides  
**Intention:** Tutorial-style documentation for building the project from scratch  
**Little Known Facts:**

- 00: Architecture overview and technology justification
- 01: Initial project setup with NestJS and Next.js
- 02: Products API and UI implementation
- 03: Orders system with relationships
- 04: Customers and user management
- 05: JWT authentication and protected routes
- 06: Docker and Render deployment guide
- 07: Swagger, testing, and documentation

---

## 🔧 Helper Scripts

### `generate-jwt-secret.js`

**Technology:** Node.js (cross-platform)  
**Functionality:** Generates cryptographically secure 256-bit JWT secrets  
**Intention:** Provide developers with secure random secrets  
**Little Known Facts:**

- Uses Node's crypto.randomBytes for security
- Works on Windows, Mac, Linux without dependencies
- Outputs base64-encoded 32-byte secret
- Can be run with: `node generate-jwt-secret.js`

### `generate-jwt-secret.sh`

**Technology:** Bash shell script (Unix/Mac)  
**Functionality:** Same as .js version but for bash environments  
**Intention:** Unix/Mac users who prefer shell scripts  
**Little Known Facts:**

- Uses `openssl rand -base64 32`
- Requires OpenSSL (pre-installed on most Unix systems)
- Executable with: `chmod +x generate-jwt-secret.sh && ./generate-jwt-secret.sh`

### `generate-jwt-secret.bat`

**Technology:** Windows Batch file  
**Functionality:** Windows-compatible JWT secret generator  
**Intention:** Windows CMD users without Node.js  
**Little Known Facts:**

- Uses PowerShell under the hood via -Command
- Works in Windows Command Prompt
- Fallback for Windows users who can't run .ps1 files

### `generate-jwt-secret.ps1`

**Technology:** PowerShell script  
**Functionality:** Native PowerShell JWT secret generator  
**Intention:** Windows PowerShell users who want native script  
**Little Known Facts:**

- Uses .NET's RNGCryptoServiceProvider for security
- Requires PowerShell execution policy allowing scripts
- Most secure option for Windows environments
- Run with: `./generate-jwt-secret.ps1`

### `start.sh`

**Technology:** Bash shell script  
**Functionality:** Starts Docker Compose services (Unix/Mac)  
**Intention:** One-command startup for Unix users  
**Little Known Facts:**

- Equivalent to `docker compose up`
- Includes helpful startup messages
- Works on Linux and macOS

### `start.bat`

**Technology:** Windows Batch file  
**Functionality:** Starts Docker Compose services (Windows)  
**Intention:** One-command startup for Windows users  
**Little Known Facts:**

- Uses `docker compose up` (new Docker Compose V2 syntax)
- Works in Windows Command Prompt

### `stop.sh`

**Technology:** Bash shell script  
**Functionality:** Stops all Docker Compose services (Unix/Mac)  
**Intention:** Clean shutdown of development environment  
**Little Known Facts:**

- Equivalent to `docker compose down`
- Stops containers but preserves volumes

### `stop.bat`

**Technology:** Windows Batch file  
**Functionality:** Stops all Docker Compose services (Windows)  
**Intention:** Clean shutdown for Windows users  
**Little Known Facts:**

- Matches stop.sh functionality on Windows

---

## 🔙 Backend Directory

### `backend/.env`

**Technology:** Environment variables  
**Functionality:** Backend-specific environment configuration (gitignored)  
**Intention:** Local development secrets for backend service  
**Little Known Facts:**

- Takes precedence over docker-compose environment variables
- Used when running backend directly with `npm run start:dev`
- Contains DATABASE\_\*, JWT_SECRET, PORT

### `backend/.env.example`

**Technology:** Environment variables template  
**Functionality:** Template for backend environment setup  
**Intention:** Show developers what backend needs configured  
**Little Known Facts:**

- Documents TypeORM synchronize warning
- Includes Render deployment notes
- Different from root .env.example

### `backend/.prettierrc`

**Technology:** Prettier configuration (JSON)  
**Functionality:** Code formatting rules for backend  
**Intention:** Enforce consistent code style  
**Little Known Facts:**

- Single quotes enabled
- Trailing commas set to 'all'
- 2-space indentation
- Auto-generated by Nest CLI

### `backend/Dockerfile`

**Technology:** Docker (Multi-stage build)  
**Functionality:** Containerizes NestJS backend for production  
**Intention:** Deploy backend to Render with Docker  
**Little Known Facts:**

- Uses Node 22-alpine for small image size
- Multi-stage build (dependencies → build → production)
- Uses `npm ci --include=dev` to get nest CLI
- Exposes port 3001 (configurable via PORT env var)
- Final image only contains dist/ and production node_modules

### `backend/eslint.config.mjs`

**Technology:** ESLint 9 (Flat Config)  
**Functionality:** Linting rules for TypeScript code  
**Intention:** Enforce code quality and catch errors  
**Little Known Facts:**

- Uses new flat config format (ESLint 9+)
- TypeScript parser with recommended rules
- Prettier integration disabled (Prettier handles formatting)

### `backend/nest-cli.json`

**Technology:** Nest CLI configuration (JSON)  
**Functionality:** Configures Nest CLI behavior  
**Intention:** Define source root and compiler options  
**Little Known Facts:**

- Sets `src` as sourceRoot
- Configures asset deletion on build
- Auto-generated by Nest CLI

### `backend/package.json`

**Technology:** npm package manifest  
**Functionality:** Dependencies, scripts, and metadata for backend  
**Intention:** Define backend application configuration  
**Little Known Facts:**

- NestJS v11.0.1 (latest major version)
- Bcrypt 6.0.0 with 12 salt rounds (not 10)
- Uses passport-jwt for authentication
- TypeORM for database ORM
- 11 unit tests + 8 E2E tests = 19 total tests
- Scripts include test:watch, test:cov, test:e2e

### `backend/package-lock.json`

**Technology:** npm lock file  
**Functionality:** Locks exact dependency versions  
**Intention:** Reproducible builds across environments  
**Little Known Facts:**

- Over 1000+ transitive dependencies
- Generated by npm ci/install
- Critical for deployment consistency

### `backend/README.md`

**Technology:** Markdown documentation  
**Functionality:** Backend-specific documentation  
**Intention:** Guide for backend development and testing  
**Little Known Facts:**

- Generated by Nest CLI
- Contains scaffold project description
- Could be expanded with API details

### `backend/tsconfig.json`

**Technology:** TypeScript configuration  
**Functionality:** TypeScript compiler options for backend  
**Intention:** Configure TypeScript compilation  
**Little Known Facts:**

- Target ES2021
- Decorators and metadata enabled (required for NestJS)
- Strict mode disabled for flexibility
- Incremental compilation for faster rebuilds

### `backend/tsconfig.build.json`

**Technology:** TypeScript configuration (Build)  
**Functionality:** Extends base tsconfig, excludes test files  
**Intention:** Production build configuration  
**Little Known Facts:**

- Excludes node_modules, test, dist, \**/*spec.ts
- Used by `nest build` command
- Smaller output than development config

---

## 🔙 Backend Source Files

### `backend/src/main.ts`

**Technology:** NestJS Bootstrap (TypeScript)  
**Functionality:** Application entry point, configures server, CORS, Swagger  
**Intention:** Initialize and start the NestJS application  
**Little Known Facts:**

- Debug logging for environment variables (conditional on NODE_ENV)
- CORS configured for production frontend URL
- Swagger UI available at /api
- Root endpoint returns API information JSON (not "Hello World")
- Listens on PORT env var (default 3001)
- ValidationPipe with whitelist enabled

### `backend/src/app.module.ts`

**Technology:** NestJS Module (TypeScript)  
**Functionality:** Root module, imports all feature modules and database  
**Intention:** Wire up the entire application dependency graph  
**Little Known Facts:**

- TypeORM configured with individual DATABASE\_\* env vars
- ConfigModule loads .env files
- Imports: Products, Orders, Customers, Auth modules
- TypeORM synchronize controlled by DATABASE_SYNCHRONIZE env var
- Entities auto-loaded from \*_/_.entity.ts pattern

### `backend/src/app.controller.ts`

**Technology:** NestJS Controller (TypeScript)  
**Functionality:** Handles root endpoint GET /  
**Intention:** Provide API information and health check  
**Little Known Facts:**

- Used to return "Hello World" (changed to JSON API info)
- Returns service name, version, available endpoints
- Public endpoint (no auth required)
- Documented in Swagger with @ApiOperation

### `backend/src/app.controller.spec.ts`

**Technology:** Jest Unit Test (TypeScript)  
**Functionality:** Tests AppController  
**Intention:** Verify root endpoint returns correct data  
**Little Known Facts:**

- Updated from "Hello World" test to match new JSON response
- Tests for object structure, not just string
- Part of 11 unit tests in backend

### `backend/src/app.service.ts`

**Technology:** NestJS Service (TypeScript)  
**Functionality:** Business logic for root endpoint  
**Intention:** Separate concerns (controller vs service)  
**Little Known Facts:**

- getApiInfo() returns structured object
- Could be extended with actual health checks
- Injectable service (dependency injection pattern)

---

## 🔐 Backend Auth Module

### `backend/src/auth/auth.module.ts`

**Technology:** NestJS Module (TypeScript)  
**Functionality:** Configures JWT authentication module  
**Intention:** Set up authentication system  
**Little Known Facts:**

- JwtModule configured globally (isGlobal: true)
- JWT expires in 24 hours (86400s)
- PassportModule with 'jwt' default strategy
- Imports CustomersModule to access customer data

### `backend/src/auth/auth.controller.ts`

**Technology:** NestJS Controller (TypeScript)  
**Functionality:** Handles /auth/register and /auth/login  
**Intention:** Public authentication endpoints  
**Little Known Facts:**

- POST /auth/register creates new customer account
- POST /auth/login validates credentials, returns JWT
- Both endpoints return { access_token: string }
- No auth guard on these endpoints (public access)
- Documented in Swagger with request/response examples

### `backend/src/auth/auth.service.ts`

**Technology:** NestJS Service (TypeScript)  
**Functionality:** Authentication business logic  
**Intention:** Register, login, and token validation  
**Little Known Facts:**

- Uses bcrypt.compare for password validation
- Delegates customer creation to CustomersService
- JWT payload contains { email, sub: id }
- Throws UnauthorizedException for invalid credentials
- validateUser used by JWT strategy

### `backend/src/auth/auth.service.spec.ts`

**Technology:** Jest Unit Test (TypeScript)  
**Functionality:** Tests AuthService methods  
**Intention:** Verify authentication logic  
**Little Known Facts:**

- Mocks CustomersService and JwtService
- Tests successful and failed login scenarios
- Part of backend unit test suite

### `backend/src/auth/jwt.strategy.ts`

**Technology:** Passport Strategy (TypeScript)  
**Functionality:** Validates JWT tokens on protected routes  
**Intention:** Extract and verify JWT from Authorization header  
**Little Known Facts:**

- Extends PassportStrategy(Strategy, 'jwt')
- Extracts bearer token from Authorization header
- Uses JWT_SECRET from environment
- Calls authService.validateUser to get full user object
- Attached user to request.user for use in controllers

### `backend/src/auth/guards/jwt-auth.guard.ts`

**Technology:** NestJS Guard (TypeScript)  
**Functionality:** Protects routes requiring authentication  
**Intention:** Reusable decorator for secured endpoints  
**Little Known Facts:**

- Extends AuthGuard('jwt') from Passport
- Used with @UseGuards(JwtAuthGuard) decorator
- Returns 401 if token missing or invalid
- Applied to products, orders, customers endpoints

### `backend/src/auth/decorators/current-user.decorator.ts`

**Technology:** NestJS Custom Decorator (TypeScript)  
**Functionality:** Extracts authenticated user from request  
**Intention:** Clean way to access current user in controllers  
**Little Known Facts:**

- Custom decorator using createParamDecorator
- Usage: @CurrentUser() user: Customer
- Retrieves user object from request (set by JWT strategy)
- Type-safe alternative to @Req() request

### `backend/src/auth/dto/auth.dto.ts`

**Technology:** Class Validator DTO (TypeScript)  
**Functionality:** Validates register/login request bodies  
**Intention:** Ensure valid email and password format  
**Little Known Facts:**

- RegisterDto extends from CreateCustomerDto
- LoginDto has only email and password (no name)
- @IsEmail() validates email format
- @IsString() and @MinLength(6) for password
- Validation errors return 400 with details

---

## 👥 Backend Customers Module

### `backend/src/customers/customers.module.ts`

**Technology:** NestJS Module (TypeScript)  
**Functionality:** Configures customers feature module  
**Intention:** Encapsulate customer-related code  
**Little Known Facts:**

- TypeOrmModule.forFeature([Customer]) provides repository
- Exports CustomersService for use in AuthModule
- Controller and service registered

### `backend/src/customers/customers.controller.ts`

**Technology:** NestJS Controller (TypeScript)  
**Functionality:** Handles CRUD operations for customers at /customers  
**Intention:** Expose customer management API  
**Little Known Facts:**

- GET /customers returns all customers (added after deployment)
- GET /customers/:id returns single customer by ID
- PATCH /customers/:id updates customer (auth required)
- DELETE /customers/:id soft deletes customer
- All endpoints protected with @UseGuards(JwtAuthGuard)
- Passwords filtered out from responses using transform interceptor

### `backend/src/customers/customers.service.ts`

**Technology:** NestJS Service (TypeScript)  
**Functionality:** Customer business logic and database operations  
**Intention:** Manage customer data with security  
**Little Known Facts:**

- Bcrypt salt rounds = 12 (upgraded from 10 for security)
- findByEmail used for login lookup
- Hashes passwords on create AND update
- Uses TypeORM repository pattern
- Filters password from returned objects

### `backend/src/customers/entities/customer.entity.ts`

**Technology:** TypeORM Entity (TypeScript)  
**Functionality:** Database schema for customers table  
**Intention:** Define customer data model  
**Little Known Facts:**

- @Entity() decorator marks as database table
- id (PK), email (unique), name, password (hashed)
- createdAt and updatedAt timestamps
- @OneToMany relation to Order entity
- password field excluded from Swagger responses

### `backend/src/customers/dto/create-customer.dto.ts`

**Technology:** Class Validator DTO (TypeScript)  
**Functionality:** Validates customer creation requests  
**Intention:** Ensure valid customer data on registration  
**Little Known Facts:**

- @IsEmail() for email validation
- @IsString() @MinLength() for name and password
- Password minimum 6 characters
- Used by both registration and customer creation

### `backend/src/customers/dto/update-customer.dto.ts`

**Technology:** PartialType DTO (TypeScript)  
**Functionality:** Makes all CreateCustomerDto fields optional  
**Intention:** Allow partial updates to customers  
**Little Known Facts:**

- Uses PartialType from @nestjs/mapped-types
- All fields optional for PATCH requests
- Inherits validation rules from CreateCustomerDto

---

## 📦 Backend Products Module

### `backend/src/products/products.module.ts`

**Technology:** NestJS Module (TypeScript)  
**Functionality:** Configures products feature module  
**Intention:** Encapsulate product-related code  
**Little Known Facts:**

- TypeOrmModule.forFeature([Product])
- First feature module implemented in project

### `backend/src/products/products.controller.ts`

**Technology:** NestJS Controller (TypeScript)  
**Functionality:** Handles CRUD operations for products at /products  
**Intention:** Expose product management API  
**Little Known Facts:**

- GET /products (public, no auth required)
- POST /products (auth required for creation)
- GET /products/:id (public)
- PATCH /products/:id (auth required)
- DELETE /products/:id (auth required)
- Mixed auth strategy: reads public, writes protected

### `backend/src/products/products.service.ts`

**Technology:** NestJS Service (TypeScript)  
**Functionality:** Product business logic and database operations  
**Intention:** Manage product catalog  
**Little Known Facts:**

- Uses TypeORM repository
- Decimal type for price stored as string
- findAll(), findOne(), create(), update(), remove()
- No soft delete (unlike customers)

### `backend/src/products/products.service.spec.ts`

**Technology:** Jest Unit Test (TypeScript)  
**Functionality:** Tests ProductsService methods  
**Intention:** Verify product CRUD logic  
**Little Known Facts:**

- Mocks TypeORM repository
- Tests all CRUD operations
- Part of 11 unit tests

### `backend/src/products/entities/product.entity.ts`

**Technology:** TypeORM Entity (TypeScript)  
**Functionality:** Database schema for products table  
**Intention:** Define product data model  
**Little Known Facts:**

- id (PK), name, description, price (decimal)
- @Column({ type: 'decimal', precision: 10, scale: 2 })
- createdAt and updatedAt timestamps
- No relations to other entities

### `backend/src/products/dto/create-product.dto.ts`

**Technology:** Class Validator DTO (TypeScript)  
**Functionality:** Validates product creation requests  
**Intention:** Ensure valid product data  
**Little Known Facts:**

- @IsString() for name and description
- @IsNumber() for price
- Price validation at application level
- Swagger decorators for API documentation

### `backend/src/products/dto/update-product.dto.ts`

**Technology:** PartialType DTO (TypeScript)  
**Functionality:** Makes all CreateProductDto fields optional  
**Intention:** Allow partial updates to products  
**Little Known Facts:**

- Uses PartialType
- Inherits validations

---

## 📋 Backend Orders Module

### `backend/src/orders/orders.module.ts`

**Technology:** NestJS Module (TypeScript)  
**Functionality:** Configures orders feature module  
**Intention:** Encapsulate order-related code  
**Little Known Facts:**

- TypeOrmModule.forFeature([Order, OrderItem])
- Handles both Order and OrderItem entities
- Most complex module due to relationships

### `backend/src/orders/orders.controller.ts`

**Technology:** NestJS Controller (TypeScript)  
**Functionality:** Handles CRUD operations for orders at /orders  
**Intention:** Expose order management API  
**Little Known Facts:**

- All endpoints require authentication (@UseGuards)
- POST /orders creates order with line items
- GET /orders returns user's orders only
- GET /orders/:id returns single order
- PATCH /orders/:id updates order
- DELETE /orders/:id removes order
- Uses @CurrentUser() decorator to scope orders to authenticated user

### `backend/src/orders/orders.service.ts`

**Technology:** NestJS Service (TypeScript)  
**Functionality:** Order business logic with relationships  
**Intention:** Manage orders and order items together  
**Little Known Facts:**

- Creates OrderItem entities from items array
- Calculates totalAmount from order items
- Uses repository.save() for cascading saves
- find() includes relations: ['items', 'customer']
- Scopes queries by customerId for security

### `backend/src/orders/entities/order.entity.ts`

**Technology:** TypeORM Entity (TypeScript)  
**Functionality:** Database schema for orders table  
**Intention:** Define order data model  
**Little Known Facts:**

- @ManyToOne relation to Customer
- @OneToMany relation to OrderItem (cascade: true)
- totalAmount calculated and stored
- status field (pending, processing, completed, cancelled)
- createdAt timestamp

### `backend/src/orders/entities/order-item.entity.ts`

**Technology:** TypeORM Entity (TypeScript)  
**Functionality:** Database schema for order_items table  
**Intention:** Define line items in orders  
**Little Known Facts:**

- @ManyToOne relation to Order
- productName stored denormalized (not FK to Product)
- quantity and price stored per item
- Allows historical orders even if product deleted

### `backend/src/orders/dto/create-order.dto.ts`

**Technology:** Class Validator DTO (TypeScript)  
**Functionality:** Validates order creation requests  
**Intention:** Ensure valid order data with line items  
**Little Known Facts:**

- items array validated with @ValidateNested()
- Each item must have productName, quantity, price
- @Type(() => OrderItemDto) for nested validation
- status validated against enum values

### `backend/src/orders/dto/update-order.dto.ts`

**Technology:** PartialType DTO (TypeScript)  
**Functionality:** Makes all CreateOrderDto fields optional  
**Intention:** Allow partial updates to orders  
**Little Known Facts:**

- Can update status without changing items
- Uses PartialType pattern

---

## 🧪 Backend Tests

### `backend/test/app.e2e-spec.ts`

**Technology:** Jest E2E Test with Supertest (TypeScript)  
**Functionality:** End-to-end test for root endpoint  
**Intention:** Verify API returns correct response  
**Little Known Facts:**

- Uses supertest for HTTP requests
- Tests GET / returns object (not "Hello World")
- Creates full NestJS app for testing
- Part of 8 E2E tests

### `backend/test/products.e2e-spec.ts`

**Technology:** Jest E2E Test with Supertest (TypeScript)  
**Functionality:** End-to-end tests for products API  
**Intention:** Verify full product CRUD flow  
**Little Known Facts:**

- Tests all CRUD operations in sequence
- Uses real database (test environment)
- Cleans up created products after tests
- 7 E2E test cases for products

### `backend/test/jest-e2e.json`

**Technology:** Jest Configuration (JSON)  
**Functionality:** E2E test configuration  
**Intention:** Separate config for integration tests  
**Little Known Facts:**

- moduleFileExtensions: js, json, ts
- rootDir: ..
- testRegex: .e2e-spec.ts$
- Uses ts-jest transform

---

## 🎨 Frontend Directory

### `frontend/.env.local`

**Technology:** Next.js Environment Variables  
**Functionality:** Local frontend configuration (gitignored)  
**Intention:** API URL for local development  
**Little Known Facts:**

- NEXT*PUBLIC_API_URL must have NEXT_PUBLIC* prefix
- Embedded in browser bundle at build time
- Points to http://localhost:3001 locally
- Different from production build

### `frontend/.env.local.example`

**Technology:** Environment variables template  
**Functionality:** Template for frontend environment  
**Intention:** Guide developers on frontend config  
**Little Known Facts:**

- Shows localhost:3001 as default backend URL
- Explains NEXT*PUBLIC* prefix requirement
- Used for development only (not Render deployment)

### `frontend/.gitignore`

**Technology:** Git configuration  
**Functionality:** Excludes frontend build artifacts  
**Intention:** Keep repository clean  
**Little Known Facts:**

- Ignores .next, out, build directories
- Ignores .env\*.local but not .env.local.example
- Next.js specific patterns

### `frontend/Dockerfile`

**Technology:** Docker (Multi-stage build)  
**Functionality:** Containerizes Next.js frontend for production  
**Intention:** Deploy frontend to Render  
**Little Known Facts:**

- Uses Node 22-alpine
- ARG NEXT_PUBLIC_API_URL for build-time injection
- Multi-stage: deps → build → production
- Standalone output mode for smaller images
- Copies public/ and .next/static manually
- Runs as non-root user 'nodejs'
- Exposes port 3000

### `frontend/eslint.config.mjs`

**Technology:** ESLint 9 (Flat Config)  
**Functionality:** Linting rules for frontend  
**Intention:** Enforce React and Next.js best practices  
**Little Known Facts:**

- Extends next/core-web-vitals
- Flat config format (ESLint 9+)

### `frontend/jest.config.js`

**Technology:** Jest Configuration (JavaScript)  
**Functionality:** Test configuration with Next.js support  
**Intention:** Enable Jest testing for React components  
**Little Known Facts:**

- Uses next/jest for Next.js integration
- setupFilesAfterEnv: jest.setup.js
- jsdom test environment for React
- Module path mapping for @/ imports
- Collects coverage from src/\*_/_

### `frontend/jest.setup.js`

**Technology:** Jest Setup (JavaScript)  
**Functionality:** Imports testing library matchers  
**Intention:** Extend Jest with custom matchers  
**Little Known Facts:**

- Imports @testing-library/jest-dom
- Enables toBeInTheDocument(), toBeDisabled(), etc.
- Runs before each test file

### `frontend/next.config.ts`

**Technology:** Next.js Configuration (TypeScript)  
**Functionality:** Next.js build and runtime config  
**Intention:** Configure Next.js behavior  
**Little Known Facts:**

- Type: NextConfig imported from 'next'
- Currently uses default config (empty object)
- Can configure redirects, rewrites, headers, etc.

### `frontend/next-env.d.ts`

**Technology:** TypeScript Declarations  
**Functionality:** Next.js type definitions  
**Intention:** Enable TypeScript support  
**Little Known Facts:**

- Auto-generated by Next.js
- References next/image-types/global
- Should not be edited manually

### `frontend/postcss.config.mjs`

**Technology:** PostCSS Configuration  
**Functionality:** CSS processing configuration  
**Intention:** Configure Tailwind CSS  
**Little Known Facts:**

- Only plugin: @tailwindcss/postcss
- Required for Tailwind v4
- Minimal config (Tailwind v4 is simpler)

### `frontend/package.json`

**Technology:** npm package manifest  
**Functionality:** Frontend dependencies and scripts  
**Intention:** Define frontend application configuration  
**Little Known Facts:**

- Next.js 16.0.10 (React 19 support)
- React 19.2.3 (latest)
- Tailwind CSS v4 (new major version)
- Jest + React Testing Library for tests
- test: jest --watch (development)
- test:ci: jest (CI/CD)
- Only 3 production dependencies (rest are dev)

### `frontend/package-lock.json`

**Technology:** npm lock file  
**Functionality:** Locks frontend dependency versions  
**Intention:** Reproducible builds  
**Little Known Facts:**

- 671 packages total (after adding test deps)
- 1 high severity vulnerability (unaddressed)
- Generated by npm install

### `frontend/README.md`

**Technology:** Markdown documentation  
**Functionality:** Frontend-specific documentation  
**Intention:** Guide for frontend development  
**Little Known Facts:**

- Auto-generated by create-next-app
- Minimal content (could be expanded)

### `frontend/tsconfig.json`

**Technology:** TypeScript Configuration  
**Functionality:** TypeScript compiler options for frontend  
**Intention:** Configure Next.js TypeScript  
**Little Known Facts:**

- Target ES2017
- React JSX mode (react-jsx)
- Module resolution: bundler (Next.js specific)
- Paths: @/_ mapped to ./src/_
- Types: includes jest and @testing-library/jest-dom
- Incremental compilation enabled

---

## 🎨 Frontend Public Assets

### `frontend/public/*.svg`

**Technology:** SVG Images  
**Functionality:** Static assets for Next.js  
**Intention:** Logos and icons  
**Little Known Facts:**

- file.svg, globe.svg, next.svg, vercel.svg, window.svg
- Auto-generated by create-next-app
- Not used in custom implementation
- Could be deleted without breaking app

### `frontend/src/app/favicon.ico`

**Technology:** Icon file  
**Functionality:** Browser tab icon  
**Intention:** Branding  
**Little Known Facts:**

- Default Next.js favicon
- Can be replaced with custom brand icon

---

## 🎨 Frontend App Router Pages

### `frontend/src/app/layout.tsx`

**Technology:** Next.js Root Layout (TypeScript/React)  
**Functionality:** Root layout wrapping all pages  
**Intention:** Provide consistent layout and AuthProvider  
**Little Known Facts:**

- Wraps app with AuthContextProvider
- Includes Navigation component
- Metadata for SEO (title, description)
- Uses globals.css for Tailwind
- Required file in Next.js App Router

### `frontend/src/app/page.tsx`

**Technology:** Next.js Page (TypeScript/React)  
**Functionality:** Home page at /  
**Intention:** Display product catalog  
**Little Known Facts:**

- Shows ProductList and ProductForm components
- Default landing page
- Public access (no auth required)
- Styled with Tailwind

### `frontend/src/app/globals.css`

**Technology:** CSS (Tailwind)  
**Functionality:** Global styles and Tailwind directives  
**Intention:** Import Tailwind and define global styles  
**Little Known Facts:**

- @import "tailwindcss" for Tailwind v4
- Single import (simpler than v3)
- Custom global styles can be added here

### `frontend/src/app/auth/login/page.tsx`

**Technology:** Next.js Page (TypeScript/React)  
**Functionality:** Login page at /auth/login  
**Intention:** User authentication  
**Little Known Facts:**

- Shows LoginForm component
- Public route (no auth required)
- Redirects to / on successful login

### `frontend/src/app/auth/register/page.tsx`

**Technology:** Next.js Page (TypeScript/React)  
**Functionality:** Registration page at /auth/register  
**Intention:** New user signup  
**Little Known Facts:**

- Shows RegisterForm component
- Public route
- Redirects to /auth/login after registration

### `frontend/src/app/customers/page.tsx`

**Technology:** Next.js Page (TypeScript/React)  
**Functionality:** Customers page at /customers  
**Intention:** Display customer list  
**Little Known Facts:**

- Shows CustomerList component
- Protected route (requires auth via component logic)
- Admin-style page for viewing all customers

### `frontend/src/app/orders/page.tsx`

**Technology:** Next.js Page (TypeScript/React)  
**Functionality:** Orders page at /orders  
**Intention:** Manage user orders  
**Little Known Facts:**

- Shows OrderForm and OrderList
- Protected route (requires auth)
- Only shows current user's orders

---

## 🧩 Frontend Components

### `frontend/src/components/Navigation.tsx`

**Technology:** React Component (TypeScript)  
**Functionality:** Top navigation bar with auth state  
**Intention:** Provide site-wide navigation  
**Little Known Facts:**

- Uses useAuth() hook for authentication state
- Shows Login/Register for guests
- Shows Logout for authenticated users
- Links to Home, Orders, Customers
- Tailwind styled with responsive design

### `frontend/src/components/ProductList.tsx`

**Technology:** React Component (TypeScript)  
**Functionality:** Displays list of products with delete functionality  
**Intention:** Product catalog display  
**Little Known Facts:**

- Fetches from productsApi.getAll()
- Delete with confirmation dialog
- Loading and error states
- Grid layout (responsive: md:2 cols, lg:3 cols)
- Shows "No products found" for empty state
- Prices formatted to 2 decimals

### `frontend/src/components/ProductForm.tsx`

**Technology:** React Component (TypeScript)  
**Functionality:** Form to create new products  
**Intention:** Product creation UI  
**Little Known Facts:**

- Calls productsApi.create()
- Client-side validation (required fields)
- Resets form on success
- Error handling with alert()
- Simple form (no auth required for viewing, but API enforces auth)

### `frontend/src/components/OrderList.tsx`

**Technology:** React Component (TypeScript)  
**Functionality:** Displays user's orders  
**Intention:** Order history display  
**Little Known Facts:**

- Fetches from ordersApi.getAll()
- Requires authentication (JWT token from localStorage)
- Shows order items, total, status
- Delete with confirmation
- Formatted timestamps and prices

### `frontend/src/components/OrderForm.tsx`

**Technology:** React Component (TypeScript)  
**Functionality:** Form to create new orders  
**Intention:** Order creation UI  
**Little Known Facts:**

- Dynamic line items (add/remove rows)
- Fetches available products for selection
- Calculates total client-side
- Status dropdown (pending, processing, completed, cancelled)
- Requires authentication

### `frontend/src/components/CustomerList.tsx`

**Technology:** React Component (TypeScript)  
**Functionality:** Displays all customers  
**Intention:** Customer management UI  
**Little Known Facts:**

- Fetches from customersApi.getAll()
- Shows email, name, order count
- No passwords displayed (filtered by backend)
- Loading and error states
- Formatted timestamps

### `frontend/src/components/LoginForm.tsx`

**Technology:** React Component (TypeScript)  
**Functionality:** Login form with email/password  
**Intention:** User authentication UI  
**Little Known Facts:**

- Uses useAuth() hook
- Calls login() from AuthContext
- Redirects to / on success with useRouter()
- Shows error messages
- Loading state during submission
- Proper label-input associations (htmlFor/id) for accessibility
- Required fields validation

### `frontend/src/components/RegisterForm.tsx`

**Technology:** React Component (TypeScript)  
**Functionality:** Registration form  
**Intention:** New user signup UI  
**Little Known Facts:**

- Calls authApi.register()
- Collects name, email, password
- Redirects to /auth/login after success
- Client-side validation
- Loading and error states

---

## 🧩 Frontend Tests

### `frontend/src/components/__tests__/ProductList.test.tsx`

**Technology:** Jest + React Testing Library (TypeScript)  
**Functionality:** Tests ProductList component  
**Intention:** Verify product display and interactions  
**Little Known Facts:**

- 6 test cases
- Mocks @/lib/api (productsApi)
- Tests loading, success, error, empty states
- Tests delete with confirmation and cancellation
- Uses userEvent for realistic interactions
- Part of 12 total frontend tests

### `frontend/src/components/__tests__/LoginForm.test.tsx`

**Technology:** Jest + React Testing Library (TypeScript)  
**Functionality:** Tests LoginForm component  
**Intention:** Verify login functionality  
**Little Known Facts:**

- 6 test cases
- Mocks @/context/AuthContext and next/navigation
- Tests form rendering, input updates, submission
- Tests success and error scenarios
- Tests loading state and disabled button
- Tests required field validation
- Uses userEvent.setup() for interactions

---

## 🔧 Frontend Context & Utilities

### `frontend/src/context/AuthContext.tsx`

**Technology:** React Context (TypeScript)  
**Functionality:** Global authentication state management  
**Intention:** Share auth state across components  
**Little Known Facts:**

- Stores JWT token in localStorage
- Provides login(), logout(), register() functions
- isAuthenticated boolean computed from token presence
- Token stored as 'token' key
- useAuth() custom hook for easy access
- AuthProvider wraps entire app in layout.tsx

### `frontend/src/lib/api.ts`

**Technology:** API Client (TypeScript)  
**Functionality:** Centralized API communication  
**Intention:** Abstract backend API calls  
**Little Known Facts:**

- API_URL from process.env.NEXT_PUBLIC_API_URL
- Token retrieved from localStorage for auth
- Exports: authApi, productsApi, ordersApi, customersApi
- Each API has typed methods (getAll, create, update, delete)
- Uses fetch() with proper headers
- Generic error handling

---

## 🐙 CI/CD

### `.github/workflows/ci.yml`

**Technology:** GitHub Actions (YAML)  
**Functionality:** Automated testing on push/PR  
**Intention:** Ensure code quality before merging  
**Little Known Facts:**

- Two jobs: backend-tests and frontend-tests (parallel)
- Backend uses PostgreSQL service container
- Node.js 22 (matches production)
- npm ci for faster, reproducible installs
- Frontend tests run with test:ci (non-interactive)
- Frontend also runs build to catch build errors
- Separate cache for backend and frontend node_modules
- Triggered on push to main and PRs

---

## 📊 Summary Statistics

- **Total Files:** ~115 (excluding node_modules, .git, build artifacts)
- **Backend Files:** ~45 (TypeScript, JSON, Docker)
- **Frontend Files:** ~35 (TypeScript, TSX, CSS, JSON, Docker)
- **Test Files:** 5 (3 backend, 2 frontend)
- **Documentation Files:** 15+ (Markdown guides and references)
- **Configuration Files:** ~20 (JSON, YAML, JS, MJS)
- **Languages:** TypeScript (primary), JavaScript (config), Bash, PowerShell, Batch, YAML, JSON, CSS
- **Total Tests:** 31 (11 backend unit + 8 backend E2E + 12 frontend)
- **Backend Dependencies:** ~60 direct, ~1000+ transitive
- **Frontend Dependencies:** 15 direct, ~670 transitive
- **Docker Images:** 3 (backend, frontend, postgres)
- **API Endpoints:** 15+ (products, orders, customers, auth)
- **React Components:** 10 (including 2 tested)
- **Database Tables:** 4 (customers, products, orders, order_items)

---

## 🏆 Technology Highlights

### Backend

- **NestJS 11:** Modern Node.js framework with TypeScript
- **TypeORM:** SQL database ORM with entity relationships
- **PostgreSQL 18:** Robust relational database
- **Passport JWT:** Industry-standard authentication
- **Bcrypt:** Password hashing with 12 salt rounds
- **Swagger/OpenAPI:** Auto-generated API documentation
- **Jest + Supertest:** Comprehensive testing (19 tests)

### Frontend

- **Next.js 16:** React framework with App Router
- **React 19:** Latest React with concurrent features
- **TypeScript 5:** Type-safe JavaScript
- **Tailwind CSS 4:** Utility-first CSS framework (latest)
- **Jest + RTL:** React Testing Library for component tests (12 tests)
- **Context API:** State management for authentication

### DevOps

- **Docker:** Multi-stage builds for production
- **Docker Compose:** Local development orchestration
- **GitHub Actions:** CI/CD automation
- **Render:** Cloud deployment platform (PaaS)

### Security

- **JWT tokens:** Stateless authentication
- **Bcrypt 12 rounds:** Secure password hashing
- **Environment variables:** Externalized secrets
- **CORS:** Cross-origin protection
- **Input validation:** Class-validator DTOs
- **Auth guards:** Protected routes

---

_This reference was auto-generated to provide a comprehensive overview of every file in the full-stack e-commerce project. It serves as a quick reference for developers, auditors, and stakeholders to understand the project structure, technologies, and implementation details._
