import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
