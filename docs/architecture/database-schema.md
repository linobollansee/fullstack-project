# Database Schema

## Overview

The database uses PostgreSQL 18 and follows a relational model with proper foreign key constraints and indexing.

## Entity Relationship Diagram

```
┌─────────────────────────────┐
│        CUSTOMERS            │
├─────────────────────────────┤
│ id (PK)          SERIAL     │
│ name             VARCHAR    │
│ email            VARCHAR    │◄────────┐
│ password         VARCHAR    │         │
│ createdAt        TIMESTAMP  │         │
│ updatedAt        TIMESTAMP  │         │
└─────────────────────────────┘         │
                                        │ 1:N
                                        │
┌─────────────────────────────┐         │
│         ORDERS              │         │
├─────────────────────────────┤         │
│ id (PK)          SERIAL     │         │
│ customerName     VARCHAR    │         │
│ customerEmail    VARCHAR    │         │
│ shippingAddress  TEXT       │         │
│ totalAmount      DECIMAL    │         │
│ status           VARCHAR    │         │
│ customerId (FK)  INT        │─────────┘
│ createdAt        TIMESTAMP  │
│ updatedAt        TIMESTAMP  │
└─────────────────────────────┘
            │
            │ 1:N
            │
            ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│       ORDER_ITEMS           │         │         PRODUCTS            │
├─────────────────────────────┤         ├─────────────────────────────┤
│ id (PK)          SERIAL     │         │ id (PK)          SERIAL     │
│ quantity         INT        │         │ name             VARCHAR    │
│ price            DECIMAL    │         │ description      TEXT       │
│ orderId (FK)     INT        │         │ price            DECIMAL    │
│ productId (FK)   INT        │─────────┤ createdAt        TIMESTAMP  │
└─────────────────────────────┘   N:1   │ updatedAt        TIMESTAMP  │
                                         └─────────────────────────────┘
```

## Tables

### Customers

Stores user/customer information with authentication credentials.

| Column    | Type                        | Constraints                    | Description                          |
|-----------|-----------------------------|--------------------------------|--------------------------------------|
| id        | SERIAL                      | PRIMARY KEY                    | Auto-incrementing customer ID        |
| name      | VARCHAR                     | NOT NULL                       | Customer's full name                 |
| email     | VARCHAR                     | NOT NULL, UNIQUE               | Customer's email (used for login)    |
| password  | VARCHAR                     | NOT NULL                       | Bcrypt hashed password               |
| createdAt | TIMESTAMP WITH TIME ZONE    | DEFAULT NOW()                  | Record creation timestamp            |
| updatedAt | TIMESTAMP WITH TIME ZONE    | DEFAULT NOW()                  | Last update timestamp                |

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`

**Security:**
- Passwords are hashed using bcrypt with 12 salt rounds
- Email is unique to prevent duplicate accounts

### Products

Catalog of products available for purchase.

| Column      | Type                        | Constraints                    | Description                          |
|-------------|-----------------------------|--------------------------------|--------------------------------------|
| id          | SERIAL                      | PRIMARY KEY                    | Auto-incrementing product ID         |
| name        | VARCHAR                     | NOT NULL                       | Product name                         |
| description | TEXT                        | NOT NULL                       | Product description                  |
| price       | DECIMAL(10, 2)              | NOT NULL                       | Product price (2 decimal places)     |
| createdAt   | TIMESTAMP WITH TIME ZONE    | DEFAULT NOW()                  | Record creation timestamp            |
| updatedAt   | TIMESTAMP WITH TIME ZONE    | DEFAULT NOW()                  | Last update timestamp                |

**Indexes:**
- PRIMARY KEY on `id`

**Future Enhancements:**
- Add `stock` column for inventory management
- Add `categoryId` foreign key for product categories
- Add full-text search index on `name` and `description`

### Orders

Customer orders with shipping information.

| Column          | Type                        | Constraints                    | Description                          |
|-----------------|-----------------------------|--------------------------------|--------------------------------------|
| id              | SERIAL                      | PRIMARY KEY                    | Auto-incrementing order ID           |
| customerName    | VARCHAR                     | NOT NULL                       | Customer name (denormalized)         |
| customerEmail   | VARCHAR                     | NOT NULL                       | Customer email (denormalized)        |
| shippingAddress | TEXT                        | NOT NULL                       | Shipping address                     |
| totalAmount     | DECIMAL(10, 2)              | NOT NULL, DEFAULT 0            | Total order amount                   |
| status          | VARCHAR                     | NOT NULL, DEFAULT 'pending'    | Order status                         |
| customerId      | INTEGER                     | FOREIGN KEY → customers(id)    | Reference to customer                |
| createdAt       | TIMESTAMP WITH TIME ZONE    | DEFAULT NOW()                  | Order placement timestamp            |
| updatedAt       | TIMESTAMP WITH TIME ZONE    | DEFAULT NOW()                  | Last update timestamp                |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `customerId`
- INDEX on `status`

**Valid Status Values:**
- `pending` - Order created but not processed
- `processing` - Order is being prepared
- `shipped` - Order has been shipped
- `delivered` - Order delivered to customer
- `cancelled` - Order cancelled

### OrderItems

Line items for each order (junction table with additional data).

| Column    | Type                        | Constraints                    | Description                          |
|-----------|-----------------------------|--------------------------------|--------------------------------------|
| id        | SERIAL                      | PRIMARY KEY                    | Auto-incrementing item ID            |
| quantity  | INTEGER                     | NOT NULL                       | Quantity of product ordered          |
| price     | DECIMAL(10, 2)              | NOT NULL                       | Price at time of order               |
| orderId   | INTEGER                     | FOREIGN KEY → orders(id)       | Reference to order                   |
| productId | INTEGER                     | FOREIGN KEY → products(id)     | Reference to product                 |

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `orderId`
- INDEX on `productId`

**Design Decision:**
- Price is stored per order item to preserve historical pricing
- Even if product price changes, order history remains accurate

## Relationships

### One-to-Many: Customers → Orders
- Each customer can have multiple orders
- Each order belongs to one customer
- Foreign key: `orders.customerId` references `customers.id`
- ON DELETE behavior: Not set (consider adding CASCADE or SET NULL)

### One-to-Many: Orders → OrderItems
- Each order can have multiple line items
- Each order item belongs to one order
- Foreign key: `order_items.orderId` references `orders.id`
- ON DELETE behavior: Should be CASCADE (deleting order deletes items)

### Many-to-One: OrderItems → Products
- Each order item references one product
- Each product can be in multiple order items
- Foreign key: `order_items.productId` references `products.id`
- ON DELETE behavior: Should be RESTRICT (can't delete products in orders)

## Data Integrity

### Constraints
1. **Unique Email**: Prevents duplicate customer accounts
2. **Foreign Keys**: Ensures referential integrity
3. **NOT NULL**: Ensures required fields are populated
4. **Default Values**: Provides sensible defaults (e.g., order status)

### Triggers
Currently using TypeORM's automatic timestamp management:
- `@CreateDateColumn()` sets `createdAt` on insert
- `@UpdateDateColumn()` updates `updatedAt` on modification

## Migration Strategy

### Current Setup
- Using TypeORM `synchronize: true` in development
- Automatically syncs schema with entity definitions

### Production Recommendation
- Disable `synchronize` in production
- Use TypeORM migrations for controlled schema changes
- Version control migration files

## Performance Considerations

### Indexes
- Primary keys automatically indexed
- Foreign keys should be indexed for JOIN performance
- Consider adding index on `orders.createdAt` for date-range queries

### Query Optimization
- Use TypeORM relations wisely (avoid N+1 queries)
- Implement pagination for large result sets
- Consider denormalization for frequently accessed data

## Future Enhancements

1. **Product Categories**
   - Add `categories` table
   - Add `categoryId` to products

2. **Inventory Management**
   - Add `stock` column to products
   - Add transaction logging for stock changes

3. **Order History**
   - Add `order_history` table for status changes
   - Track who changed what and when

4. **Reviews & Ratings**
   - Add `reviews` table linked to products and customers

5. **Soft Deletes**
   - Add `deletedAt` column to support soft deletes
   - Preserve data for audit purposes

## Related Documentation

- [System Architecture](./system-architecture.md)
- [API Design](./api-design.md)
