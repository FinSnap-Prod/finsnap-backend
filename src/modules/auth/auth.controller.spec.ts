import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginRequestDto, LoginRequestParamDto, Provider } from './dto';
import { Response } from 'express';

// Swagger 데코레이터들을 모킹
jest.mock('@nestjs/swagger', () => ({
  ApiTags: () => jest.fn(),
  ApiOperation: () => jest.fn(),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockResponse = {
    cookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            verifyAuthorizationCode: jest.fn(),
            verifyGoogleToken: jest.fn(),
            findOrCreateUser: jest.fn(),
            generateTokens: jest.fn(),
            storeTokens: jest.fn(),
            refreshAccessToken: jest.fn(),
            storeAccessToken: jest.fn(),
            findUserById: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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

      const mockUser = {
        id: 'test-user-id',
        email: 'test@test.com',
        nickname: 'Test User',
        profile_image: 'https://example.com/avatar.jpg',
        social_id: 'mock-social-id',
        provider: 'google',
      };

      const mockTokens = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };

      jest
        .spyOn(authService, 'verifyAuthorizationCode')
        .mockResolvedValue('mock-google-token');
      jest.spyOn(authService, 'verifyGoogleToken').mockResolvedValue({
        socialId: 'mock-social-id',
        email: 'test@test.com',
        nickname: 'Test User',
        profile_image: 'https://example.com/avatar.jpg',
      });
      jest.spyOn(authService, 'findOrCreateUser').mockResolvedValue(mockUser);
      jest.spyOn(authService, 'generateTokens').mockResolvedValue(mockTokens);
      jest.spyOn(authService, 'storeTokens').mockResolvedValue(undefined);

      const result = await controller.login(
        mockLoginRequest,
        mockLoginParam,
        mockResponse,
      );

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      if ('message' in result) {
        expect(result.message).toBe('Login successful');
      }
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        mockTokens.refresh_token,
        expect.any(Object),
      );
    });

    it('should handle missing authorization_code', async () => {
      const mockLoginRequest: LoginRequestDto = {
        authorization_code: '',
      };

      const mockLoginParam: LoginRequestParamDto = {
        provider: Provider.GOOGLE,
      };

      const result = await controller.login(
        mockLoginRequest,
        mockLoginParam,
        mockResponse,
      );

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(401);
    });
  });

  describe('refresh', () => {
    it('should refresh access token successfully', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@test.com',
        nickname: 'Test User',
        profile_image: 'https://example.com/avatar.jpg',
        refresh_token: 'mock-refresh-token',
      };

      const mockNewAccessToken = 'new-access-token';

      jest
        .spyOn(authService, 'refreshAccessToken')
        .mockResolvedValue(mockNewAccessToken);
      jest.spyOn(authService, 'storeAccessToken').mockResolvedValue(undefined);

      const result = await controller.refreshAccessToken(
        mockUser,
        mockResponse,
      );

      expect(result.success).toBe(true);
      expect(result.data.access_token).toBe(mockNewAccessToken);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        mockUser.refresh_token,
        expect.any(Object),
      );
    });

    it('should handle refresh error', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@test.com',
        nickname: 'Test User',
        profile_image: 'https://example.com/avatar.jpg',
        refresh_token: 'mock-refresh-token',
      };

      jest
        .spyOn(authService, 'refreshAccessToken')
        .mockRejectedValue(new Error('Refresh failed'));

      const result = await controller.refreshAccessToken(
        mockUser,
        mockResponse,
      );

      expect(result.success).toBe(false);
      expect(result.error.code).toBe(401);
    });
  });
});
