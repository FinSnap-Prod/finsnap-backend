import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import googleOAuth from './config/oauth.config';
import { AuthRepository } from './auth.repository';
import { UserRepository } from '../user/user.repository';
import jwtConfig from './config/jwt.config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy, RefreshStrategy } from './strategies';
import { Auth } from 'src/database/entities/auth/auth.entity';
import { User } from 'src/database/entities/user/user.entity';
import { RefreshGuard } from './guards';

@Module({
  imports: [
    ConfigModule.forFeature(googleOAuth),
    ConfigModule.forFeature(jwtConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfig)],
      useFactory: async (jwtTokenConfig: ConfigType<typeof jwtConfig>) => ({
        secret: jwtTokenConfig.secret,
        signOptions: {
          expiresIn: jwtTokenConfig.signOptions?.expiresIn || '15m',
        },
      }),
      inject: [jwtConfig.KEY],
    }),
    TypeOrmModule.forFeature([Auth, User]),
  ],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    UserRepository,
    AuthService,
    JwtStrategy,
    RefreshStrategy,
    RefreshGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
