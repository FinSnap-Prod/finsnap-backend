import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { UserRepository } from '../user/user.repository';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

describe('AuthService', () => {
  let service: AuthService;

  const mockAuthRepository = {
    findBySocialId: jest.fn(),
    createAuth: jest.fn(),
    storeTokens: jest.fn(),
    storeAccessToken: jest.fn(),
  };

  const mockUserRepository = {
    createUser: jest.fn(),
    findUserById: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockJwtConfig = {
    secret: 'test-secret',
    signOptions: { expiresIn: '15m' },
    refreshSecret: 'test-refresh-secret',
    refreshSignOptions: { expiresIn: '7d' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: 'CONFIGURATION(jwt)',
          useValue: mockJwtConfig,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('refreshAccessToken', () => {
    it('should generate new access token', async () => {
      const userId = 'test-user-id';
      const mockToken = 'new-access-token';

      mockJwtService.signAsync.mockResolvedValue(mockToken);

      const result = await service.refreshAccessToken(userId);

      expect(result).toBe(mockToken);
      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        { userId },
        {
          secret: mockJwtConfig.secret,
          expiresIn: '15m',
        },
      );
    });
  });

  describe('storeAccessToken', () => {
    it('should store access token', async () => {
      const userId = 'test-user-id';
      const accessToken = 'test-access-token';

      mockAuthRepository.storeAccessToken.mockResolvedValue(undefined);

      await service.storeAccessToken(userId, accessToken);

      expect(mockAuthRepository.storeAccessToken).toHaveBeenCalledWith(
        userId,
        accessToken,
      );
    });
  });

  // 🔥 새로운 에러 응답 테스트 추가
  describe('Error Response Standardization', () => {
    describe('verifyAuthorizationCode', () => {
      it('should throw HttpException with 400 status when Google token exchange fails', async () => {
        // Arrange
        mockConfigService.get.mockReturnValue('test-value');

        // Act & Assert
        await expect(
          service.verifyAuthorizationCode('google', 'invalid-code'),
        ).rejects.toThrow(HttpException);

        await expect(
          service.verifyAuthorizationCode('google', 'invalid-code'),
        ).rejects.toMatchObject({
          response: ErrorResponseUtil.badRequest(
            'Google token exchange failed',
          ),
          status: HttpStatus.BAD_REQUEST,
        });
      });
    });

    describe('verifyGoogleToken', () => {
      it('should throw HttpException with 400 status when Google token is invalid', async () => {
        // Act & Assert
        await expect(
          service.verifyGoogleToken('invalid-token'),
        ).rejects.toThrow(HttpException);

        await expect(
          service.verifyGoogleToken('invalid-token'),
        ).rejects.toMatchObject({
          response: ErrorResponseUtil.badRequest(
            'Failed to fetch user profile',
          ),
          status: HttpStatus.BAD_REQUEST,
        });
      });
    });

    describe('findOrCreateUser', () => {
      it('should throw HttpException with 500 status when user data processing fails', async () => {
        // Arrange
        mockAuthRepository.findBySocialId.mockRejectedValue(
          new Error('Database error'),
        );

        // Act & Assert
        await expect(
          service.findOrCreateUser(
            'social-id',
            'test@test.com',
            'Test User',
            'profile.jpg',
          ),
        ).rejects.toThrow(HttpException);

        await expect(
          service.findOrCreateUser(
            'social-id',
            'test@test.com',
            'Test User',
            'profile.jpg',
          ),
        ).rejects.toMatchObject({
          response: ErrorResponseUtil.internalServerError(
            'Failed to process user data',
          ),
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        });
      });
    });
  });
});
