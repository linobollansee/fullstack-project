# System Architecture

## Overview

The Fullstack Online Shop is a three-tier web application following a modern microservices-inspired architecture with clear separation of concerns.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js Frontend (Port 3000)                 │  │
│  │  - React 19 Components                               │  │
│  │  - App Router                                        │  │
│  │  - Tailwind CSS 4                                    │  │
│  │  - Auth Context (JWT token management)              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ HTTP/REST (CORS enabled)
┌─────────────────────────────────────────────────────────────┐
│                       Application Layer                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         NestJS Backend (Port 3001)                   │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │        Controllers                           │    │  │
│  │  │  - Products Controller                       │    │  │
│  │  │  - Orders Controller                         │    │  │
│  │  │  - Customers Controller                      │    │  │
│  │  │  - Auth Controller                           │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │           │                                           │  │
│  │           ▼                                           │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │        Services (Business Logic)            │    │  │
│  │  │  - Products Service                          │    │  │
│  │  │  - Orders Service                            │    │  │
│  │  │  - Customers Service                         │    │  │
│  │  │  - Auth Service                              │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  │           │                                           │  │
│  │           ▼                                           │  │
│  │  ┌─────────────────────────────────────────────┐    │  │
│  │  │     Middleware & Guards                      │    │  │
│  │  │  - JWT Auth Guard                            │    │  │
│  │  │  - Validation Pipe                           │    │  │
│  │  │  - CORS                                       │    │  │
│  │  └─────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ TypeORM
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      PostgreSQL Database (Port 5432)                 │  │
│  │  - Products Table                                    │  │
│  │  - Orders Table                                      │  │
│  │  - OrderItems Table                                  │  │
│  │  - Customers Table                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **State Management**: React Context API
- **HTTP Client**: Native Fetch API

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript 5
- **ORM**: TypeORM 0.3
- **Authentication**: Passport + JWT
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI

### Database
- **Database**: PostgreSQL 18
- **Containerization**: Docker

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest + Supertest

## Design Patterns

### Backend Patterns

1. **Module Pattern**: Each feature (products, orders, customers, auth) is organized as a NestJS module with clear boundaries
2. **Repository Pattern**: TypeORM repositories abstract database operations
3. **Dependency Injection**: Services are injected via NestJS DI container
4. **DTO Pattern**: Data Transfer Objects for validation and type safety
5. **Guard Pattern**: JWT guards for authentication/authorization
6. **Decorator Pattern**: Custom decorators for current user extraction

### Frontend Patterns

1. **Component Composition**: Reusable React components
2. **Context API**: Global state management for authentication
3. **Custom Hooks**: Encapsulated logic (useAuth)
4. **Form Management**: Controlled components for forms

## Data Flow

### Authentication Flow
```
1. User submits login credentials (Frontend)
2. POST /auth/login (Backend)
3. Validate credentials with bcrypt
4. Generate JWT token
5. Return token + user data
6. Store token in localStorage (Frontend)
7. Include token in Authorization header for subsequent requests
```

### Typical API Request Flow
```
1. User action triggers API call (Frontend)
2. Request includes JWT token in Authorization header
3. CORS middleware validates origin (Backend)
4. JWT Guard validates token
5. Controller receives request
6. Validation Pipe validates DTOs
7. Service executes business logic
8. Repository interacts with database
9. Response sent back to client
10. Frontend updates UI
```

## Security Architecture

- **Password Hashing**: bcrypt with salt rounds of 12
- **JWT Tokens**: Signed tokens with configurable expiration
- **CORS**: Whitelist specific origins
- **Validation**: Input validation on all endpoints
- **Authorization**: User-specific data access control

## Scalability Considerations

### Current Architecture
- Monolithic backend (single NestJS application)
- Direct database connections
- Stateless API (JWT-based auth)

### Future Enhancements
- Add Redis for caching and session management
- Implement rate limiting
- Add database connection pooling
- Consider microservices for order processing
- Add message queue for async operations
- Implement CDN for static assets

## Deployment Architecture

### Development
- Local Docker Compose setup
- Hot reload for both frontend and backend
- PostgreSQL in Docker container

### Production (Render)
- Separate containers for frontend and backend
- Managed PostgreSQL database
- Environment-specific configuration
- Automated deployments via GitHub integration

## Related Documentation

- [Database Schema](./database-schema.md)
- [API Design](./api-design.md)
- [Architecture Decision Records](./adr/)
