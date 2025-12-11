# Fullstack Online Shop

A complete fullstack e-commerce application built with NestJS, Next.js, PostgreSQL, and JWT authentication.

## 🚀 Features

### Backend (NestJS)

- **Products Management**: Full CRUD API for products
- **Orders Management**: Create and manage orders with multiple products
- **Customer Management**: User accounts with password hashing (bcrypt)
- **JWT Authentication**: Secure login/register with JWT tokens
- **Authorization**: User-specific data access control
- **TypeORM**: Database ORM with PostgreSQL
- **Validation**: Request validation with class-validator
- **Swagger Documentation**: Interactive API docs at `/api`
- **Testing**: Unit and E2E tests with Jest

### Frontend (Next.js 15)

- **Modern Stack**: App Router, TypeScript, Tailwind CSS
- **Product Management**: Create, list, update, and delete products
- **Order Management**: Place orders with multiple products
- **Customer Portal**: View customer list and order history
- **Authentication**: Login/Register with JWT token management
- **Auth Context**: Global authentication state management
- **Responsive Design**: Mobile-friendly UI with Tailwind

### Infrastructure

- **Docker**: Containerized services with Docker Compose
- **PostgreSQL**: Robust relational database
- **CI/CD**: GitHub Actions for automated testing
- **Environment Config**: Secure configuration management

## 📋 Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, Passport, JWT, bcrypt
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL 15
- **Testing**: Jest, Supertest
- **DevOps**: Docker, Docker Compose, GitHub Actions

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- Docker Desktop
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fullstack-project
```

### 2. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd frontend
npm install
```

### 3. Environment Configuration

**Backend** (`backend/.env`):

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=admin123
DATABASE_NAME=shopdb
PORT=3001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=1d
```

**Frontend** (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run the Application

**Quick Start (Recommended):**

Windows:

```bash
start.bat
```

Linux/Mac:

```bash
./start.sh
```

This will automatically start:

- PostgreSQL database
- Backend API (in a new terminal on Windows)
- Frontend app (in a new terminal on Windows)

**Manual Start:**

Start Database:

```bash
docker compose up -d postgres
```

Start Backend (Terminal 1):

```bash
cd backend
npm run start:dev
```

Start Frontend (Terminal 2):

```bash
cd frontend
npm run dev
```

**Stop All Services:**

Windows:

```bash
stop.bat
```

Linux/Mac:

```bash
./stop.sh
```

## 🌐 Access the Application

### Main Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api
- **Database**: localhost:5432

### Frontend Pages

- **Home/Products**: http://localhost:3000
- **Login**: http://localhost:3000/auth/login
- **Register**: http://localhost:3000/auth/register
- **Orders**: http://localhost:3000/orders
- **Customers**: http://localhost:3000/customers

### API Endpoints

#### Authentication (Public)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

#### Products

- 🔓 `GET /products` - List all products (public)
- 🔓 `GET /products/:id` - Get product by ID (public)
- 🔒 `POST /products` - Create product (requires auth)
- 🔒 `PATCH /products/:id` - Update product (requires auth)
- 🔒 `DELETE /products/:id` - Delete product (requires auth)

#### Orders (🔒 All require authentication)

- 🔒 `GET /orders` - Get user's orders
- 🔒 `GET /orders/:id` - Get order by ID
- 🔒 `POST /orders` - Create new order
- 🔒 `PATCH /orders/:id` - Update order status
- 🔒 `DELETE /orders/:id` - Delete order

#### Customers (🔒 All require authentication)

- 🔒 `GET /customers/me` - Get current user profile
- 🔒 `GET /customers/:id` - Get customer by ID
- 🔒 `PATCH /customers/:id` - Update customer profile
- 🔒 `DELETE /customers/:id` - Delete customer account

**Legend**: 🔓 = Public | 🔒 = Requires JWT Authentication

**Note**: Protected endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing

**Run Backend Tests:**

```bash
cd backend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:e2e        # E2E tests
npm run test:cov        # Coverage report
```

## Docker Deployment

### Build and Run All Services

```bash
docker compose up --build
```

This will start:

- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend app on port 3000

### Stop All Services

```bash
docker compose down
```

### Remove All Data

```bash
docker compose down -v
```

## 📁 Project Structure

```
fullstack-project/
├── backend/
│   ├── src/
│   │   ├── auth/              # JWT authentication module
│   │   ├── customers/         # Customer management
│   │   ├── orders/            # Order management
│   │   ├── products/          # Product management
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Entry point
│   ├── test/                  # E2E tests
│   ├── Dockerfile
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js pages
│   │   ├── components/        # React components
│   │   ├── context/           # Auth context
│   │   └── lib/               # API client
│   ├── Dockerfile
│   ├── .env.local
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication with expiration
- **Authorization**: User-specific data access (users can only access their own data)
- **Route Protection**: JWT guards on protected endpoints
- **Input Validation**: Class-validator decorators
- **CORS**: Configured for frontend origin
- **SQL Injection Protection**: TypeORM query builder
- **Environment Variables**: Sensitive data in .env files

## 📝 Development Notes

### Authorization Model

- Users can only view and manage their own orders
- Users can only access their own customer profile
- Product listing (GET) is public, but modifications require authentication
- New customers must register through `/auth/register` endpoint

### Testing

- 11 passing tests (unit + E2E)
- Products service unit tests
- Authentication service unit tests
- Products API E2E tests

## 📝 License

This project is licensed under the MIT License.
