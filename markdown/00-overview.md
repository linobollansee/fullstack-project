# Fullstack Online Shop - Project Overview

## Introduction

This walkthrough series will guide you through building a complete fullstack online shop application from scratch. You'll learn how to create a production-ready application with modern web technologies.

## Tech Stack

- **Backend**: NestJS (Node.js framework)
- **Frontend**: Next.js (React framework)
- **Database**: PostgreSQL (SQL database)
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker & Render

## Project Structure

```
fullstack-project/
├── backend/          # NestJS backend application
├── frontend/         # Next.js frontend application
├── docker-compose.yml
└── walkthroughs/     # This guide series
```

## Walkthrough Series

Follow these guides in order to build the complete application:

1. **[Setup](./01-setup.md)** - Initialize projects, database, and CI/CD
2. **[Products](./02-products.md)** - Implement product CRUD operations
3. **[Orders](./03-orders.md)** - Implement order management (Optional)
4. **[Customer](./04-customer.md)** - Implement customer management
5. **[User Authentication](./05-user-authentication.md)** - Add JWT authentication
6. **[Deployment](./06-deployment.md)** - Dockerize and deploy (Bonus)
7. **[Documentation](./07-documentation.md)** - Add Swagger API docs (Bonus)

## Learning Objectives

By completing this project, you will learn:

- Building RESTful APIs with NestJS
- Creating modern frontends with Next.js
- Database design and SQL operations
- User authentication and authorization
- Testing backend and frontend applications
- Component testing with Jest and React Testing Library
- CI/CD pipeline setup
- Docker containerization
- Production deployment

## Prerequisites

- Node.js (v22 or higher)
- npm or yarn
- Git
- Docker Desktop
- Basic knowledge of TypeScript, React, and REST APIs

## Getting Started

Begin with [01-setup.md](./01-setup.md) to initialize your project environment.
