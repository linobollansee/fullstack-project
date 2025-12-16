# Authentication API

## Overview

The authentication API handles user registration, login, and JWT token management.

## Base URL

```
/auth
```

## Endpoints

### Register New User

Create a new customer account.

**Endpoint:** `POST /auth/register`

**Authentication:** None required

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `name`: Required, must be a string
- `email`: Required, must be valid email format
- `password`: Required, minimum 8 characters

**Success Response (201 Created):**
```json
{
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-16T00:00:00.000Z",
    "updatedAt": "2025-12-16T00:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**400 Bad Request** - Validation errors:
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters"
  ],
  "error": "Bad Request"
}
```

**409 Conflict** - Email already exists:
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:3001/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.access_token);
```

---

### Login

Authenticate existing user and receive JWT token.

**Endpoint:** `POST /auth/login`

**Authentication:** None required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email`: Required, must be valid email format
- `password`: Required, not empty

**Success Response (200 OK):**
```json
{
  "customer": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-16T00:00:00.000Z",
    "updatedAt": "2025-12-16T00:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

**400 Bad Request** - Validation errors:
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```

**401 Unauthorized** - Invalid credentials:
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.access_token);
localStorage.setItem('user', JSON.stringify(data.customer));
```

---

## Using JWT Tokens

### Token Structure

The JWT token contains:
```json
{
  "email": "john@example.com",
  "sub": 1,
  "iat": 1702684800,
  "exp": 1702771200
}
```

- `email`: User's email address
- `sub`: User ID (subject)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

### Including Token in Requests

For all protected endpoints, include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example (curl):**
```bash
curl http://localhost:3001/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Example (JavaScript):**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/products', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Token Expiration

- **Default expiration:** 24 hours (configurable via `JWT_EXPIRES_IN`)
- **Expired tokens:** Return 401 Unauthorized
- **No refresh mechanism:** User must login again (future enhancement)

## Security Considerations

### Password Requirements

- Minimum 8 characters
- Stored as bcrypt hash (12 salt rounds)
- Never returned in responses

### Recommendations

- Use strong, unique passwords
- Store tokens securely (localStorage or httpOnly cookies)
- Clear tokens on logout
- Implement token refresh for better UX
- Add rate limiting to prevent brute force

## Logout

Currently logout is **client-side only**:

```javascript
// Clear stored credentials
localStorage.removeItem('token');
localStorage.removeItem('user');
```

**Future Enhancement:** Server-side token blacklist for immediate revocation.

## Common Error Scenarios

| Scenario | Status | Message |
|----------|--------|---------|
| Email format invalid | 400 | "email must be an email" |
| Password too short | 400 | "password must be longer than or equal to 8 characters" |
| Email already registered | 409 | "Email already exists" |
| Wrong password | 401 | "Invalid credentials" |
| User not found | 401 | "Invalid credentials" |
| Token missing | 401 | "Unauthorized" |
| Token expired | 401 | "Unauthorized" |
| Token invalid | 401 | "Unauthorized" |

## Testing

### Manual Testing (Swagger)

1. Go to http://localhost:3001/api
2. Expand POST `/auth/register` or `/auth/login`
3. Click "Try it out"
4. Enter request body
5. Click "Execute"
6. Copy `access_token` from response
7. Click "Authorize" button at top
8. Enter: `Bearer YOUR_TOKEN`
9. Test protected endpoints

### Automated Testing

See [Testing Guide](../testing/testing-guide.md) for examples.

## Related Documentation

- [API Overview](./overview.md)
- [Security Guidelines](../security/guidelines.md)
- [Authentication Details](../security/auth.md)
