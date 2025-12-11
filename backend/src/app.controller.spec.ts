import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API information', () => {
      const result = appController.getInfo();
      expect(result).toHaveProperty('name', 'Fullstack Shop API');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('status', 'running');
      expect(result).toHaveProperty('endpoints');
      expect(result.endpoints).toHaveProperty('documentation', '/api');
      expect(result.endpoints).toHaveProperty('products', '/products');
      expect(result.endpoints).toHaveProperty('orders', '/orders');
      expect(result.endpoints).toHaveProperty('customers', '/customers');
      expect(result.endpoints.auth).toHaveProperty('login', '/auth/login');
      expect(result.endpoints.auth).toHaveProperty(
        'register',
        '/auth/register',
      );
    });
  });
});
