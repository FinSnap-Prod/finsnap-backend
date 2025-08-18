import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    nickname: 'testuser',
  };

  const mockDeleteUserRequest = {
    delete_reason: 'Personal reason',
  };

  const mockDeleteUserResponse = {
    success: true,
    message: 'Account deactivated successfully.',
    data: {
      user_id: 'user-123',
      deactivated_at: new Date().toISOString(),
      status: 'deactivated',
    },
  };

  beforeEach(async () => {
    const mockUserService = {
      deleteUser: jest.fn(),
      getUser: jest.fn(),
      updateNickname: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('deleteUser', () => {
    it('should successfully deactivate user account', async () => {
      // Arrange
      userService.deleteUser.mockResolvedValue(mockDeleteUserResponse);

      // Act
      const result = await controller.deleteUser(
        mockUser,
        mockDeleteUserRequest,
      );

      // Assert
      expect(result).toEqual(mockDeleteUserResponse);
      expect(userService.deleteUser).toHaveBeenCalledWith(
        mockUser.id,
        mockDeleteUserRequest.delete_reason,
      );
    });

    it('should handle service errors and return bad request', async () => {
      // Arrange
      const serviceError = new HttpException(
        ErrorResponseUtil.badRequest('Service error'),
        HttpStatus.BAD_REQUEST,
      );
      userService.deleteUser.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(
        controller.deleteUser(mockUser, mockDeleteUserRequest),
      ).rejects.toThrow(
        new HttpException(
          ErrorResponseUtil.badRequest(serviceError.message),
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(userService.deleteUser).toHaveBeenCalledWith(
        mockUser.id,
        mockDeleteUserRequest.delete_reason,
      );
    });

    it('should handle different error types from service', async () => {
      // Arrange
      const notFoundError = new HttpException(
        ErrorResponseUtil.notFound('User not found'),
        HttpStatus.NOT_FOUND,
      );
      userService.deleteUser.mockRejectedValue(notFoundError);

      // Act & Assert
      await expect(
        controller.deleteUser(mockUser, mockDeleteUserRequest),
      ).rejects.toThrow(
        new HttpException(
          ErrorResponseUtil.badRequest(notFoundError.message),
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should handle internal server errors from service', async () => {
      // Arrange
      const internalError = new HttpException(
        ErrorResponseUtil.internalServerError('Database error'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      userService.deleteUser.mockRejectedValue(internalError);

      // Act & Assert
      await expect(
        controller.deleteUser(mockUser, mockDeleteUserRequest),
      ).rejects.toThrow(
        new HttpException(
          ErrorResponseUtil.badRequest(internalError.message),
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });
});
