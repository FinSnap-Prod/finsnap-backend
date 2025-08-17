import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

@Injectable()
export class RefreshGuard extends AuthGuard('refresh') {
  private readonly logger = new Logger(RefreshGuard.name);

  handleRequest(err: any, user: any, info: any) {
    this.logger.log('🔍 RefreshGuard.handleRequest 호출');
    this.logger.log('❌ Error:', err);
    this.logger.log(' User:', user);
    this.logger.log('ℹ️ Info:', info);

    if (err) {
      this.logger.error('❌ RefreshGuard 에러 발생:', err.message);
      throw new HttpException(
        ErrorResponseUtil.unauthorized('Invalid refresh token'),
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!user) {
      this.logger.error('❌ 사용자 정보 없음');
      throw new HttpException(
        ErrorResponseUtil.unauthorized(
          'User not found or invalid refresh token',
        ),
        HttpStatus.UNAUTHORIZED,
      );
    }

    this.logger.log('✅ RefreshGuard 검증 성공');
    return user;
  }
}
