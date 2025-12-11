/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let createdProductId: number;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    // Register a test user and get auth token (use unique email per test run)
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Test User',
        email: uniqueEmail,
        password: 'testpassword123',
      });

    authToken = registerResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/products (POST) - should create a product', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'E2E Test Product',
        description: 'E2E Test Description',
        price: 29.99,
      })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('E2E Test Product');
        createdProductId = response.body.id;
      });
  });

  it('/products (GET) - should return all products', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
      });
  });

  it('/products/:id (GET) - should return a single product', () => {
    return request(app.getHttpServer())
      .get(`/products/${createdProductId}`)
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty('id', createdProductId);
        expect(response.body).toHaveProperty('name');
      });
  });

  it('/products/:id (PATCH) - should update a product', () => {
    return request(app.getHttpServer())
      .patch(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        price: 39.99,
      })
      .expect(200)
      .then((response) => {
        expect(response.body.price).toBe(39.99);
      });
  });

  it('/products/:id (DELETE) - should delete a product', () => {
    return request(app.getHttpServer())
      .delete(`/products/${createdProductId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });

  it('/products (POST) - should fail validation', () => {
    return request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Invalid Product',
        // missing required fields
      })
      .expect(400);
  });

  it('/products (POST) - should fail without authentication', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({
        name: 'Unauthorized Product',
        description: 'Should fail',
        price: 19.99,
      })
      .expect(401);
  });
});
