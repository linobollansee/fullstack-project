# Customer - CRUD Implementation

## Overview

This guide implements customer management:

- Backend REST API for customers with NestJS
- TypeORM entity with one-to-many relationship to orders
- Frontend UI for customer management with React components
- Password field (will be hashed with bcrypt in authentication section)

## Customer Model

- **id**: number (auto-generated)
- **name**: string
- **email**: string (unique)
- **password**: string (will be hashed later)
- **orders**: Order[] (one-to-many relationship)

---

## Backend Implementation

### Step 1: Generate Customer Module

```bash
cd backend

# Generate module, controller, and service
nest generate resource customers

# When prompted:
# - What transport layer? REST API
# - Generate CRUD entry points? Yes
```

### Step 2: Create Customer Entity

Create `backend/src/customers/entities/customer.entity.ts`:

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Order } from "../../orders/entities/order.entity";

@Entity("customers")
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Step 3: Update Order Entity

Update `backend/src/orders/entities/order.entity.ts` to add customer relationship:

```typescript
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "../../products/entities/product.entity";
import { Customer } from "../../customers/entities/customer.entity";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Product)
  @JoinTable({
    name: "order_products",
    joinColumn: { name: "order_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "product_id", referencedColumnName: "id" },
  })
  products: Product[];

  @Column("decimal", { precision: 10, scale: 2 })
  totalPrice: number;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @Column({ nullable: true })
  customerId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Step 4: Create Customer DTOs

Create `backend/src/customers/dto/create-customer.dto.ts`:

```typescript
import { IsString, IsNotEmpty, IsEmail, MinLength } from "class-validator";

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

Create `backend/src/customers/dto/update-customer.dto.ts`:

```typescript
import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreateCustomerDto } from "./create-customer.dto";

// Exclude password from updates (for now, will be handled separately)
export class UpdateCustomerDto extends PartialType(
  OmitType(CreateCustomerDto, ["password"] as const)
) {}
```

### Step 5: Implement Customers Service

Update `backend/src/customers/customers.service.ts`:

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { Customer } from "./entities/customer.entity";

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Check if email already exists
    const existingCustomer = await this.customersRepository.findOne({
      where: { email: createCustomerDto.email },
    });

    if (existingCustomer) {
      throw new ConflictException("Email already exists");
    }

    // TODO: Hash password before saving (will be done in authentication section)
    const customer = this.customersRepository.create(createCustomerDto);
    return await this.customersRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customersRepository.find({
      relations: ["orders"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { id },
      relations: ["orders", "orders.products"],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return await this.customersRepository.findOne({
      where: { email },
      relations: ["orders"],
    });
  }

  async update(
    id: number,
    updateCustomerDto: UpdateCustomerDto
  ): Promise<Customer> {
    const customer = await this.findOne(id);

    // Check if email is being updated and if it's already taken
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.customersRepository.findOne({
        where: { email: updateCustomerDto.email },
      });

      if (existingCustomer) {
        throw new ConflictException("Email already exists");
      }
    }

    Object.assign(customer, updateCustomerDto);
    return await this.customersRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }
}
```

### Step 6: Implement Customers Controller

Update `backend/src/customers/customers.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  findAll() {
    return this.customersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.customersService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    return this.customersService.update(+id, updateCustomerDto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.customersService.remove(+id);
  }
}
```

### Step 7: Update Customers Module

Update `backend/src/customers/customers.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomersService } from "./customers.service";
import { CustomersController } from "./customers.controller";
import { Customer } from "./entities/customer.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
```

### Step 8: Update App Module

Update `backend/src/app.module.ts` to import CustomersModule:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";
import { CustomersModule } from "./customers/customers.module";

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
    CustomersModule,
  ],
})
export class AppModule {}
```

### Step 9: Backend Testing

Create `backend/src/customers/customers.service.spec.ts`:

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CustomersService } from "./customers.service";
import { Customer } from "./entities/customer.entity";
import { NotFoundException, ConflictException } from "@nestjs/common";

describe("CustomersService", () => {
  let service: CustomersService;
  let repository: Repository<Customer>;

  const mockCustomer = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    orders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a customer", async () => {
      const createDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockCustomer);
      mockRepository.save.mockResolvedValue(mockCustomer);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockCustomer);
    });

    it("should throw ConflictException if email exists", async () => {
      const createDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      mockRepository.findOne.mockResolvedValue(mockCustomer);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe("findAll", () => {
    it("should return an array of customers", async () => {
      mockRepository.find.mockResolvedValue([mockCustomer]);

      const result = await service.findAll();

      expect(result).toEqual([mockCustomer]);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a customer", async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCustomer);
    });

    it("should throw NotFoundException if customer not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a customer", async () => {
      const updateDto = { name: "Jane Doe" };
      const updatedCustomer = { ...mockCustomer, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockCustomer);
      mockRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe("Jane Doe");
    });
  });

  describe("remove", () => {
    it("should remove a customer", async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);
      mockRepository.remove.mockResolvedValue(mockCustomer);

      await service.remove(1);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockCustomer);
    });
  });
});
```

Run tests:

```bash
npm run test
```

---

## Frontend Implementation

### Step 1: Update API Client

Update `frontend/src/lib/api.ts` to add customers API:

```typescript
export interface Customer {
  id: number;
  name: string;
  email: string;
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
}

export const customersApi = {
  async getAll(): Promise<Customer[]> {
    const response = await fetch(`${API_URL}/customers`);
    if (!response.ok) throw new Error("Failed to fetch customers");
    return response.json();
  },

  async getOne(id: number): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers/${id}`);
    if (!response.ok) throw new Error("Failed to fetch customer");
    return response.json();
  },

  async create(data: CreateCustomerDto): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create customer");
    }
    return response.json();
  },

  async update(id: number, data: UpdateCustomerDto): Promise<Customer> {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update customer");
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/customers/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete customer");
  },
};
```

### Step 2: Create Customer List Component

Create `frontend/src/components/CustomerList.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { Customer, customersApi } from "@/lib/api";

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customersApi.getAll();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError("Failed to load customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    try {
      await customersApi.delete(id);
      setCustomers(customers.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete customer");
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 py-8">{error}</div>;

  return (
    <div className="space-y-4">
      {customers.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No customers found</p>
      ) : (
        <div className="space-y-4">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{customer.name}</h3>
                  <p className="text-gray-600">{customer.email}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Joined: {new Date(customer.createdAt).toLocaleDateString()}
                  </p>
                  {customer.orders && customer.orders.length > 0 && (
                    <p className="text-sm text-blue-600 mt-1">
                      {customer.orders.length} order(s)
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(customer.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Step 3: Create Customer Form Component

Create `frontend/src/components/CustomerForm.tsx`:

```typescript
"use client";

import { useState } from "react";
import { customersApi, CreateCustomerDto } from "@/lib/api";

interface CustomerFormProps {
  onSuccess?: () => void;
}

export default function CustomerForm({ onSuccess }: CustomerFormProps) {
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await customersApi.create(formData);
      setFormData({ name: "", email: "", password: "" });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to create customer");
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
      <h2 className="text-2xl font-bold mb-4">Register Customer</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Creating..." : "Create Customer"}
      </button>
    </form>
  );
}
```

### Step 4: Create Customers Page

Create `frontend/src/app/customers/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import CustomerList from "@/components/CustomerList";
import CustomerForm from "@/components/CustomerForm";
import Link from "next/link";

export default function CustomersPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCustomerCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Customers Management</h1>
        <div className="space-x-4">
          <Link
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Products
          </Link>
          <Link
            href="/orders"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Orders
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <CustomerForm onSuccess={handleCustomerCreated} />
        </div>

        <div className="lg:col-span-2">
          <CustomerList key={refreshKey} />
        </div>
      </div>
    </main>
  );
}
```

### Step 5: Update Navigation

Update navigation in all pages to include customers link.

Update `frontend/src/app/page.tsx`:

```typescript
<Link
  href="/customers"
  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
>
  Customers
</Link>
```

---

## Testing the Complete Flow

1. **Test API endpoints**:

   ```bash
   # Create a customer
   curl -X POST http://localhost:3001/customers \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

   # Get all customers
   curl http://localhost:3001/customers

   # Get one customer
   curl http://localhost:3001/customers/1

   # Update a customer
   curl -X PATCH http://localhost:3001/customers/1 \
     -H "Content-Type: application/json" \
     -d '{"name":"Jane Doe"}'

   # Delete a customer
   curl -X DELETE http://localhost:3001/customers/1
   ```

2. **Test UI**:

   - Visit http://localhost:3000/customers
   - Register a new customer
   - View the customer in the list
   - Delete the customer

3. **Run tests**:
   ```bash
   cd backend
   npm run test
   ```

## Next Steps

Proceed to [05-user-authentication.md](./05-user-authentication.md) to implement JWT authentication and protect your endpoints.

## Important Notes

- **Password Storage**: Currently passwords are stored in plain text. This will be fixed in the authentication section where we'll implement proper password hashing.
- **Email Uniqueness**: The system prevents duplicate email addresses.
- **Cascade Delete**: Consider implementing cascade delete for orders when a customer is deleted.

## Troubleshooting

### Email Already Exists Error

- Check if the email is unique in the database
- The system returns a 409 Conflict error

### Relationship Not Loading

- Verify `relations` array in repository queries
- Check TypeORM synchronization

### Migration Issues

- Drop and recreate database if needed: `docker-compose down -v && docker-compose up -d`
- Check entity definitions match database schema
