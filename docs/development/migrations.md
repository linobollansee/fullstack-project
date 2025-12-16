# Database Migrations Guide

## Overview

This guide covers database migrations, schema changes, and data management for the Fullstack Online Shop project using TypeORM.

---

## Current Setup

**Status:** ⚠️ Using `synchronize: true` (development only)

The project currently uses TypeORM's auto-synchronization:

```typescript
// backend/src/app.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  synchronize: true,  // ⚠️ Automatically syncs entities with database
  // ...
})
```

**WARNING:** `synchronize: true` automatically creates/updates tables but can cause data loss in production. **Must be disabled for production.**

---

## Production Migration Strategy

### Step 1: Disable Auto-Sync

```typescript
// backend/src/app.module.ts
TypeOrmModule.forRoot({
  type: 'postgres',
  synchronize: process.env.NODE_ENV !== 'production',  // Only in development
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,  // Automatically run migrations on startup
  // ...
})
```

### Step 2: Generate Migrations

```bash
cd backend

# Generate migration from entity changes
npm run migration:generate -- -n CreateInitialSchema

# Or create empty migration
npm run migration:create -- -n AddUserRoles
```

### Step 3: Add npm Scripts

Add to `backend/package.json`:

```json
{
  "scripts": {
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/data-source.ts",
    "migration:create": "typeorm-ts-node-commonjs migration:create",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/data-source.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/data-source.ts",
    "migration:show": "typeorm-ts-node-commonjs migration:show -d src/data-source.ts"
  }
}
```

### Step 4: Create Data Source

Create `backend/src/data-source.ts`:

```typescript
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
```

---

## Migration Workflow

### Creating a New Migration

#### 1. Modify Entity

```typescript
// backend/src/products/entities/product.entity.ts
@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

  // ✨ New field
  @Column({ type: 'varchar', nullable: true })
  sku: string;  // Stock Keeping Unit

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;  // New field

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### 2. Generate Migration

```bash
npm run migration:generate -- -n AddSkuAndStockToProducts
```

Generated file: `src/migrations/1234567890-AddSkuAndStockToProducts.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSkuAndStockToProducts1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN "sku" VARCHAR NULL
    `);
    
    await queryRunner.query(`
      ALTER TABLE "products" 
      ADD COLUMN "stockQuantity" INT NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "products" 
      DROP COLUMN "stockQuantity"
    `);
    
    await queryRunner.query(`
      ALTER TABLE "products" 
      DROP COLUMN "sku"
    `);
  }
}
```

#### 3. Review and Run

```bash
# Review migration
npm run migration:show

# Run migration
npm run migration:run

# Rollback if needed
npm run migration:revert
```

---

## Common Migration Patterns

### Add Column

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    ALTER TABLE "users" 
    ADD COLUMN "email" VARCHAR(255) NOT NULL DEFAULT ''
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    ALTER TABLE "users" 
    DROP COLUMN "email"
  `);
}
```

### Add Column with Data Migration

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  // Add column
  await queryRunner.query(`
    ALTER TABLE "products" 
    ADD COLUMN "slug" VARCHAR(255)
  `);

  // Populate existing records
  await queryRunner.query(`
    UPDATE "products"
    SET "slug" = LOWER(REPLACE("name", ' ', '-'))
  `);

  // Make it NOT NULL after populating
  await queryRunner.query(`
    ALTER TABLE "products" 
    ALTER COLUMN "slug" SET NOT NULL
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    ALTER TABLE "products" 
    DROP COLUMN "slug"
  `);
}
```

### Create Index

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    CREATE INDEX "IDX_products_name" ON "products" ("name")
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    DROP INDEX "IDX_products_name"
  `);
}
```

### Add Foreign Key

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    ALTER TABLE "order_items" 
    ADD CONSTRAINT "FK_order_items_products" 
    FOREIGN KEY ("productId") REFERENCES "products"("id") 
    ON DELETE CASCADE
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    ALTER TABLE "order_items" 
    DROP CONSTRAINT "FK_order_items_products"
  `);
}
```

### Create Table

```typescript
public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`
    CREATE TABLE "categories" (
      "id" SERIAL PRIMARY KEY,
      "name" VARCHAR(255) NOT NULL,
      "description" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    )
  `);
}

public async down(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.query(`DROP TABLE "categories"`);
}
```

---

## Initial Database Schema

### Current Entities

#### Products Table

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  imageUrl VARCHAR(500),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Orders Table

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customerId INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  totalAmount DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT FK_orders_customers FOREIGN KEY (customerId) 
    REFERENCES customers(id) ON DELETE CASCADE
);
```

#### Order Items Table

```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  orderId INTEGER NOT NULL,
  productId INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  CONSTRAINT FK_order_items_orders FOREIGN KEY (orderId) 
    REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT FK_order_items_products FOREIGN KEY (productId) 
    REFERENCES products(id) ON DELETE CASCADE
);
```

#### Customers Table

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Best Practices

### ✅ DO

1. **Always review generated migrations** before running
2. **Test migrations** on copy of production data
3. **Include down() rollback** for every migration
4. **Make migrations idempotent** (safe to run multiple times)
5. **Use transactions** for complex migrations
6. **Backup database** before running migrations
7. **Version control migrations** (commit to git)
8. **Document breaking changes** in migration comments

### ❌ DON'T

1. **Never modify existing migrations** (create new one instead)
2. **Never use synchronize:true** in production
3. **Avoid data loss** in down() migrations
4. **Don't skip failed migrations** (fix and rerun)
5. **Don't delete migrations** from version control

---

## Data Seeding

### Creating Seed Files

Create `backend/src/seeds/` directory:

```typescript
// backend/src/seeds/product.seed.ts
import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';

export async function seedProducts(dataSource: DataSource) {
  const productRepository = dataSource.getRepository(Product);

  const products = [
    {
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      price: 29.99,
      imageUrl: 'https://example.com/mouse.jpg',
    },
    {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard',
      price: 129.99,
      imageUrl: 'https://example.com/keyboard.jpg',
    },
  ];

  for (const product of products) {
    const exists = await productRepository.findOne({
      where: { name: product.name },
    });
    
    if (!exists) {
      await productRepository.save(product);
      console.log(`Created product: ${product.name}`);
    }
  }
}
```

### Running Seeds

```typescript
// backend/src/seeds/index.ts
import { AppDataSource } from '../data-source';
import { seedProducts } from './product.seed';

async function runSeeds() {
  await AppDataSource.initialize();
  console.log('Data Source has been initialized!');

  await seedProducts(AppDataSource);

  await AppDataSource.destroy();
  console.log('Seeding completed!');
}

runSeeds().catch((error) => console.error(error));
```

Add script to `package.json`:

```json
{
  "scripts": {
    "seed": "ts-node src/seeds/index.ts"
  }
}
```

Run seeds:

```bash
npm run seed
```

---

## Rollback Strategy

### Revert Last Migration

```bash
npm run migration:revert
```

### Revert Multiple Migrations

```bash
# Revert last 3 migrations
npm run migration:revert
npm run migration:revert
npm run migration:revert
```

### Emergency Rollback

```sql
-- Check applied migrations
SELECT * FROM migrations ORDER BY timestamp DESC;

-- Manual rollback (last resort)
DELETE FROM migrations WHERE name = '1234567890-MigrationName';
-- Then manually undo schema changes
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/migrations.yml
name: Database Migrations

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Run migrations
        working-directory: ./backend
        env:
          DATABASE_HOST: ${{ secrets.DATABASE_HOST }}
          DATABASE_USER: ${{ secrets.DATABASE_USER }}
          DATABASE_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}
          DATABASE_NAME: ${{ secrets.DATABASE_NAME }}
        run: npm run migration:run
```

---

## Troubleshooting

### Migration Already Run

**Problem:** "Migration has already been applied"

**Solution:**
```sql
-- Check migrations table
SELECT * FROM migrations;

-- Remove specific migration record (careful!)
DELETE FROM migrations WHERE name = 'MigrationName';
```

### Failed Migration

**Problem:** Migration fails halfway through

**Solution:**
1. Fix the migration code
2. Manually rollback database changes
3. Delete migration record: `DELETE FROM migrations WHERE name = '...'`
4. Run migration again

### Synchronize Conflict

**Problem:** Entity changes don't match database

**Solution:**
```bash
# Generate migration from current state
npm run migration:generate -- -n SyncChanges

# Review and run
npm run migration:run
```

---

## Production Checklist

Before deploying migrations to production:

- [ ] Tested on development database
- [ ] Tested on staging database with production data copy
- [ ] Reviewed generated SQL queries
- [ ] down() rollback implemented and tested
- [ ] Database backup created
- [ ] Estimated migration duration (for long-running migrations)
- [ ] Downtime window scheduled (if needed)
- [ ] Rollback plan documented
- [ ] Team notified

---

## Related Documentation

- [Database Schema](../architecture/database-schema.md)
- [Environment Variables](environment-variables.md)
- [Deployment Guide](../guides/06-deployment.md)
- [Troubleshooting](../troubleshooting/common-issues.md#database-migrations)
