import {
  Injectable,
  ExecutionContext,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // JWT 인증이 필요한 엔드포인트인지 확인
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    this.logger.log('🔄 JwtAuthGuard.handleRequest 실행됨');
    this.logger.log('❌ Error:', err);
    this.logger.log(' User:', user);
    this.logger.log('ℹ️ Info:', info);

    // JWT 토큰 만료 에러 처리
    if (info && info.message === 'jwt expired') {
      this.logger.error('❌ JWT 토큰 만료');
      throw new HttpException(
        ErrorResponseUtil.unauthorized('Access token expired'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 기타 JWT 검증 실패 에러 처리
    if (info && info.message) {
      this.logger.error('❌ JWT 검증 실패:', info.message);
      throw new HttpException(
        ErrorResponseUtil.unauthorized('Invalid access token'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 기타 에러 처리
    if (err) {
      this.logger.error('❌ JwtAuthGuard 에러 발생:', err.message);

      // 탈퇴한 사용자 에러 처리 (403 Forbidden)
      if (err.status === HttpStatus.FORBIDDEN) {
        throw new HttpException(
          ErrorResponseUtil.forbidden('Account has been deactivated'),
          HttpStatus.FORBIDDEN,
        );
      }

      throw new HttpException(
        ErrorResponseUtil.unauthorized('Authentication failed'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 사용자 정보 없음 에러 처리
    if (!user) {
      this.logger.error('❌ 사용자 정보 없음');
      throw new HttpException(
        ErrorResponseUtil.unauthorized('User not found or invalid token'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.logger.log('✅ JwtAuthGuard 검증 성공');
    return user;
  }
}
