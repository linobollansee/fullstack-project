# Orders API

## Overview

The orders API handles order creation and management. Orders consist of customer information, shipping details, and one or more order items (products with quantities).

## Base URL

```
/orders
```

## Authentication

All order endpoints require JWT authentication.

## Endpoints

### List User's Orders

Retrieve all orders for the authenticated user.

**Endpoint:** `GET /orders`

**Authentication:** Required (JWT token)

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "shippingAddress": "123 Main St, Anytown, ST 12345",
    "totalAmount": 119.97,
    "status": "pending",
    "createdAt": "2025-12-16T00:00:00.000Z",
    "updatedAt": "2025-12-16T00:00:00.000Z",
    "items": [
      {
        "id": 1,
        "quantity": 2,
        "price": 29.99,
        "product": {
          "id": 1,
          "name": "Wireless Mouse",
          "description": "Ergonomic wireless mouse"
        }
      },
      {
        "id": 2,
        "quantity": 1,
        "price": 59.99,
        "product": {
          "id": 2,
          "name": "Keyboard",
          "description": "Mechanical keyboard"
        }
      }
    ]
  }
]
```

**Example (curl):**
```bash
curl http://localhost:3001/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Get Single Order

Retrieve a specific order by ID. Users can only access their own orders.

**Endpoint:** `GET /orders/:id`

**Authentication:** Required (JWT token)

**Path Parameters:**
- `id` (number): Order ID

**Success Response (200 OK):**
```json
{
  "id": 1,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "shippingAddress": "123 Main St, Anytown, ST 12345",
  "totalAmount": 119.97,
  "status": "pending",
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T00:00:00.000Z",
  "items": [
    {
      "id": 1,
      "quantity": 2,
      "price": 29.99,
      "product": {
        "id": 1,
        "name": "Wireless Mouse",
        "description": "Ergonomic wireless mouse"
      }
    }
  ]
}
```

**Error Responses:**

**403 Forbidden** - Attempting to access another user's order:
```json
{
  "statusCode": 403,
  "message": "You can only access your own orders",
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Order with ID 999 not found",
  "error": "Not Found"
}
```

---

### Create Order

Create a new order for the authenticated user.

**Endpoint:** `POST /orders`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "shippingAddress": "123 Main St, Anytown, ST 12345",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "quantity": 1
    }
  ]
}
```

**Validation Rules:**
- `customerName`: Required, must be a string, not empty
- `customerEmail`: Required, must be valid email
- `shippingAddress`: Required, must be a string, not empty
- `items`: Required, must be an array with at least 1 item
  - `productId`: Required, must be a number
  - `quantity`: Required, must be a positive integer

**Success Response (201 Created):**
```json
{
  "id": 2,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "shippingAddress": "123 Main St, Anytown, ST 12345",
  "totalAmount": 119.97,
  "status": "pending",
  "customer": {
    "id": 1
  },
  "items": [
    {
      "id": 3,
      "quantity": 2,
      "price": 29.99,
      "product": {
        "id": 1,
        "name": "Wireless Mouse"
      }
    },
    {
      "id": 4,
      "quantity": 1,
      "price": 59.99,
      "product": {
        "id": 2,
        "name": "Keyboard"
      }
    }
  ],
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T00:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request** - Validation errors:
```json
{
  "statusCode": 400,
  "message": [
    "customerEmail must be an email",
    "items must contain at least 1 elements"
  ],
  "error": "Bad Request"
}
```

**404 Not Found** - Product doesn't exist:
```json
{
  "statusCode": 404,
  "message": "Product with ID 999 not found",
  "error": "Not Found"
}
```

**Example (curl):**
```bash
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "shippingAddress": "123 Main St, Anytown, ST 12345",
    "items": [
      {"productId": 1, "quantity": 2}
    ]
  }'
```

**Example (JavaScript):**
```javascript
const token = localStorage.getItem('token');
const response = await fetch('http://localhost:3001/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    shippingAddress: '123 Main St, Anytown, ST 12345',
    items: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 }
    ]
  })
});

const order = await response.json();
```

---

### Update Order Status

Update the status of an existing order.

**Endpoint:** `PATCH /orders/:id`

**Authentication:** Required (JWT token)

**Path Parameters:**
- `id` (number): Order ID

**Request Body:**
```json
{
  "status": "shipped"
}
```

**Valid Status Values:**
- `pending` - Order created but not processed
- `processing` - Order is being prepared
- `shipped` - Order has been shipped
- `delivered` - Order delivered to customer
- `cancelled` - Order cancelled

**Success Response (200 OK):**
```json
{
  "id": 1,
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "shippingAddress": "123 Main St, Anytown, ST 12345",
  "totalAmount": 119.97,
  "status": "shipped",
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T02:00:00.000Z"
}
```

**Error Responses:**

**400 Bad Request** - Invalid status:
```json
{
  "statusCode": 400,
  "message": ["status must be one of: pending, processing, shipped, delivered, cancelled"],
  "error": "Bad Request"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "You can only update your own orders",
  "error": "Forbidden"
}
```

**Example (curl):**
```bash
curl -X PATCH http://localhost:3001/orders/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status": "shipped"}'
```

---

## Data Model

### Order Entity

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated unique identifier |
| customerName | string | Customer's name |
| customerEmail | string | Customer's email |
| shippingAddress | string | Delivery address |
| totalAmount | number | Total order amount (calculated) |
| status | string | Order status |
| customerId | number | Foreign key to customer |
| createdAt | timestamp | Order creation timestamp |
| updatedAt | timestamp | Last update timestamp |

### OrderItem Entity

| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-generated unique identifier |
| quantity | number | Quantity ordered |
| price | number | Price at time of order |
| orderId | number | Foreign key to order |
| productId | number | Foreign key to product |

## Business Rules

### Order Creation

1. User must be authenticated
2. At least one item required
3. All products must exist
4. Total amount automatically calculated
5. Price captured at time of order (historical pricing)
6. Order associated with authenticated user
7. Default status is "pending"

### Order Access

- Users can only view and modify their own orders
- Attempting to access another user's order returns 403 Forbidden

### Price Calculation

```
Total Amount = Sum of (item.quantity × item.price) for all items
```

Price is captured per item at order creation time, preserving historical pricing even if product price changes later.

## Status Flow

Typical order status progression:

```
pending → processing → shipped → delivered
           ↓
       cancelled
```

## Future Enhancements

- **Payment Integration**: Add payment processing
- **Order Cancellation**: Allow customers to cancel pending orders
- **Order History**: Track status change history
- **Email Notifications**: Send emails on status changes
- **Refunds**: Handle returns and refunds
- **Split Shipments**: Multiple shipments per order
- **Tracking Numbers**: Add shipping tracking

## Common Use Cases

### Place an Order

```javascript
async function placeOrder(cart, shippingInfo) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  const orderData = {
    customerName: user.name,
    customerEmail: user.email,
    shippingAddress: shippingInfo.address,
    items: cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity
    }))
  };
  
  const response = await fetch('http://localhost:3001/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create order');
  }
  
  return response.json();
}
```

### View Order History

```javascript
async function getOrderHistory() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3001/orders', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

### Track Order Status

```javascript
async function getOrderStatus(orderId) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const order = await response.json();
  return order.status;
}
```

## Testing

See [Testing Guide](../testing/testing-guide.md) for unit and E2E test examples.

## Related Documentation

- [API Overview](./overview.md)
- [Products API](./products.md)
- [Database Schema](../architecture/database-schema.md)
