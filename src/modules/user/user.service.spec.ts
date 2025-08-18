import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { AuthRepository } from '../auth/auth.repository';
import { DataSource } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';
import { User } from '../../database/entities/user/user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;
  let authRepository: jest.Mocked<AuthRepository>;
  let dataSource: jest.Mocked<DataSource>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    nickname: 'testuser',
    profile_image: 'https://example.com/image.jpg',
    created_at: new Date(),
    updated_at: new Date(),
    deleted: false,
    deleted_at: null,
    delete_reason: null,
  };

  const mockDeletedUser: User = {
    ...mockUser,
    deleted: true,
    deleted_at: new Date(),
    delete_reason: 'Personal reason',
  };

  beforeEach(async () => {
    const mockUserRepository = {
      findUserById: jest.fn(),
      deleteUser: jest.fn(),
    };

    const mockAuthRepository = {
      invalidateTokens: jest.fn(),
    };

    const mockDataSource = {
      transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
    authRepository = module.get(AuthRepository);
    dataSource = module.get(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteUser', () => {
    it('should successfully deactivate user account', async () => {
      // Arrange
      const userId = 'user-123';
      const deleteReason = 'Personal reason';

      userRepository.findUserById.mockResolvedValue(mockUser);
      (dataSource.transaction as jest.Mock).mockImplementation(
        async (callback: any) => {
          return await callback({
            getRepository: jest.fn(),
          });
        },
      );

      // Act
      const result = await service.deleteUser(userId, deleteReason);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Account deactivated successfully.');
      expect(result.data.user_id).toBe(userId);
      expect(result.data.status).toBe('deactivated');
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should return already deactivated status for deleted user', async () => {
      // Arrange
      const userId = 'user-123';
      const deleteReason = 'Personal reason';

      userRepository.findUserById.mockResolvedValue(mockDeletedUser);

      // Act
      const result = await service.deleteUser(userId, deleteReason);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Account already deactivated.');
      expect(result.data.status).toBe('already_deactivated');
      expect(result.data.user_id).toBe(userId);
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-user';
      const deleteReason = 'Personal reason';

      userRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteUser(userId, deleteReason)).rejects.toThrow(
        new HttpException(
          ErrorResponseUtil.notFound('User not found'),
          HttpStatus.NOT_FOUND,
        ),
      );
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('should handle transaction errors gracefully', async () => {
      // Arrange
      const userId = 'user-123';
      const deleteReason = 'Personal reason';

      userRepository.findUserById.mockResolvedValue(mockUser);
      dataSource.transaction.mockRejectedValue(new Error('Transaction failed'));

      // Act & Assert
      await expect(service.deleteUser(userId, deleteReason)).rejects.toThrow(
        new HttpException(
          ErrorResponseUtil.internalServerError('Failed to deactivate account'),
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('should rethrow HttpException errors', async () => {
      // Arrange
      const userId = 'user-123';
      const deleteReason = 'Personal reason';

      const customError = new HttpException(
        ErrorResponseUtil.badRequest('Custom error'),
        HttpStatus.BAD_REQUEST,
      );

      userRepository.findUserById.mockRejectedValue(customError);

      // Act & Assert
      await expect(service.deleteUser(userId, deleteReason)).rejects.toThrow(
        customError,
      );
      expect(userRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });
  });
});
