# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is this project?

A: This is a fullstack e-commerce application built with NestJS (backend), Next.js (frontend), and PostgreSQL (database). It demonstrates modern web development practices including REST APIs, JWT authentication, and Docker deployment.

### Q: What technologies are used?

A: 
- **Backend**: NestJS 11, TypeORM, PostgreSQL, Passport, JWT
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Database**: PostgreSQL 18
- **Testing**: Jest, Supertest, React Testing Library
- **DevOps**: Docker, Docker Compose, GitHub Actions

### Q: Is this production-ready?

A: The project is suitable for learning and demonstration purposes. For production use, review the [Security Guidelines](../security/guidelines.md) and implement recommended enhancements such as:
- Rate limiting
- Proper logging
- Database migrations (disable `synchronize`)
- Enhanced error handling
- Monitoring and alerts

## Setup & Installation

### Q: What are the system requirements?

A:
- Node.js 22 or higher
- Docker Desktop
- Git
- At least 4GB RAM
- 5GB free disk space

### Q: Why isn't the database connecting?

A: Check these common issues:
1. **Docker not running**: Start Docker Desktop
2. **Port conflict**: Another service using port 5432
3. **Wrong credentials**: Check `.env` file matches `docker-compose.yml`
4. **Container not healthy**: Run `docker ps` to check status

See [Database Connection Issues](./common-issues.md#database-connection-issues) for details.

### Q: How do I reset the database?

A:
```bash
# Stop and remove containers
docker compose down -v

# Start fresh
docker compose up -d postgres
```

**Warning:** This deletes all data!

## Development

### Q: How do I run the project locally?

A:
```bash
# Start database
docker compose up -d postgres

# Backend (terminal 1)
cd backend
npm install
npm run start:dev

# Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger Docs: http://localhost:3001/api

### Q: Why are my changes not showing up?

A:
- **Backend**: Check if `npm run start:dev` is running (hot reload enabled)
- **Frontend**: Refresh browser (Next.js hot reload is automatic)
- **Environment variables**: Restart server after changing `.env`
- **Browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Q: How do I debug the backend?

A:
```bash
npm run start:debug
```

Then attach debugger in VS Code:
1. Open "Run and Debug" panel
2. Click "Attach to NestJS"
3. Set breakpoints in code

### Q: How do I run tests?

A:
```bash
# Backend unit tests
cd backend
npm test

# Backend E2E tests
npm run test:e2e

# Frontend tests
cd frontend
npm test
```

## Authentication

### Q: How does authentication work?

A: The app uses JWT (JSON Web Tokens):
1. User registers/logs in via `/auth/register` or `/auth/login`
2. Backend returns a JWT token
3. Frontend stores token in localStorage
4. Token included in Authorization header for protected requests
5. Backend validates token with JWT Guard

See [Authentication Guide](../security/auth.md) for details.

### Q: Why am I getting 401 Unauthorized?

A:
1. **Token missing**: Did you login? Check localStorage for token
2. **Token expired**: Default expiration is 24 hours, login again
3. **Invalid token**: Token format wrong or secret key changed
4. **Wrong endpoint**: Check you're using correct API URL

### Q: How do I logout?

A: Logout is client-side only:
```typescript
localStorage.removeItem('token');
localStorage.removeItem('user');
```

Server-side logout (blacklist) not yet implemented.

### Q: Can I change token expiration?

A: Yes, modify `.env`:
```env
JWT_EXPIRES_IN=1h   # 1 hour
JWT_EXPIRES_IN=7d   # 7 days
JWT_EXPIRES_IN=1d   # 1 day (default)
```

## API Usage

### Q: Where is the API documentation?

A: Interactive Swagger docs at:
- Development: http://localhost:3001/api
- Also see [API Overview](../api/overview.md)

### Q: How do I test API endpoints?

A: Multiple options:
1. **Swagger UI**: http://localhost:3001/api (click "Try it out")
2. **Postman**: Import OpenAPI spec from Swagger
3. **curl**: Command-line requests
4. **Frontend**: Use the Next.js frontend

### Q: Why am I getting CORS errors?

A: 
1. **Check origin**: Backend only allows specific origins (localhost:3000 by default)
2. **Update CORS config** in `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'https://your-domain.com'],
  credentials: true,
});
```

### Q: What's the difference between PATCH and PUT?

A:
- **PATCH**: Update specific fields (partial update)
- **PUT**: Replace entire resource (not used in this API)

This API uses PATCH for updates.

## Database

### Q: How do I view the database?

A: Options:
1. **psql CLI**:
```bash
docker exec -it fullstack-postgres psql -U admin -d shopdb
```

2. **pgAdmin**: Install separately and connect to localhost:5432

3. **TablePlus / DBeaver**: GUI database clients

### Q: Why is `synchronize: true` used?

A: For development convenience - TypeORM automatically syncs schema with entities.

**Warning:** Never use in production! Use migrations instead.

### Q: How do I backup the database?

A:
```bash
docker exec fullstack-postgres pg_dump -U admin shopdb > backup.sql
```

Restore:
```bash
docker exec -i fullstack-postgres psql -U admin shopdb < backup.sql
```

## Deployment

### Q: How do I deploy to production?

A: See [Deployment Guide](../guides/06-deployment.md). Options include:
- Docker containers (recommended)
- Render, Heroku, AWS, etc.
- Docker Compose for VPS

### Q: What environment variables are needed in production?

A: See `.env.example` files. Required:
- `DATABASE_*`: Database connection
- `JWT_SECRET`: Strong secret key (32+ characters)
- `NODE_ENV=production`
- `NEXT_PUBLIC_API_URL`: Frontend API URL

### Q: Should I use Docker in production?

A: Yes, Docker is recommended for:
- Consistent environment
- Easy scaling
- Simplified deployment

## Troubleshooting

### Q: Why is the app slow?

A: Check:
1. **Database queries**: N+1 query problems
2. **No pagination**: Loading too much data
3. **Development mode**: Use production build
4. **Network**: Check API response times

### Q: How do I see logs?

A:
```bash
# Backend logs
npm run start:dev  # Displays in terminal

# Docker logs
docker compose logs -f backend
docker compose logs -f postgres

# Frontend logs
npm run dev  # Displays in terminal
# Also check browser console
```

### Q: Where can I get help?

A:
1. Check [Common Issues](./common-issues.md)
2. Review [Troubleshooting Guide](./debugging.md)
3. Search existing GitHub issues
4. Open a new issue with details

## Contributing

### Q: How can I contribute?

A: See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines. We welcome:
- Bug reports
- Feature requests
- Pull requests
- Documentation improvements

### Q: What should I work on?

A: Check:
- GitHub Issues labeled "good first issue"
- [Project Status](../planning/project-status.md) for TODO items
- Best practices recommendations

## Testing

### Q: Why are tests failing?

A: Common causes:
1. **Database not running**: Start PostgreSQL
2. **Wrong environment**: Check test database config
3. **Async timing**: Add proper awaits
4. **Dirty database**: Tests not cleaning up

### Q: How do I write tests?

A: See [Testing Guide](../testing/testing-guide.md). Examples:
- Unit tests: Test services in isolation
- E2E tests: Test full request/response cycle
- Component tests: Test React components

### Q: What's the test coverage?

A:
```bash
cd backend
npm run test:cov
```

Target: 80%+ coverage

## Performance

### Q: How many requests can the API handle?

A: Depends on:
- Server resources
- Database connection pool
- Query complexity
- No performance testing done yet

Implement rate limiting and monitoring for production.

### Q: Should I add caching?

A: For production, consider:
- Redis for session storage
- Cache product listings
- Cache static content with CDN

## Still Have Questions?

- Review the [full documentation](../README.md)
- Check [Troubleshooting Guide](./common-issues.md)
- Open an issue on GitHub
