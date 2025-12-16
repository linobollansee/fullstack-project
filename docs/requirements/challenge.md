# Fullstack Project
For this fullstack project we are going to implement a minimalistic online shop. Techstack:

- NestJS Backend
- NextJS Frontend
- SQL Database
- JWT User Authentication

## Setup
- Create a new directory with a git repository for this project. Inside of the project directory create a nestjs project and a nextjs project.

- Setup a branch protection on github.
- Setup a CI workflow to run your frontend and your backend tests.
- Setup a SQL database (e.g. PostgreSQL) for your application. You can use a local Docker installation.
- Setup CORS in your NestJS backend to allow requests from your NextJS frontend.
```
const app = await NestFactory.create(AppModule);
app.enableCors();
await app.listen(process.env.PORT ?? 3001);
```

## Products
Create a full CRUD application for products. This includes the following features:

- A product has the following properties: id, name, description, price
- Create a REST API in the NestJS backend to manage products (create, read, update, delete).
- Save products in a SQL database.
- Create a NextJS frontend to display the list of products and a form to add new products.
- Test your application (both frontend and backend).

## Orders (Optional)
Create a full CRUD application for orders. This includes the following features:

- An order has the following properties: id, productIds, totalPrice, customerId
- Create a REST API in the NestJS backend to manage orders (create, read, update, delete).
- Save orders in a SQL database.
- Create a NextJS frontend to display the list of orders and a form to add new orders.
- Test your application (both frontend and backend).
- No Authentication is required for this part yet.

## Customer
Create a full CRUD application for customers. This includes the following features:

- A customer has the following properties: id, name, email, orderIds
- Create a REST API in the NestJS backend to manage customers (create, read, update, delete).
- Save customers in a SQL database.
- Create a NextJS frontend to display the list of customers and a form to add new customers.
- Test your application (both frontend and backend).

## User Authentication
Implement user authentication using JWT. This includes the following features:

- Add a password to your customer model. Make sure to hash passwords before saving them to the database!
- Create a login endpoint in the NestJS backend that returns a JWT token upon successful authentication.
- Protect the product, order, and customer management endpoints so that only authenticated users can access them.
  - GET Products should be public, all other endpoints should be protected.
  - Each user should be only able to manage their own customers and orders.

## Deployment (Bonus)
Deploy your application via Docker.

- Create Dockerfiles for both the frontend and backend.
- Create a docker-compose file to run both services together.
- Deploy both images separately on render.

## Documentation (Bonus)
Document your API using Swagger in the NestJS backend. [NestJS Swagger Documentation](https://docs.nestjs.com/openapi/introduction)