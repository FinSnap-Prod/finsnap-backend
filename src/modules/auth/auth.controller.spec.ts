import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginRequestDto, LoginRequestParamDto, Provider } from './dto';

describe('OauthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return successful login response', async () => {
      const mockLoginRequest: LoginRequestDto = {
        authorization_code: 'test_auth_code_123',
      };

      const mockLoginParam: LoginRequestParamDto = {
        provider: Provider.GOOGLE,
      };

      const result = await controller.login(mockLoginRequest, mockLoginParam);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      if ('message' in result) {
        expect(result.message).toBe('Login successful');
      }
    });

    it('should handle missing provider or authorization_code', async () => {
      const mockLoginRequest: LoginRequestDto = {
        authorization_code: '',
      };

      const mockLoginParam: LoginRequestParamDto = {
        provider: Provider.GOOGLE,
      };

      try {
        await controller.login(mockLoginRequest, mockLoginParam);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe(
          'Provider and authorization_code are required',
        );
      }
    });
  });
});
