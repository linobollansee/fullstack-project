# API Documentation - Swagger

## Overview

This guide covers comprehensive API documentation using Swagger/OpenAPI 3.0:

- Interactive API documentation at `/api` endpoint
- Automatic request/response schema generation
- JWT Bearer authentication documentation
- Live "Try it out" functionality
- OpenAPI 3.0 specification export
- Organized by tags (auth, products, orders, customers)

---

## Step 1: Install Swagger Dependencies

```bash
cd backend

npm install @nestjs/swagger swagger-ui-express
```

---

## Step 2: Configure Swagger in Main.ts

Update `backend/src/main.ts`:

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Fullstack Shop API')
    .setDescription('REST API for the fullstack online shop application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation available at: ${await app.getUrl()}/api`);
}
bootstrap();
```

---

## Step 3: Document DTOs

### Products DTOs

Update `backend/src/products/dto/create-product.dto.ts`:

```typescript
import { IsString, IsNotEmpty, IsNumber, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
  @ApiProperty({
    description: "The name of the product",
    example: "Laptop",
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Detailed description of the product",
    example: "High-end gaming laptop with RTX 4090",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: "Price of the product in USD",
    example: 1299.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;
}
```

Update `backend/src/products/dto/update-product.dto.ts`:

```typescript
import { PartialType } from "@nestjs/swagger";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### Orders DTOs

Update `backend/src/orders/dto/create-order.dto.ts`:

```typescript
import { IsArray, IsNotEmpty, IsNumber, ArrayMinSize } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateOrderDto {
  @ApiProperty({
    description: "Array of product IDs to include in the order",
    example: [1, 2, 3],
    type: [Number],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  productIds: number[];

  @ApiProperty({
    description: "ID of the customer placing the order",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  customerId: number;
}
```

### Customers DTOs

Update `backend/src/customers/dto/create-customer.dto.ts`:

```typescript
import { IsString, IsNotEmpty, IsEmail, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCustomerDto {
  @ApiProperty({
    description: "Full name of the customer",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Email address of the customer",
    example: "john.doe@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Password for the customer account",
    example: "SecurePassword123",
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
```

### Auth DTOs

Update `backend/src/auth/dto/login.dto.ts`:

```typescript
import { IsEmail, IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    description: "Email address of the customer",
    example: "john.doe@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Password for authentication",
    example: "SecurePassword123",
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
```

Update `backend/src/auth/dto/auth-response.dto.ts`:

```typescript
import { ApiProperty } from "@nestjs/swagger";

class CustomerInfo {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "John Doe" })
  name: string;

  @ApiProperty({ example: "john.doe@example.com" })
  email: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: "JWT access token",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  access_token: string;

  @ApiProperty({
    description: "Customer information",
    type: CustomerInfo,
  })
  customer: CustomerInfo;
}
```

---

## Step 4: Document Entities

Update `backend/src/products/entities/product.entity.ts`:

```typescript
import { ApiProperty } from "@nestjs/swagger";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("products")
export class Product {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: "Laptop" })
  @Column()
  name: string;

  @ApiProperty({ example: "High-end gaming laptop" })
  @Column("text")
  description: string;

  @ApiProperty({ example: 1299.99 })
  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: "2024-01-01T00:00:00.000Z" })
  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## Step 5: Document Controllers

### Products Controller

Update `backend/src/products/products.controller.ts`:

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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";
import { Public } from "../auth/decorators/public.decorator";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({
    status: 201,
    description: "Product successfully created",
    type: Product,
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: "Get all products" })
  @ApiResponse({
    status: 200,
    description: "List of all products",
    type: [Product],
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Public()
  @Get(":id")
  @ApiOperation({ summary: "Get a product by ID" })
  @ApiParam({ name: "id", description: "Product ID", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Product found",
    type: Product,
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update a product" })
  @ApiParam({ name: "id", description: "Product ID", example: 1 })
  @ApiResponse({
    status: 200,
    description: "Product successfully updated",
    type: Product,
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  update(@Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Delete a product" })
  @ApiParam({ name: "id", description: "Product ID", example: 1 })
  @ApiResponse({ status: 204, description: "Product successfully deleted" })
  @ApiResponse({ status: 404, description: "Product not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string) {
    return this.productsService.remove(+id);
  }
}
```

### Auth Controller

Update `backend/src/auth/auth.controller.ts`:

```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { Public } from "./decorators/public.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({
    status: 200,
    description: "Login successful",
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

### Orders Controller

Update `backend/src/orders/orders.controller.ts`:

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
  HttpException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("orders")
@ApiBearerAuth("JWT-auth")
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new order" })
  @ApiResponse({ status: 201, description: "Order successfully created" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() user: any) {
    return this.ordersService.create({
      ...createOrderDto,
      customerId: user.userId,
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all orders for authenticated user" })
  @ApiResponse({ status: 200, description: "List of user orders" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll(@CurrentUser() user: any) {
    return this.ordersService.findByCustomer(user.userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an order by ID" })
  @ApiParam({ name: "id", description: "Order ID", example: 1 })
  @ApiResponse({ status: 200, description: "Order found" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    const order = await this.ordersService.findOne(+id);

    if (order.customerId !== user.userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return order;
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update an order" })
  @ApiParam({ name: "id", description: "Order ID", example: 1 })
  @ApiResponse({ status: 200, description: "Order successfully updated" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Order not found" })
  async update(
    @Param("id") id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() user: any
  ) {
    const order = await this.ordersService.findOne(+id);

    if (order.customerId !== user.userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete an order" })
  @ApiParam({ name: "id", description: "Order ID", example: 1 })
  @ApiResponse({ status: 204, description: "Order successfully deleted" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    const order = await this.ordersService.findOne(+id);

    if (order.customerId !== user.userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }

    return this.ordersService.remove(+id);
  }
}
```

### Customers Controller

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
  HttpException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { Public } from "../auth/decorators/public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

@ApiTags("customers")
@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: "Register a new customer" })
  @ApiResponse({ status: 201, description: "Customer successfully registered" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 409, description: "Email already exists" })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get all customers (Admin only)" })
  @ApiResponse({ status: 200, description: "List of all customers" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findAll() {
    return this.customersService.findAll();
  }

  @Get(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Get customer profile" })
  @ApiParam({ name: "id", description: "Customer ID", example: 1 })
  @ApiResponse({ status: 200, description: "Customer profile" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Customer not found" })
  async findOne(@Param("id") id: string, @CurrentUser() user: any) {
    if (+id !== user.userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
    return this.customersService.findOne(+id);
  }

  @Patch(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Update customer profile" })
  @ApiParam({ name: "id", description: "Customer ID", example: 1 })
  @ApiResponse({ status: 200, description: "Customer successfully updated" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Customer not found" })
  async update(
    @Param("id") id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: any
  ) {
    if (+id !== user.userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
    return this.customersService.update(+id, updateCustomerDto);
  }

  @Delete(":id")
  @ApiBearerAuth("JWT-auth")
  @ApiOperation({ summary: "Delete customer account" })
  @ApiParam({ name: "id", description: "Customer ID", example: 1 })
  @ApiResponse({ status: 204, description: "Customer successfully deleted" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Customer not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    if (+id !== user.userId) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    }
    return this.customersService.remove(+id);
  }
}
```

---

## Step 6: Add Health Check Documentation

Create or update `backend/src/app.controller.ts`:

```typescript
import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Public } from "./auth/decorators/public.decorator";

@ApiTags("health")
@Controller()
export class AppController {
  @Public()
  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Service is healthy",
    schema: {
      example: {
        status: "ok",
        timestamp: "2024-01-01T00:00:00.000Z",
      },
    },
  })
  healthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
```

---

## Step 7: Test Swagger Documentation

1. **Start the backend**:

   ```bash
   cd backend
   npm run start:dev
   ```

2. **Open Swagger UI**:

   - Navigate to: http://localhost:3001/api
   - You should see the interactive API documentation

3. **Test Authentication**:

   - Click on **POST /auth/login**
   - Click **Try it out**
   - Enter credentials
   - Click **Execute**
   - Copy the `access_token` from the response

4. **Authorize**:

   - Click the **Authorize** button at the top
   - Enter: `Bearer YOUR_ACCESS_TOKEN`
   - Click **Authorize**

5. **Test Protected Endpoints**:
   - Try any protected endpoint (orders, customers)
   - Should work with the token

---

## Step 8: Export OpenAPI Specification

Add a script to export the OpenAPI spec to a JSON file.

Create `backend/src/swagger.ts`:

```typescript
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as fs from "fs";

async function generateSwaggerDoc() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("Fullstack Online Shop API")
    .setDescription("RESTful API for managing products, orders, and customers")
    .setVersion("1.0")
    .addTag("auth")
    .addTag("products")
    .addTag("orders")
    .addTag("customers")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  fs.writeFileSync("./swagger-spec.json", JSON.stringify(document, null, 2));
  console.log("Swagger specification generated: swagger-spec.json");

  await app.close();
}

generateSwaggerDoc();
```

Add script to `package.json`:

```json
{
  "scripts": {
    "swagger:generate": "ts-node src/swagger.ts"
  }
}
```

Generate the spec:

```bash
npm run swagger:generate
```

---

## Step 9: Customize Swagger UI

### Add Custom Styling

Create `backend/public/swagger-custom.css`:

```css
.swagger-ui .topbar {
  background-color: #1a202c;
}

.swagger-ui .info .title {
  color: #2d3748;
}

.swagger-ui .opblock.opblock-post {
  border-color: #48bb78;
  background: rgba(72, 187, 120, 0.1);
}

.swagger-ui .opblock.opblock-get {
  border-color: #4299e1;
  background: rgba(66, 153, 225, 0.1);
}
```

Update `main.ts` to include custom CSS:

```typescript
SwaggerModule.setup("api", app, document, {
  customSiteTitle: "Shop API Docs",
  customCss: ".swagger-ui .topbar { background-color: #1a202c; }",
  customfavIcon: "https://nestjs.com/img/logo_text.svg",
});
```

---

## Step 10: Document Common Error Responses

Create `backend/src/common/decorators/api-error-responses.decorator.ts`:

```typescript
import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export function ApiCommonErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: "Bad Request - Invalid input data",
      schema: {
        example: {
          statusCode: 400,
          message: ["email must be an email"],
          error: "Bad Request",
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized - Invalid or missing authentication token",
      schema: {
        example: {
          statusCode: 401,
          message: "Unauthorized",
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: "Internal Server Error",
      schema: {
        example: {
          statusCode: 500,
          message: "Internal server error",
        },
      },
    })
  );
}
```

Use it in controllers:

```typescript
@ApiCommonErrorResponses()
@Controller("products")
export class ProductsController {
  // ... controller methods
}
```

---

## Benefits of API Documentation

1. **Developer Experience**: Easy to understand and test APIs
2. **Client Generation**: Generate TypeScript/JavaScript clients automatically
3. **Testing**: Interactive testing without external tools
4. **Collaboration**: Share API specs with frontend developers
5. **Validation**: Ensures API matches documentation

---

## Additional Resources

- [NestJS OpenAPI Documentation](https://docs.nestjs.com/openapi/introduction)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Specification](https://swagger.io/specification/)

---

## Congratulations! 🎉

You've completed the entire fullstack project walkthrough! You now have:

- ✅ Complete NestJS backend with REST API
- ✅ Next.js frontend with modern UI
- ✅ PostgreSQL database with TypeORM
- ✅ JWT authentication and authorization
- ✅ Docker containerization
- ✅ CI/CD pipeline
- ✅ Comprehensive API documentation

## Next Steps

1. Add more features (search, pagination, filtering)
2. Implement refresh tokens
3. Add email notifications
4. Implement payment integration
5. Add admin dashboard
6. Implement file uploads (product images)
7. Add unit and E2E tests
8. Set up monitoring and logging
9. Optimize performance
10. Deploy to production

## Final Project Structure

```
fullstack-project/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── docker.yml
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── lib/
│   ├── Dockerfile
│   ├── .env.local
│   └── package.json
├── docker-compose.yml
├── walkthroughs/
│   ├── 00-overview.md
│   ├── 01-setup.md
│   ├── 02-products.md
│   ├── 03-orders.md
│   ├── 04-customer.md
│   ├── 05-user-authentication.md
│   ├── 06-deployment.md
│   └── 07-documentation.md
└── README.md
```

Thank you for following this walkthrough series! 🚀
