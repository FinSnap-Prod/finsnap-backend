import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';
import { AuthRepository } from '../auth/auth.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
    private readonly dataSource: DataSource,
  ) {}

  async updateNickname(userId: string, nickname: string) {
    // 1. 닉네임 유효성 검사
    await this.validateNickname(nickname);

    // 2. 닉네임 중복 검사
    const existingNickname =
      await this.userRepository.findByNicknameExcludeSelf(nickname, userId);

    if (existingNickname) {
      throw new HttpException(
        ErrorResponseUtil.badRequest('이미 사용 중인 닉네임입니다.'),
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. 닉네임 수정
    await this.userRepository.updateUser(userId, nickname);

    // 4. 수정된 유저 정보 조회
    const updatedUser = await this.userRepository.findUserById(userId);

    if (!updatedUser) {
      throw new HttpException(
        ErrorResponseUtil.internalServerError('Failed to update nickname'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 5. 수정 결과 반환
    return {
      success: true,
      message: 'Nickname updated successfully.',
      data: {
        id: updatedUser.id,
        nickname: updatedUser.nickname,
        updated_at: updatedUser.updated_at,
      },
    };
  }

  private async validateNickname(nickname: string) {
    // 추가적인 비즈니스 로직 검증
    if (nickname.trim() !== nickname) {
      throw new HttpException(
        ErrorResponseUtil.badRequest(
          '닉네임 앞뒤에 공백이 포함될 수 없습니다.',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    // 금지된 단어 체크
    const forbiddenWords = [
      'admin',
      'root',
      'system',
      '관리자',
      'user',
      'undefined',
      'null',
    ];
    if (
      forbiddenWords.some((word) =>
        nickname.toLowerCase().includes(word.toLowerCase()),
      )
    ) {
      throw new HttpException(
        ErrorResponseUtil.badRequest(
          '사용할 수 없는 단어가 포함되어 있습니다.',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }

    // 연속된 동일 문자 체크
    if (/(.)\1{3,}/.test(nickname)) {
      throw new HttpException(
        ErrorResponseUtil.badRequest(
          '연속된 동일한 문자는 3개까지만 사용 가능합니다.',
        ),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUser(userId: string) {
    const [user, auth] = await Promise.all([
      this.userRepository.findUserById(userId),
      this.authRepository.findAuthByUserId(userId),
    ]);

    if (!user || !auth) {
      throw new HttpException(
        ErrorResponseUtil.notFound(
          'User or authentication information not found',
        ),
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      message: 'User info retrieved successfully.',
      data: {
        id: user.id,
        provider: auth.provider,
        email: user.email,
        nickname: user.nickname,
        profile_image: user.profile_image,
        created_at: user.created_at.toISOString(),
      },
    };
  }

  async deleteUser(userId: string, delete_reason: string) {
    try {
      // 1. 유저 삭제 상태 확인
      const user = await this.userRepository.findUserById(userId);

      if (!user) {
        throw new HttpException(
          ErrorResponseUtil.notFound('User not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.deleted) {
        return {
          success: true,
          message: 'Account already deactivated.',
          data: {
            user_id: userId,
            deactivated_at: user.deleted_at?.toISOString() || null,
            status: 'already_deactivated',
          },
        };
      }

      // 2. 트랜잭션으로 탈퇴 처리
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // 2-1. 사용자 비활성화
        await this.userRepository.deleteUser(userId, delete_reason);

        // 2-2. 인증 정보 무효화
        await this.authRepository.invalidateTokens(userId);
      });

      return {
        success: true,
        message: 'Account deactivated successfully.',
        data: {
          user_id: userId,
          deactivated_at: new Date().toISOString(),
          status: 'deactivated',
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ErrorResponseUtil.internalServerError('Failed to deactivate account'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
