import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  LoginRequestDto,
  LoginRequestParamDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenResponseDto,
  ValidateResponseDto,
} from 'src/modules/oauth/dto';

/**
 * 소셜 로그아웃 응답
 */
export function ApiLogoutResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Logged out successfully.',
      type: LogoutResponseDto,
    }),
  );
}

/**
 * 소셜 로그인 검증 응답
 */
export function ApiValidateResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Token is valid.',
      type: ValidateResponseDto,
    }),
  );
}

/**
 * 소셜 토큰 갱신 응답
 */
export function ApiRefreshResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Access token refreshed successfully.',
      type: RefreshTokenResponseDto,
    }),
  );
}

/**
 * 소셜 로그인 요청
 */
export function ApiLoginRequest() {
  return applyDecorators(ApiBody({ type: LoginRequestDto }));
}

/**
 * 소셜 로그인 요청 파라미터
 */
export function ApiLoginRequestParam() {
  return applyDecorators(
    ApiParam({
      name: 'provider',
      description: '소셜 로그인 플랫폼',
      example: 'google',
      type: LoginRequestParamDto,
    }),
  );
}

/**
 * 소셜 로그인 응답
 */
export function ApiLoginResponse() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'Logged successfully.',
      type: LoginResponseDto,
    }),
  );
}
