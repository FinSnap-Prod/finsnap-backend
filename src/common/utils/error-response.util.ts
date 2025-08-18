import { HttpStatus } from '@nestjs/common';
import { ErrorResponseDto } from '../swagger/dto/error-response.dto';

export class ErrorResponseUtil {
  static create(code: number, message: string): ErrorResponseDto {
    return { success: false, error: { code, message } };
  }

  static badRequest(message?: string) {
    return this.create(HttpStatus.BAD_REQUEST, message || 'Bad request');
  }

  static unauthorized(message?: string) {
    return this.create(HttpStatus.UNAUTHORIZED, message || 'Unauthorized');
  }

  static forbidden(message?: string) {
    return this.create(HttpStatus.FORBIDDEN, message || 'Forbidden');
  }

  static notFound(message?: string) {
    return this.create(HttpStatus.NOT_FOUND, message || 'Not found');
  }

  static internalServerError(message?: string) {
    return this.create(
      HttpStatus.INTERNAL_SERVER_ERROR,
      message || 'Internal server error',
    );
  }
}
