// User Response Decorators

import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import {
  DeleteUserResponseDto,
  GetUserResponseDto,
  UpdateNicknameRequestDto,
  UpdateNicknameResponseDto,
} from 'src/modules/user/dto';

/**
 * 사용자 정보 조회 응답
 */
export function ApiGetUserResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'User info retrieved successfully.',
      type: GetUserResponseDto,
    }),
  );
}

/**
 * 사용자 닉네임 수정 요청
 */
export function ApiUpdateNickname() {
  return applyDecorators(ApiBody({ type: UpdateNicknameRequestDto }));
}

/**
 * 사용자 닉네임 수정 응답
 */
export function ApiUpdateNicknameResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Nickname updated successfully.',
      type: UpdateNicknameResponseDto,
    }),
  );
}

/**
 * 사용자 탈퇴 응답
 */
export function ApiDeleteUserResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'User account deleted successfully.',
      type: DeleteUserResponseDto,
    }),
  );
}
