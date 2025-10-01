import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ErrorResponseUtil } from '../utils/error-response.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const errorResponse = this.handleException(exception, request);

    this.logError(exception, request);

    response.status(errorResponse.status).json(errorResponse.body);
  }

  private handleException(exception: unknown, request: any) {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (status === HttpStatus.BAD_REQUEST && typeof response === 'object') {
        const responseObj = response as any;

        if (responseObj.message && Array.isArray(responseObj.message)) {
          return {
            status: HttpStatus.BAD_REQUEST,
            body: ErrorResponseUtil.badRequest(responseObj.message[0]),
          };
        }
      }

      return {
        status,
        body: response,
      };
    }

    // 일반 Error 객체는 기존 예외 처리 로직에서 처리되지 않은 경우에 대한 처리
    if (exception instanceof Error) {
      const message = exception.message;

      // 패턴 기반 매칭으로 변경
      if (message.includes('not found') || message.includes('Not found')) {
        return {
          status: HttpStatus.NOT_FOUND,
          body: ErrorResponseUtil.notFound(message),
        };
      }

      if (message.includes('already exists') || message.includes('Duplicate')) {
        return {
          status: HttpStatus.BAD_REQUEST,
          body: ErrorResponseUtil.badRequest(message),
        };
      }

      if (
        message.includes('Unauthorized') ||
        message.includes('Invalid token')
      ) {
        return {
          status: HttpStatus.UNAUTHORIZED,
          body: ErrorResponseUtil.unauthorized(message),
        };
      }

      if (message.includes('Forbidden') || message.includes('Access denied')) {
        return {
          status: HttpStatus.FORBIDDEN,
          body: ErrorResponseUtil.forbidden(message),
        };
      }

      if (message.includes('Failed to')) {
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          body: ErrorResponseUtil.internalServerError(message),
        };
      }

      // 추가 패턴: 입력값 검증 및 비즈니스 제약
      if (message.includes('Insufficient')) {
        return {
          status: HttpStatus.BAD_REQUEST,
          body: ErrorResponseUtil.badRequest(message),
        };
      }

      if (message.includes('Invalid')) {
        return {
          status: HttpStatus.BAD_REQUEST,
          body: ErrorResponseUtil.badRequest(message),
        };
      }

      if (message.includes('Unsupported')) {
        return {
          status: HttpStatus.BAD_REQUEST,
          body: ErrorResponseUtil.badRequest(message),
        };
      }

      if (message.includes('Cannot') || message.includes('Linked')) {
        return {
          status: HttpStatus.BAD_REQUEST,
          body: ErrorResponseUtil.badRequest(message),
        };
      }

      return {
        status: HttpStatus.BAD_REQUEST,
        body: ErrorResponseUtil.badRequest(message),
      };
    }

    // 3. 예상치 못한 에러
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: ErrorResponseUtil.internalServerError(
        'An unexpected error occurred',
      ),
    };
  }

  private logError(exception: unknown, request: any) {
    const message =
      exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      `Error occurred: ${message}`,
      stack,
      `Request URL: ${request.url}, Method: ${request.method}`,
    );
  }
}
