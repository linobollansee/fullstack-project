# Customers API

## Overview

The customers API handles customer account management. Most customer creation happens through `/auth/register`, but this API allows viewing and updating customer profiles.

## Base URL

```
/customers
```

## Authentication

All customer endpoints require JWT authentication.

## Endpoints

### List All Customers

Retrieve all customer accounts.

**Endpoint:** `GET /customers`

**Authentication:** Required (JWT token)

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2025-12-16T00:00:00.000Z",
    "updatedAt": "2025-12-16T00:00:00.000Z",
    "orders": [
      {
        "id": 1,
        "totalAmount": 119.97,
        "status": "pending",
        "createdAt": "2025-12-16T00:00:00.000Z"
      }
    ]
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "createdAt": "2025-12-16T00:00:00.000Z",
    "updatedAt": "2025-12-16T00:00:00.000Z",
    "orders": []
  }
]
```

**Note:** Password field is never returned in responses.

**Example (curl):**
```bash
curl http://localhost:3001/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Single Customer

Retrieve a specific customer by ID.

**Endpoint:** `GET /customers/:id`

**Authentication:** Required (JWT token)

**Path Parameters:**
- `id` (number): Customer ID

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T00:00:00.000Z",
  "orders": [
    {
      "id": 1,
      "totalAmount": 119.97,
      "status": "pending",
      "createdAt": "2025-12-16T00:00:00.000Z"
    }
  ]
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Customer with ID 999 not found",
  "error": "Not Found"
}
```

**Example (curl):**
```bash
curl http://localhost:3001/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Create Customer

Create a new customer account.

**Endpoint:** `POST /customers`

**Authentication:** None required

**Note:** This endpoint exists but user registration should typically use `/auth/register` instead, as it returns a JWT token for immediate authentication.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `name`: Required, must be a string, not empty
- `email`: Required, must be valid email format
- `password`: Required, minimum 8 characters

**Success Response (201 Created):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request:**
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

---

### Update Customer

Update customer account information.

**Endpoint:** `PATCH /customers/:id`

**Authentication:** Required (JWT token)

**Path Parameters:**
- `id` (number): Customer ID

**Request Body (all fields optional):**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Validation Rules:**
- `name`: Optional, must be a string if provided
- `email`: Optional, must be valid email if provided (and not already in use)
- `password`: Optional, minimum 8 characters if provided

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T02:00:00.000Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Customer with ID 999 not found",
  "error": "Not Found"
}
```

**409 Conflict** - Email already taken by another user:
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

**Example (curl):**
```bash
curl -X PATCH http://localhost:3001/customers/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "John Smith"
  }'
```

**Example (JavaScript):**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/customers/1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'John Smith',
    email: 'johnsmith@example.com'
  })
});

const updatedCustomer = await response.json();
```

---

### Delete Customer

Delete a customer account.

**Endpoint:** `DELETE /customers/:id`

**Authentication:** Required (JWT token)

**Path Parameters:**
- `id` (number): Customer ID

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T00:00:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Customer with ID 999 not found",
  "error": "Not Found"
}
```

**Warning:** Deleting a customer may affect related orders. Consider implementing soft delete instead.

**Example (curl):**
```bash
curl -X DELETE http://localhost:3001/customers/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Data Model

### Customer Entity

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated unique identifier |
| name | string | Customer's full name |
| email | string | Customer's email (unique, used for login) |
| password | string | Bcrypt hashed password (never returned) |
| createdAt | timestamp | Account creation timestamp |
| updatedAt | timestamp | Last update timestamp |
| orders | Order[] | Related orders (included in responses) |

## Business Rules

### Email Uniqueness

- Email must be unique across all customers
- Changing email validates it's not already taken
- Case-insensitive email matching (handled by database)

### Password Security

- Minimum 8 characters required
- Stored as bcrypt hash with 12 salt rounds
- Password never returned in API responses
- Password field excluded using destructuring: `const { password, ...result } = customer`

### Order Relationships

- Customers can have zero or more orders
- Orders are included in customer GET responses
- Deleting a customer may orphan orders (consider soft delete)

## Typical Workflows

### User Registration

1. User fills registration form
2. Frontend sends POST to `/auth/register` (not `/customers`)
3. Backend creates customer and returns JWT token
4. User is immediately logged in

### Profile Update

1. User edits profile information
2. Frontend sends PATCH to `/customers/:id`
3. Backend validates changes
4. Updated profile returned
5. Frontend updates localStorage if email changed

### Account Deletion

1. User requests account deletion
2. Confirm action (irreversible)
3. Frontend sends DELETE to `/customers/:id`
4. Backend deletes customer
5. Frontend logs user out and clears tokens

## Security Considerations

### Password Updates

When updating password:
```typescript
// Password is automatically hashed before storage
{
  "password": "newSecurePassword123"
}
```

### Email Changes

- Validate email is not already in use
- Consider requiring email verification
- Update JWT token if email is in token payload

### Authorization

- Users should only update/delete their own accounts
- Admin role not yet implemented
- Consider adding ownership checks

## Future Enhancements

- **Profile Photos**: Upload avatar images
- **Email Verification**: Require email confirmation
- **Two-Factor Auth**: Add 2FA support
- **Address Book**: Store multiple shipping addresses
- **Preferences**: User preferences and settings
- **Activity Log**: Track account activity
- **Soft Delete**: Preserve customer data
- **Role-Based Access**: Admin vs regular users
- **Password Reset**: "Forgot password" flow

## Common Use Cases

### Get Current User Profile

```javascript
async function getCurrentUser() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  const response = await fetch(`http://localhost:3001/customers/${user.id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

### Update Profile

```javascript
async function updateProfile(userId, updates) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3001/customers/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  
  if (response.ok) {
    const updatedUser = await response.json();
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  }
  
  throw new Error('Failed to update profile');
}
```

### Change Password

```javascript
async function changePassword(userId, newPassword) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3001/customers/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ password: newPassword })
  });
  
  return response.json();
}
```

## Testing

See [Testing Guide](../testing/testing-guide.md) for unit and E2E test examples.

## Related Documentation

- [API Overview](./overview.md)
- [Authentication API](./auth.md)
- [Orders API](./orders.md)
- [Security Guidelines](../security/guidelines.md)
