# Orders - CRUD Implementation

## Overview

This guide implements order management functionality with proper e-commerce features:

- Backend REST API for orders with NestJS
- Junction entity for order items with quantity and price tracking
- Proper TypeORM relationships (Order → OrderItem → Product)
- Frontend UI for order creation and management
- JWT authentication protected endpoints

## Order Model

### Order Entity
- **id**: number (auto-generated)
- **customer**: Customer (many-to-one relationship, optional)
- **items**: OrderItem[] (one-to-many, cascade, eager loading)
- **totalAmount**: number (decimal, precision 10, scale 2)
- **status**: OrderStatus enum (pending, processing, shipped, delivered, cancelled)
- **customerName**, **customerEmail**, **shippingAddress**: strings (nullable)
- **createdAt**, **updatedAt**: Date (auto-managed)

### OrderItem Entity (Junction Table)
- **id**: number (auto-generated)
- **order**: Order (many-to-one with cascade delete)
- **product**: Product (many-to-one, eager loading)
- **quantity**: number (integer)
- **price**: number (decimal, captured at order time)

---

## Backend Implementation

### Step 1: Generate Order Module

```bash
cd backend

# Generate module, controller, and service
nest generate resource orders

# When prompted:
# - What transport layer? REST API
# - Generate CRUD entry points? Yes
```

### Step 2: Create Order Status Enum and Entities

Create `backend/src/orders/entities/order.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { OrderItem } from "./order-item.entity";
import { Customer } from "../../customers/entities/customer.entity";

export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
}

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
  customer: Customer;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  shippingAddress: string;

  @Column({
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

Create `backend/src/orders/entities/order-item.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { Product } from "../../products/entities/product.entity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Column("int")
  quantity: number;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;
}
```

### Step 3: Create DTOs

Create `backend/src/orders/dto/create-order.dto.ts`:

```typescript
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
} from "class-validator";
import { Type } from "class-transformer";

export class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsString()
  @IsNotEmpty()
  customerEmail: string;

  @IsString()
  @IsNotEmpty()
  shippingAddress: string;
}
```

Create `backend/src/orders/dto/update-order.dto.ts`:

```typescript
import { PartialType } from "@nestjs/mapped-types";
import { CreateOrderDto } from "./create-order.dto";
import { IsEnum, IsOptional } from "class-validator";
import { OrderStatus } from "../entities/order.entity";

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
```

### Step 4: Implement Orders Service

Create `backend/src/orders/orders.service.ts`:

```typescript
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Product } from "../products/entities/product.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create({
      customerName: createOrderDto.customerName,
      customerEmail: createOrderDto.customerEmail,
      shippingAddress: createOrderDto.shippingAddress,
    });

    const savedOrder = await this.ordersRepository.save(order);

    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const itemDto of createOrderDto.items) {
      const product = await this.productsRepository.findOne({
        where: { id: itemDto.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${itemDto.productId} not found`
        );
      }

      const orderItem = this.orderItemsRepository.create({
        order: savedOrder,
        product: product,
        quantity: itemDto.quantity,
        price: product.price,
      });

      orderItems.push(orderItem);
      totalAmount += Number(product.price) * itemDto.quantity;
    }

    await this.orderItemsRepository.save(orderItems);

    savedOrder.totalAmount = totalAmount;
    savedOrder.items = orderItems;

    return await this.ordersRepository.save(savedOrder);
  }

  async findAll(): Promise<Order[]> {
    return await this.ordersRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return await this.ordersRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }
}
```

### Step 5: Create Orders Controller

Create `backend/src/orders/orders.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.ordersService.remove(+id);
  }
}
```

### Step 6: Update Orders Module

Update `backend/src/orders/orders.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { Product } from "../products/entities/product.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Product])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

### Step 7: Update App Module

Update `backend/src/app.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DATABASE_HOST"),
        port: +configService.get("DATABASE_PORT"),
        username: configService.get("DATABASE_USER"),
        password: configService.get("DATABASE_PASSWORD"),
        database: configService.get("DATABASE_NAME"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    ProductsModule,
    OrdersModule,
  ],
})
export class AppModule {}
```

---

## Frontend Implementation

### Step 1: Update API Client

Update `frontend/src/lib/api.ts`:

```typescript
export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  status: string;
  createdAt: string;
}

export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  items: CreateOrderItemDto[];
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
}

export const ordersApi = {
  async getAll(): Promise<Order[]> {
    const response = await fetch(`${API_URL}/orders`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
  },

  async getOne(id: number): Promise<Order> {
    const response = await fetch(`${API_URL}/orders/${id}`);
    if (!response.ok) throw new Error("Failed to fetch order");
    return response.json();
  },

  async create(data: CreateOrderDto): Promise<Order> {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create order");
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete order");
  },
};
```

### Step 2: Create Order Form Component

Create `frontend/src/components/OrderForm.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { productsApi, ordersApi, Product, CreateOrderDto } from "@/lib/api";

interface OrderFormProps {
  onSuccess?: () => void;
}

interface ProductQuantity {
  productId: number;
  quantity: number;
}

export default function OrderForm({ onSuccess }: OrderFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductQuantity[]>(
    []
  );
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getAll();
        setProducts(data);
      } catch (err) {
        console.error("Failed to load products", err);
      }
    };
    fetchProducts();
  }, []);

  const handleToggleProduct = (productId: number) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.productId === productId);
      if (exists) {
        return prev.filter((p) => p.productId !== productId);
      } else {
        return [...prev, { productId, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (productId: number, quantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, quantity } : p))
    );
  };

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.productId);
      return sum + (product ? Number(product.price) * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedProducts.length === 0) {
      setError("Please select at least one product");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData: CreateOrderDto = {
        items: selectedProducts,
        customerName,
        customerEmail,
        shippingAddress,
      };
      await ordersApi.create(orderData);
      setSelectedProducts([]);
      setCustomerName("");
      setCustomerEmail("");
      setShippingAddress("");
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Failed to create order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-lg shadow"
    >
      <h2 className="text-2xl font-bold mb-4">Create New Order</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="customerName"
          className="block text-sm font-medium mb-1"
        >
          Customer Name
        </label>
        <input
          type="text"
          id="customerName"
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label
          htmlFor="customerEmail"
          className="block text-sm font-medium mb-1"
        >
          Customer Email
        </label>
        <input
          type="email"
          id="customerEmail"
          required
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label
          htmlFor="shippingAddress"
          className="block text-sm font-medium mb-1"
        >
          Shipping Address
        </label>
        <textarea
          id="shippingAddress"
          required
          rows={3}
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Select Products
        </label>
        <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
          {products.map((product) => {
            const selected = selectedProducts.find(
              (p) => p.productId === product.id
            );
            return (
              <div
                key={product.id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  checked={!!selected}
                  onChange={() => handleToggleProduct(product.id)}
                  className="w-4 h-4"
                />
                <span className="flex-1">{product.name}</span>
                {selected && (
                  <input
                    type="number"
                    min="1"
                    value={selected.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        product.id,
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-16 px-2 py-1 border rounded"
                  />
                )}
                <span className="font-semibold text-green-600">
                  ${Number(product.price).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || selectedProducts.length === 0}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Order"}
      </button>
    </form>
  );
}
```

### Step 3: Create Order List Component

Create `frontend/src/components/OrderList.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Order, ordersApi } from "@/lib/api";

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersApi.getAll();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this order?")) return;
    try {
      await ordersApi.delete(id);
      setOrders(orders.filter((o) => o.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold">Order #{order.id}</h3>
              <p className="text-sm text-gray-600">{order.customerName}</p>
              <p className="text-sm text-gray-500">{order.customerEmail}</p>
            </div>
            <button
              onClick={() => handleDelete(order.id)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Items:</h4>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between bg-gray-50 p-2 rounded"
                >
                  <span>
                    {item.product.name} x {item.quantity}
                  </span>
                  <span className="font-semibold">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="text-right">
            <span className="text-2xl font-bold text-green-600">
              Total: ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Step 4: Create Orders Page

Create `frontend/src/app/orders/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import OrderList from "@/components/OrderList";
import OrderForm from "@/components/OrderForm";

export default function OrdersPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Orders Management</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <OrderForm onSuccess={() => setRefreshKey((k) => k + 1)} />
        </div>
        <div className="lg:col-span-2">
          <OrderList key={refreshKey} />
        </div>
      </div>
    </main>
  );
}
```

---

## Testing

```bash
# Test creating an order
curl -X POST http://localhost:3001/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId":1,"quantity":2}],
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "shippingAddress": "123 Main St"
  }'

# Get all orders
curl http://localhost:3001/orders
```

## Next Steps

Proceed to [04-customers.md](./04-customers.md) to implement customer management.
