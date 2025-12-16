# API Overview

## Introduction

The Fullstack Online Shop API is a RESTful API built with NestJS that provides endpoints for managing an e-commerce application. This documentation complements the interactive Swagger documentation available at `/api`.

## Base URL

- **Local Development**: `http://localhost:3001`
- **Production**: `https://your-api-url.com`

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Getting a Token

**Register a new account:**
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Login to existing account:**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-16T00:00:00Z",
    "updatedAt": "2025-12-16T00:00:00Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using the Token

Include the token in the Authorization header for all protected endpoints:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## API Resources

The API provides the following resources:

- **[Auth](./auth.md)** - User registration and authentication
- **[Products](./products.md)** - Product catalog management
- **[Orders](./orders.md)** - Order creation and management
- **[Customers](./customers.md)** - Customer account management

## Common Response Codes

| Code | Description | Example Scenario |
|------|-------------|------------------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email, etc. |
| 500 | Internal Server Error | Server error |

## Error Response Format

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "message": ["email must be an email", "password is too short"],
  "error": "Bad Request"
}
```

## Rate Limiting

Currently not implemented. Future versions will include:
- 100 requests per 15 minutes per IP
- 1000 requests per hour for authenticated users

## Pagination

Currently not implemented. All list endpoints return full results.

Future implementation will use:
```
GET /products?page=1&limit=20&sort=createdAt:desc
```

## Interactive Documentation

For interactive API testing, visit the Swagger UI:
- Development: `http://localhost:3001/api`
- Production: `https://your-api-url.com/api`

## Quick Start Example

### 1. Register a User
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### 2. Create a Product (requires auth)
```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Product","description":"A test product","price":29.99}'
```

### 3. List Products (no auth required)
```bash
curl http://localhost:3001/products
```

### 4. Create an Order (requires auth)
```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerName":"Test User",
    "customerEmail":"test@example.com",
    "shippingAddress":"123 Main St",
    "items":[{"productId":1,"quantity":2}]
  }'
```

## Support

For issues or questions:
- Check the [Troubleshooting Guide](../troubleshooting/common-issues.md)
- Review the [FAQ](../troubleshooting/faq.md)
- Open an issue on GitHub

## Related Documentation

- [System Architecture](../architecture/system-architecture.md)
- [API Design Principles](../architecture/api-design.md)
- [Security Guidelines](../security/guidelines.md)
