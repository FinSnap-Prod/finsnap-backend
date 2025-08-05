import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto';

/**
 * 공통 401 Unauthorized 응답
 */
export function ApiUnauthorizedResponse() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Invalid or expired access token.',
      type: ErrorResponseDto,
    }),
  );
}

/**
 * 공통 400 Bad Request 응답
 */
export function ApiBadRequestResponse() {
  return applyDecorators(
    ApiResponse({
      status: 400,
      description: 'Bad request.',
      type: ErrorResponseDto,
    }),
  );
}

/**
 * 공통 404 Not Found 응답
 */
export function ApiNotFoundResponse() {
  return applyDecorators(
    ApiResponse({
      status: 404,
      description: 'Resource not found.',
      type: ErrorResponseDto,
    }),
  );
}

/**
 * 공통 에러 응답들 (401, 400)
 */
export function ApiCommonErrorResponses() {
  return applyDecorators(ApiUnauthorizedResponse(), ApiBadRequestResponse());
}

/**
 * 공통 에러 응답들 (400, 404)
 */
export function ApiBadRequestAndNotFoundResponses() {
  return applyDecorators(ApiBadRequestResponse(), ApiNotFoundResponse());
}

/**
 * 공통 에러 응답들 (401, 400, 404)
 */
export function ApiCommonErrorResponsesWithNotFound() {
  return applyDecorators(
    ApiUnauthorizedResponse(),
    ApiBadRequestResponse(),
    ApiNotFoundResponse(),
  );
}
