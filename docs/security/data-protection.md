# Data Protection & Privacy

## Overview

Data protection strategies, GDPR compliance guidelines, and privacy best practices for the Fullstack Online Shop.

---

## Data Classification

### Sensitive Data

**Highly Sensitive:**
- Passwords (hashed)
- Payment information (future)
- Authentication tokens

**Moderately Sensitive:**
- Email addresses
- Customer names
- Order history
- IP addresses

**Public Data:**
- Product names and descriptions
- Product prices
- Product images

---

## Data Storage

### Password Storage

**Current Implementation:**
```typescript
// ✅ Secure password hashing with bcrypt
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
```

**Security Measures:**
- ✅ Never store plain text passwords
- ✅ Use bcrypt with 12 salt rounds
- ✅ Unique salt per password (automatic with bcrypt)
- ✅ Constant-time comparison
- ✅ Never return passwords in API responses

### Database Security

**PostgreSQL Security:**
```sql
-- Use strong passwords
ALTER USER admin WITH PASSWORD 'YourStrongPasswordHere123!';

-- Restrict permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- Enable SSL connections (production)
ALTER SYSTEM SET ssl = on;
```

**Environment Variables:**
```env
# Never commit these to version control
DATABASE_PASSWORD=use-strong-password-here
JWT_SECRET=use-long-random-secret-32-chars-minimum
```

---

## GDPR Compliance

### Right to Access

**Implementation:**

```typescript
// backend/src/customers/customers.controller.ts
@Get(':id/data-export')
@UseGuards(JwtAuthGuard)
async exportCustomerData(
  @Param('id', ParseIntPipe) id: number,
  @CurrentUser() user: AuthUser,
) {
  // Verify user can only access their own data
  if (user.id !== id) {
    throw new ForbiddenException();
  }

  const customer = await this.customersService.findOne(id);
  const orders = await this.ordersService.findByCustomer(id);

  return {
    customer: {
      id: customer.id,
      email: customer.email,
      name: customer.name,
      createdAt: customer.createdAt,
    },
    orders: orders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items,
    })),
  };
}
```

### Right to Deletion

**Implementation:**

```typescript
// backend/src/customers/customers.controller.ts
@Delete(':id')
@UseGuards(JwtAuthGuard)
async deleteAccount(
  @Param('id', ParseIntPipe) id: number,
  @CurrentUser() user: AuthUser,
) {
  // Verify user can only delete their own account
  if (user.id !== id) {
    throw new ForbiddenException();
  }

  // Strategy 1: Hard delete
  await this.customersService.remove(id);

  // Strategy 2: Soft delete (recommended)
  await this.customersService.softDelete(id);

  // Strategy 3: Anonymize
  await this.customersService.anonymize(id);

  return { message: 'Account deleted successfully' };
}
```

**Soft Delete Implementation:**

```typescript
// backend/src/customers/entities/customer.entity.ts
@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @DeleteDateColumn()
  deletedAt: Date;  // Soft delete timestamp

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Data Anonymization

```typescript
// backend/src/customers/customers.service.ts
async anonymize(id: number): Promise<void> {
  const customer = await this.findOne(id);

  // Anonymize personal data
  customer.email = `deleted_${customer.id}@anonymized.local`;
  customer.name = `Deleted User ${customer.id}`;
  customer.password = 'DELETED';

  await this.customersRepository.save(customer);

  // Keep orders for business records but anonymize
  // (required for accounting/tax purposes in many jurisdictions)
}
```

### Consent Management

**Privacy Policy Acceptance:**

```typescript
// backend/src/customers/entities/customer.entity.ts
@Entity('customers')
export class Customer {
  // ... existing fields

  @Column({ default: false })
  privacyPolicyAccepted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  privacyPolicyAcceptedAt: Date;

  @Column({ default: false })
  marketingEmailsConsent: boolean;
}
```

**Registration with Consent:**

```typescript
// backend/src/auth/dto/auth.dto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsBoolean()
  privacyPolicyAccepted: boolean;  // Must be true

  @IsBoolean()
  @IsOptional()
  marketingEmailsConsent?: boolean;
}
```

---

## Data Encryption

### Data in Transit

**HTTPS Configuration (Production):**

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Data at Rest

**Database Encryption:**

```bash
# PostgreSQL transparent data encryption (TDE)
# Requires PostgreSQL with encryption support

# File-level encryption
# Encrypt database files on disk using LUKS or similar
```

**Encrypted Backups:**

```bash
# Encrypted PostgreSQL backup
pg_dump shopdb | gpg --encrypt --recipient your-key@example.com > backup.sql.gpg

# Restore encrypted backup
gpg --decrypt backup.sql.gpg | psql shopdb
```

---

## Access Control

### Principle of Least Privilege

**Database Users:**

```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Create app user with limited permissions
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
REVOKE ALL ON customers FROM app_user;
GRANT SELECT (id, email, name) ON customers TO app_user;  -- No password column
```

### API Access Control

```typescript
// Only return necessary fields
@Get(':id')
@UseGuards(JwtAuthGuard)
async findOne(
  @Param('id', ParseIntPipe) id: number,
  @CurrentUser() user: AuthUser,
) {
  if (user.id !== id) {
    throw new ForbiddenException('Cannot access other users data');
  }

  const customer = await this.customersService.findOne(id);

  // ✅ Don't return password
  const { password, ...safeCustomer } = customer;
  return safeCustomer;
}
```

---

## Data Retention

### Retention Policy

**Recommended Retention Periods:**

| Data Type | Retention Period | Reason |
|-----------|------------------|--------|
| Customer accounts | Until deletion requested | User data |
| Order history | 7 years | Legal/tax requirements |
| Authentication logs | 90 days | Security audit |
| Application logs | 30 days | Debugging |
| Soft-deleted accounts | 30 days | Grace period |

### Automated Cleanup

```typescript
// backend/src/tasks/cleanup.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';

@Injectable()
export class CleanupService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  // Run daily at 2 AM
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupSoftDeletedAccounts() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Permanently delete accounts soft-deleted > 30 days ago
    await this.customersRepository.delete({
      deletedAt: LessThan(thirtyDaysAgo),
    });

    console.log('Cleaned up old soft-deleted accounts');
  }

  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOldLogs() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Delete old authentication logs
    // Implementation depends on logging strategy
  }
}
```

---

## Privacy by Design

### Data Minimization

**✅ DO:**
- Only collect necessary data
- Don't store data you don't need
- Remove unnecessary fields from forms
- Use aggregate data when possible

**Example:**
```typescript
// ❌ Don't collect unnecessary data
export class CreateCustomerDto {
  email: string;
  name: string;
  password: string;
  phoneNumber: string;  // Not needed for this app
  address: string;      // Not needed yet
  birthDate: Date;      // Not needed
}

// ✅ Only collect what's necessary
export class CreateCustomerDto {
  email: string;
  name: string;
  password: string;
}
```

### Purpose Limitation

Use data only for its stated purpose:

```typescript
// ✅ Use email for authentication
async login(email: string) {
  const customer = await this.customersRepository.findOne({ where: { email } });
  // ... authentication logic
}

// ❌ Don't use email for unrelated purposes
async sendMarketingEmails() {
  // Don't send marketing emails unless user explicitly consented
  const customers = await this.customersRepository.find({
    where: { marketingEmailsConsent: true },  // Check consent
  });
}
```

---

## Breach Response Plan

### Detection

**Monitoring:**
- Failed login attempts
- Unusual access patterns
- Database anomalies
- Unauthorized API calls

### Response Steps

1. **Immediate Actions:**
   - Isolate affected systems
   - Preserve logs and evidence
   - Stop the breach

2. **Assessment:**
   - Identify affected data
   - Determine breach scope
   - Count affected users

3. **Notification:**
   - Notify affected users (within 72 hours - GDPR)
   - Report to data protection authority
   - Prepare public statement

4. **Remediation:**
   - Fix security vulnerability
   - Force password resets
   - Revoke compromised tokens
   - Update security measures

5. **Post-Incident:**
   - Document lessons learned
   - Update security policies
   - Train team on prevention

---

## Logging & Auditing

### Security Logging

```typescript
// backend/src/auth/auth.service.ts
async login(email: string, password: string) {
  const customer = await this.customersService.findByEmail(email);

  if (!customer) {
    // ✅ Log failed attempt (but not the password!)
    this.logger.warn(`Failed login attempt for email: ${email}`);
    throw new UnauthorizedException('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, customer.password);

  if (!isMatch) {
    // ✅ Log failed attempt
    this.logger.warn(`Failed login attempt for email: ${email} - wrong password`);
    throw new UnauthorizedException('Invalid credentials');
  }

  // ✅ Log successful login
  this.logger.log(`Successful login for customer ID: ${customer.id}`);

  return this.generateToken(customer);
}
```

### Audit Trail

```typescript
// backend/src/audit/entities/audit-log.entity.ts
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: number;

  @Column()
  action: string;  // 'LOGIN', 'CREATE_ORDER', 'UPDATE_PROFILE', 'DELETE_ACCOUNT'

  @Column('json', { nullable: true })
  metadata: any;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## Third-Party Data Sharing

### Current Status

**No Third-Party Sharing:** Currently, customer data is not shared with third parties.

### Future Considerations

**If Third-Party Services Added:**
- ✅ Data Processing Agreements (DPA)
- ✅ Privacy Policy updates
- ✅ User consent collection
- ✅ Third-party security assessment
- ✅ Data transfer mechanisms (Standard Contractual Clauses)

---

## Cookie Policy

### Current Cookie Usage

**Frontend (Next.js):**
- Session cookies (Next.js default)
- No tracking cookies
- No third-party cookies

**Recommended Cookie Banner:**

```tsx
// frontend/src/components/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <p>
          We use essential cookies to ensure our website functions properly.
          No tracking cookies are used.
        </p>
        <button
          onClick={acceptCookies}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
```

---

## Best Practices Summary

### ✅ DO

1. **Hash passwords** with bcrypt (12+ rounds)
2. **Use HTTPS** in production
3. **Validate all inputs**
4. **Minimize data collection**
5. **Encrypt sensitive data** at rest and in transit
6. **Log security events** (without sensitive data)
7. **Implement access controls**
8. **Regular security audits**
9. **Keep dependencies updated**
10. **Document data retention policies**

### ❌ DON'T

1. **Store plain text passwords**
2. **Log sensitive data** (passwords, tokens)
3. **Return unnecessary data** from APIs
4. **Use weak encryption**
5. **Ignore security updates**
6. **Share data without consent**
7. **Keep data indefinitely**
8. **Expose internal errors** to users
9. **Skip input validation**
10. **Use default credentials**

---

## Compliance Checklist

- [ ] Privacy policy published
- [ ] Cookie policy published
- [ ] Terms of service published
- [ ] Consent mechanisms implemented
- [ ] Right to access implemented
- [ ] Right to deletion implemented
- [ ] Right to data portability implemented
- [ ] Data retention policy defined
- [ ] Security measures documented
- [ ] Breach response plan created
- [ ] Data Protection Officer appointed (if required)
- [ ] GDPR compliance verified (EU users)
- [ ] CCPA compliance verified (California users)
- [ ] Regular security audits scheduled

---

## Related Documentation

- [Security Guidelines](guidelines.md)
- [Authentication Guide](auth.md)
- [Environment Variables](../development/environment-variables.md)
- [Deployment Security](../guides/06-deployment.md#security)
