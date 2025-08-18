import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health check response', () => {
      const result = appController.getHello();
      expect(result.success).toBe(true);
      expect(result.message).toBe('서버가 정상 동작 중입니다.');
      expect(result.data).toBe('Hello World!');
    });
  });
});
