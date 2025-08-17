import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService, ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import jwtConfig from '../config/jwt.config';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private authService: AuthService,
    @Inject(jwtConfig.KEY)
    private jwtTokenConfig: ConfigType<typeof jwtConfig>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies.refresh_token,
      ]),
      secretOrKey: jwtTokenConfig.refreshSecret,
      // RT 만료 시 예외 발생
      ignoreExpiration: false,
      // Request 객체를 validate에 전달
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    try {
      const refreshToken = req.cookies.refresh_token;
      const accessToken = req.headers.authorization?.replace('Bearer ', '');

      if (!accessToken) {
        throw new HttpException(
          ErrorResponseUtil.unauthorized(
            'Access token or refresh token is required',
          ),
          HttpStatus.UNAUTHORIZED,
        );
      }

      // AT 검증 (만료 허용)
      let accessPayload;
      try {
        accessPayload = this.jwtService.verify(accessToken, {
          secret: this.jwtTokenConfig.secret,
        });
      } catch (error) {
        // AT가 만료된 경우, RT 페이로드 사용
        accessPayload = payload;
      }

      // 사용자 정보 조회
      const user = await this.authService.findUserById(accessPayload.userId);
      if (!user) {
        throw new HttpException(
          ErrorResponseUtil.unauthorized('User not found'),
          HttpStatus.UNAUTHORIZED,
        );
      }

      return {
        id: accessPayload.userId,
        email: user.email,
        nickname: user.nickname,
        profile_image: user.profile_image,
        refresh_token: refreshToken,
      };
    } catch (error) {
      throw new HttpException(
        ErrorResponseUtil.unauthorized('Invalid tokens'),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
