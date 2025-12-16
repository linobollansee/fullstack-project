# Security Guidelines

## Overview

Security is a critical aspect of the Fullstack Online Shop. This document outlines the security measures implemented and best practices to follow.

## Authentication & Authorization

### Password Security

✅ **Implemented:**
- Passwords hashed using bcrypt with 12 salt rounds
- Minimum password length enforced (8 characters)
- Passwords never returned in API responses

⚠️ **Recommended Enhancements:**
- Enforce password complexity (uppercase, lowercase, numbers, symbols)
- Implement password strength meter on frontend
- Add password history to prevent reuse
- Implement account lockout after failed attempts

### JWT Tokens

✅ **Implemented:**
- Tokens signed with secret key
- Configurable expiration (default 24 hours)
- Tokens validated on protected routes

⚠️ **Recommended Enhancements:**
- Implement refresh tokens
- Add token blacklist for logout
- Reduce token expiration time (e.g., 1 hour)
- Store JWT secret in secure vault (not .env)
- Implement token rotation

### Current JWT Configuration

```typescript
// Ensure JWT_SECRET is strong
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=1d
```

**Generate a secure secret:**
```bash
node scripts/security/generate-secret.js
```

## Input Validation

### Backend Validation

✅ **Implemented:**
- class-validator for DTO validation
- Automatic validation via ValidationPipe
- Whitelist mode to strip unknown properties
- Transform mode for type coercion

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,  // Strip non-whitelisted properties
    transform: true,  // Transform payloads to DTO instances
  }),
);
```

### Common Validation Rules

```typescript
// Email validation
@IsEmail()
email: string;

// String constraints
@IsString()
@MinLength(8)
@MaxLength(100)
password: string;

// Number constraints
@IsNumber()
@Min(0)
@Max(999999.99)
price: number;
```

## Data Protection

### Sensitive Data Handling

✅ **Implemented:**
- Passwords excluded from responses (destructuring)
- Customer-specific data access control

⚠️ **Recommended Enhancements:**
- Implement field-level encryption for sensitive data
- Add data masking for logs
- Implement audit logging for sensitive operations

### Database Security

✅ **Implemented:**
- Parameterized queries (via TypeORM)
- Environment-based database credentials

⚠️ **Recommended Enhancements:**
- Use read-only database user for queries
- Implement database encryption at rest
- Regular database backups
- Connection pooling limits

## API Security

### CORS Configuration

✅ **Implemented:**
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://your-production-frontend.com',
  ],
  credentials: true,
});
```

⚠️ **Recommended Enhancements:**
- Environment-specific CORS origins
- Restrict allowed headers
- Limit allowed methods

### Rate Limiting

❌ **Not Implemented**

**Recommendation:**
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
  ],
})
```

### Security Headers

❌ **Not Implemented**

**Recommendation:**
```typescript
import helmet from 'helmet';
app.use(helmet());
```

Helmet sets important security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security`
- `X-XSS-Protection`

## Environment Variables

### Secure Configuration

✅ **Implemented:**
- `.env` files for configuration
- `.env` in `.gitignore`
- `.env.example` for documentation

⚠️ **Best Practices:**
```bash
# ❌ Bad - weak secrets
JWT_SECRET=secret
DATABASE_PASSWORD=admin

# ✅ Good - strong secrets
JWT_SECRET=8f3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a
DATABASE_PASSWORD=Xk9$mP2#vL8@qR5!
```

### Secret Management

**Development:**
- Use `.env` files (never commit)
- Generate secrets with `generate-jwt-secret.js`

**Production:**
- Use environment variables in hosting platform
- Consider secret management tools (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly

## HTTPS/TLS

### Development
- HTTP acceptable for local development
- Use `localhost` not `127.0.0.1` for better security

### Production
- **Always use HTTPS**
- Obtain SSL certificate (Let's Encrypt, Cloudflare)
- Redirect HTTP to HTTPS
- Set `Strict-Transport-Security` header

## Logging & Monitoring

### Current State

⚠️ **Limited logging:**
- Console.log statements in main.ts
- No structured logging
- No error tracking

### Recommendations

1. **Implement Structured Logging:**
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});
```

2. **Security Event Logging:**
- Failed login attempts
- Permission denied events
- Unusual activity patterns

3. **Error Monitoring:**
- Integrate Sentry or similar
- Track exceptions and stack traces
- Alert on critical errors

## Dependency Security

### Current Practices

✅ **Good:**
- Using latest stable versions
- Regular updates

⚠️ **Recommended:**
```bash
# Audit dependencies
npm audit

# Fix vulnerabilities
npm audit fix

# Check for outdated packages
npm outdated
```

### Automated Security

Add to GitHub Actions:
```yaml
- name: Run security audit
  run: npm audit --audit-level=moderate
```

Use Dependabot for automated dependency updates.

## Common Vulnerabilities

### SQL Injection

✅ **Protected:** TypeORM uses parameterized queries

### XSS (Cross-Site Scripting)

⚠️ **Frontend responsibility:**
- React escapes content by default
- Never use `dangerouslySetInnerHTML` without sanitization

### CSRF (Cross-Site Request Forgery)

⚠️ **Not implemented**

**Recommendation for state-changing operations:**
```typescript
import * as csurf from 'csurf';
app.use(csurf());
```

### CORS Misconfiguration

✅ **Properly configured** with specific origins

### Exposed Secrets

✅ **Protected:**
- `.env` in `.gitignore`
- Secrets not hardcoded

⚠️ **Watch for:**
- Secrets in error messages
- Secrets in logs
- Secrets in client-side code

## Security Checklist

### Before Production Deployment

- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Enable HTTPS
- [ ] Set security headers (Helmet)
- [ ] Implement rate limiting
- [ ] Remove debug/console logs
- [ ] Set `synchronize: false` in TypeORM
- [ ] Review CORS configuration
- [ ] Implement proper error handling
- [ ] Set up monitoring and alerting
- [ ] Regular security audits
- [ ] Backup strategy in place

## Incident Response

### If a Security Issue is Discovered

1. **Assess the severity**
2. **Contain the issue** (disable compromised accounts, rotate secrets)
3. **Investigate** (check logs, database)
4. **Notify users** if data was compromised
5. **Fix the vulnerability**
6. **Document** the incident and response

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Documentation](https://docs.nestjs.com/security/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Related Documentation

- [Authentication Guide](./auth.md)
- [API Design](../architecture/api-design.md)
