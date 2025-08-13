import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('jwt.secret') || '',
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    try {
      // UUID 추출
      const userId = payload.sub;
      const user = await this.authService.findUserById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profile_image: user.profile_image,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
