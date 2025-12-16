# Products API

## Overview

The products API handles CRUD operations for the product catalog.

## Base URL

```
/products
```

## Endpoints

### List All Products

Retrieve all products in the catalog.

**Endpoint:** `GET /products`

**Authentication:** None required

**Query Parameters:** None (pagination not yet implemented)

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with USB receiver",
    "price": 29.99,
    "createdAt": "2025-12-16T00:00:00.000Z",
    "updatedAt": "2025-12-16T00:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Mechanical Keyboard",
    "description": "RGB mechanical keyboard with blue switches",
    "price": 89.99,
    "createdAt": "2025-12-16T00:00:00.000Z",
    "updatedAt": "2025-12-16T00:00:00.000Z"
  }
]
```

**Example (curl):**
```bash
curl http://localhost:3001/products
```

**Example (JavaScript):**
```javascript
const response = await fetch('http://localhost:3001/products');
const products = await response.json();
```

---

### Get Single Product

Retrieve a specific product by ID.

**Endpoint:** `GET /products/:id`

**Authentication:** None required

**Path Parameters:**
- `id` (number): Product ID

**Success Response (200 OK):**
```json
{
  "id": 1,
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with USB receiver",
  "price": 29.99,
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T00:00:00.000Z"
}
```

**Error Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Product with ID 999 not found",
  "error": "Not Found"
}
```

**Example (curl):**
```bash
curl http://localhost:3001/products/1
```

---

### Create Product

Create a new product in the catalog.

**Endpoint:** `POST /products`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "name": "USB-C Cable",
  "description": "Braided USB-C to USB-A cable, 2 meters",
  "price": 12.99
}
```

**Validation Rules:**
- `name`: Required, must be a string, not empty
- `description`: Required, must be a string, not empty
- `price`: Required, must be a number, minimum 0

**Success Response (201 Created):**
```json
{
  "id": 3,
  "name": "USB-C Cable",
  "description": "Braided USB-C to USB-A cable, 2 meters",
  "price": 12.99,
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
    "name should not be empty",
    "price must be a positive number"
  ],
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "USB-C Cable",
    "description": "Braided USB-C to USB-A cable, 2 meters",
    "price": 12.99
  }'
```

**Example (JavaScript):**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'USB-C Cable',
    description: 'Braided USB-C to USB-A cable, 2 meters',
    price: 12.99
  })
});

const product = await response.json();
```

---

### Update Product

Update an existing product (partial update).

**Endpoint:** `PATCH /products/:id`

**Authentication:** Required (JWT token)

**Path Parameters:**
- `id` (number): Product ID

**Request Body (all fields optional):**
```json
{
  "name": "USB-C Cable - Premium",
  "price": 14.99
}
```

**Validation Rules:**
- `name`: Optional, must be a string if provided
- `description`: Optional, must be a string if provided
- `price`: Optional, must be a number >= 0 if provided

**Success Response (200 OK):**
```json
{
  "id": 3,
  "name": "USB-C Cable - Premium",
  "description": "Braided USB-C to USB-A cable, 2 meters",
  "price": 14.99,
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T01:30:00.000Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Product with ID 999 not found",
  "error": "Not Found"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**Example (curl):**
```bash
curl -X PATCH http://localhost:3001/products/3 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"price": 14.99}'
```

---

### Delete Product

Remove a product from the catalog.

**Endpoint:** `DELETE /products/:id`

**Authentication:** Required (JWT token)

**Path Parameters:**
- `id` (number): Product ID

**Success Response (200 OK):**
```json
{
  "id": 3,
  "name": "USB-C Cable - Premium",
  "description": "Braided USB-C to USB-A cable, 2 meters",
  "price": 14.99,
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T01:30:00.000Z"
}
```

**Error Responses:**

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Product with ID 999 not found",
  "error": "Not Found"
}
```

**Example (curl):**
```bash
curl -X DELETE http://localhost:3001/products/3 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Data Model

### Product Entity

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated unique identifier |
| name | string | Product name |
| description | string | Product description |
| price | number | Product price (decimal with 2 places) |
| createdAt | timestamp | Creation timestamp |
| updatedAt | timestamp | Last update timestamp |

## Business Rules

- Prices must be non-negative
- Product names and descriptions cannot be empty
- No duplicate checking on names (future enhancement)
- Soft delete not implemented (products are permanently deleted)

## Future Enhancements

- **Pagination**: Limit results per page
- **Search**: Search by name/description
- **Filtering**: Filter by price range
- **Sorting**: Sort by name, price, date
- **Categories**: Product categorization
- **Images**: Product image uploads
- **Stock**: Inventory management
- **Ratings**: Customer reviews and ratings

## Common Use Cases

### Display Product Catalog

```javascript
// Fetch and display all products
const products = await fetch('http://localhost:3001/products')
  .then(res => res.json());

products.forEach(product => {
  console.log(`${product.name}: $${product.price}`);
});
```

### Create Product Form

```javascript
async function createProduct(formData) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3001/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return response.json();
}
```

### Update Product Price

```javascript
async function updatePrice(productId, newPrice) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3001/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ price: newPrice })
  });
  
  return response.json();
}
```

## Testing

See [Testing Guide](../testing/testing-guide.md) for unit and E2E test examples.

## Related Documentation

- [API Overview](./overview.md)
- [Orders API](./orders.md)
- [Database Schema](../architecture/database-schema.md)
