# Contributing to Fullstack Project

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** if applicable
- **Environment details** (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** and **rationale**
- **Possible implementation** approach (if you have ideas)

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** of the project
3. **Write clear commit messages** following conventional commits
4. **Add tests** for new features
5. **Update documentation** as needed
6. **Ensure all tests pass** before submitting

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Git

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/username/fullstack-project.git
   cd fullstack-project
   ```

2. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy example env files and configure them
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. Run with Docker Compose:
   ```bash
   docker-compose up
   ```

### Running Tests

```bash
# Backend tests
cd backend
npm test
npm run test:e2e

# Frontend tests
cd frontend
npm test
```

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the existing code structure and patterns
- Add comments for complex logic
- Keep functions small and focused

### TypeScript

- Use TypeScript strict mode
- Define proper types/interfaces (avoid `any`)
- Follow ESLint configuration

### Backend (NestJS)

- Follow NestJS best practices
- Use dependency injection
- Create DTOs for request/response validation
- Write unit tests for services
- Write E2E tests for controllers

### Frontend (Next.js/React)

- Use functional components with hooks
- Follow React best practices
- Keep components focused and reusable
- Write tests for components
- Use proper TypeScript types for props

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```
feat(products): add product search functionality
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
```

## Project Structure

```
fullstack-project/
├── backend/          # NestJS backend
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── products/ # Products module
│   │   ├── orders/   # Orders module
│   │   └── customers/# Customers module
│   └── test/         # E2E tests
├── frontend/         # Next.js frontend
│   └── src/
│       ├── app/      # App router pages
│       ├── components/ # React components
│       ├── context/  # React context
│       └── lib/      # Utilities
└── markdown/         # Documentation
```

## Review Process

1. All submissions require review before merging
2. Maintainers will review your PR and may request changes
3. Address review feedback promptly
4. Once approved, a maintainer will merge your PR

## Questions?

If you have questions, feel free to:
- Open an issue with the `question` label
- Contact the maintainers directly

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Recognition

Contributors will be recognized in the project's README and release notes.

Thank you for contributing! 🎉
