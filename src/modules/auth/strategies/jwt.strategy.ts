import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt.secret') || '',
      // 토큰 만료 시 예외 발생
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    try {
      // UUID 추출 - payload.userId 사용
      const userId = payload.userId;

      const user = await this.authService.findUserById(userId);
      if (!user) {
        throw new HttpException(
          ErrorResponseUtil.unauthorized('User not found'),
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profile_image: user.profile_image,
      };
    } catch (error) {
      throw new HttpException(
        ErrorResponseUtil.unauthorized('Invalid JWT token'),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
