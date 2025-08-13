import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

// 커스텀 JWT 설정 타입 정의
export interface CustomJwtConfig extends JwtModuleOptions {
  refreshSecret: string;
  refreshSignOptions: {
    expiresIn: string;
  };
}

export default registerAs(
  'jwt',
  (): CustomJwtConfig => ({
    secret: process.env.JWT_SECRET || 'fallback-secret',
    signOptions: {
      expiresIn: process.env.JWT_EXPIRE_IN || '15m',
    },
    refreshSecret: process.env.REFRESH_JWT_SECRET || 'fallback-secret',
    refreshSignOptions: {
      expiresIn: process.env.REFRESH_JWT_EXPIRE_IN || '7d',
    },
  }),
);
