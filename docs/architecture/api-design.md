# API Design

## Overview

The API follows RESTful principles with consistent endpoint structure, HTTP methods, and response formats.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://your-app.onrender.com` (or your deployment URL)

## API Versioning

Currently using an unversioned API. Future versions should use:
- URL versioning: `/api/v1/products`
- Header versioning: `Accept: application/vnd.api.v1+json`

## RESTful Conventions

### HTTP Methods

| Method | Purpose               | Idempotent | Safe |
|--------|-----------------------|------------|------|
| GET    | Retrieve resources    | Yes        | Yes  |
| POST   | Create new resource   | No         | No   |
| PUT    | Replace entire resource| Yes       | No   |
| PATCH  | Update partial resource| Yes       | No   |
| DELETE | Remove resource       | Yes        | No   |

### URL Structure

```
/{resource}           # Collection endpoint
/{resource}/{id}      # Single resource endpoint
/{resource}/{id}/{sub-resource}  # Nested resources
```

### Status Codes

| Code | Meaning                | Usage                                    |
|------|------------------------|------------------------------------------|
| 200  | OK                     | Successful GET, PATCH, PUT, DELETE       |
| 201  | Created                | Successful POST                          |
| 204  | No Content             | Successful DELETE with no response body  |
| 400  | Bad Request            | Validation errors, malformed request     |
| 401  | Unauthorized           | Missing or invalid authentication        |
| 403  | Forbidden              | Authenticated but not authorized         |
| 404  | Not Found              | Resource doesn't exist                   |
| 409  | Conflict               | Duplicate resource (e.g., email exists)  |
| 500  | Internal Server Error  | Server-side error                        |

## Authentication

### JWT Bearer Token

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Structure

```json
{
  "email": "user@example.com",
  "sub": 1,
  "iat": 1671234567,
  "exp": 1671320967
}
```

### Token Lifecycle

1. **Obtain Token**: POST `/auth/login` or `/auth/register`
2. **Use Token**: Include in all protected requests
3. **Token Expiration**: Default 24 hours (configurable via `JWT_EXPIRES_IN`)
4. **Refresh**: Not yet implemented (future enhancement)

## Request/Response Format

### Request Body (JSON)

```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99
}
```

### Success Response

```json
{
  "id": 1,
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": ["name must be a string", "price must be a number"],
  "error": "Bad Request"
}
```

## API Endpoints

### Authentication

| Method | Endpoint         | Auth Required | Description              |
|--------|------------------|---------------|--------------------------|
| POST   | /auth/register   | No            | Register new user        |
| POST   | /auth/login      | No            | Login and get JWT token  |

### Products

| Method | Endpoint          | Auth Required | Description              |
|--------|-------------------|---------------|--------------------------|
| GET    | /products         | No            | List all products        |
| GET    | /products/:id     | No            | Get single product       |
| POST   | /products         | Yes           | Create new product       |
| PATCH  | /products/:id     | Yes           | Update product           |
| DELETE | /products/:id     | Yes           | Delete product           |

### Orders

| Method | Endpoint          | Auth Required | Description              |
|--------|-------------------|---------------|--------------------------|
| GET    | /orders           | Yes           | List user's orders       |
| GET    | /orders/:id       | Yes           | Get single order         |
| POST   | /orders           | Yes           | Create new order         |
| PATCH  | /orders/:id       | Yes           | Update order status      |

### Customers

| Method | Endpoint          | Auth Required | Description              |
|--------|-------------------|---------------|--------------------------|
| GET    | /customers        | Yes           | List all customers       |
| GET    | /customers/:id    | Yes           | Get single customer      |
| POST   | /customers        | No*           | Create customer (register)|
| PATCH  | /customers/:id    | Yes           | Update customer          |
| DELETE | /customers/:id    | Yes           | Delete customer          |

*Registration uses `/auth/register` instead

## Data Validation

### Input Validation

Using `class-validator` decorators:

```typescript
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

### Validation Errors

```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

## Pagination (Future Enhancement)

### Query Parameters

```
GET /products?page=1&limit=20&sort=createdAt:desc
```

### Response Format

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

## Rate Limiting (Future Enhancement)

Recommended implementation:
- 100 requests per 15 minutes per IP
- 1000 requests per hour for authenticated users
- Special limits for login endpoints (5 attempts per 15 minutes)

## CORS Configuration

### Allowed Origins

**Development:**
- `http://localhost:3000`

**Production:**
- `https://your-frontend.onrender.com`

### Allowed Methods

- GET, POST, PATCH, DELETE, OPTIONS

### Allowed Headers

- Authorization, Content-Type

## API Documentation

### Swagger/OpenAPI

Interactive API documentation available at:
- Development: `http://localhost:3001/api`
- Production: `https://your-api.onrender.com/api`

### Features
- Try out endpoints directly
- View request/response schemas
- See authentication requirements
- Export OpenAPI spec

## Error Handling

### Consistent Error Structure

```typescript
{
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp?: string;
  path?: string;
}
```

### Exception Filters

NestJS built-in filters handle:
- Validation errors (ValidationPipe)
- HTTP exceptions
- Database errors (caught and transformed)

## Best Practices Implemented

1. ✅ RESTful resource naming (plural nouns)
2. ✅ Proper HTTP methods and status codes
3. ✅ JWT authentication for protected routes
4. ✅ Input validation with DTOs
5. ✅ Consistent error responses
6. ✅ CORS configuration
7. ✅ API documentation with Swagger

## Future Enhancements

1. **Pagination**: Implement cursor-based or offset pagination
2. **Filtering**: Add query parameters for filtering results
3. **Rate Limiting**: Prevent abuse with throttling
4. **API Versioning**: Prepare for breaking changes
5. **Webhook Support**: Notify external systems of events
6. **GraphQL**: Consider adding GraphQL alongside REST
7. **Caching**: Add cache headers and Redis caching
8. **Request ID**: Track requests across services

## Related Documentation

- [System Architecture](./system-architecture.md)
- [Authentication & Authorization](../security/auth.md)
- [API Reference](../api/)
