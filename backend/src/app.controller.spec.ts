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
    it('should return backend status message', () => {
      const result = appController.getInfo();
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Backend is working');
      expect(result.message).toContain('/api');
    });
  });
});
