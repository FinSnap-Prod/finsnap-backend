import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { ConfigService, ConfigType } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private userRepository: UserRepository,
    private configService: ConfigService,
    private jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private jwtTokenConfig: ConfigType<typeof jwtConfig>,
  ) {}

  // 구글 인증 코드 검증 (토큰 발급)
  async verifyAuthorizationCode(provider: string, authorization_code: string) {
    const { clientID, clientSecret, redirectUri } = {
      clientID: this.configService.get('googleOAuth.clientID'),
      clientSecret: this.configService.get('googleOAuth.clientSecret'),
      redirectUri: this.configService.get('googleOAuth.redirectUri'),
    };

    try {
      const params = new URLSearchParams({
        code: authorization_code,
        client_id: clientID,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });

      const response = await axios.post(
        `https://oauth2.googleapis.com/token`,
        params.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      const { access_token } = response.data;
      if (!access_token) {
        throw new HttpException(
          ErrorResponseUtil.badRequest('Google token exchange failed'),
          HttpStatus.BAD_REQUEST,
        );
      }

      return access_token;
    } catch (error) {
      throw new HttpException(
        ErrorResponseUtil.badRequest('Google token exchange failed'),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 구글 토큰 검증 (유저 정보 추출)
  async verifyGoogleToken(googleToken: string) {
    try {
      const { data: profile } = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${googleToken}`,
          },
        },
      );

      if (!profile.id) {
        throw new HttpException(
          ErrorResponseUtil.badRequest('Invalid google token'),
          HttpStatus.BAD_REQUEST,
        );
      }

      return {
        socialId: profile.id,
        email: profile.email,
        nickname: profile.name,
        profile_image: profile.picture,
      };
    } catch (error) {
      throw new HttpException(
        ErrorResponseUtil.badRequest('Failed to fetch user profile'),
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 유저 조회 및 생성
  async findOrCreateUser(
    socialId: string,
    email: string,
    nickname: string,
    profile_image: string,
  ) {
    try {
      const existingUser = await this.authRepository.findBySocialId(socialId);

      if (existingUser) {
        return {
          id: existingUser.user_id,
          email: existingUser.user.email,
          nickname: existingUser.user.nickname,
          profile_image: existingUser.user.profile_image,
          social_id: existingUser.social_id,
          provider: existingUser.provider,
        };
      }

      const newUser = await this.userRepository.createUser(
        email,
        nickname,
        profile_image,
      );
      const newAuth = await this.authRepository.createAuth(
        newUser.id,
        socialId,
        'google',
      );

      return {
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
        profile_image: newUser.profile_image,
        social_id: newAuth.social_id,
        provider: newAuth.provider,
      };
    } catch (error) {
      throw new HttpException(
        ErrorResponseUtil.internalServerError('Failed to process user data'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // JWT 토큰 생성
  async generateTokens(userId: string) {
    const payload = { userId: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.jwtTokenConfig.refreshSecret,
        expiresIn: this.jwtTokenConfig.refreshSignOptions.expiresIn,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // 토큰 저장
  async storeTokens(
    userId: string,
    access_token: string,
    refresh_token: string,
  ) {
    await this.authRepository.storeTokens(userId, access_token, refresh_token);
  }

  // 유저 조회 from JWTstrategy, RefreshStrategy
  async findUserById(userId: string) {
    return this.userRepository.findUserById(userId);
  }

  // 새로운 AT 생성
  async refreshAccessToken(userId: string) {
    const newAccessToken = await this.jwtService.signAsync(
      { userId },
      {
        secret: this.jwtTokenConfig.secret,
        expiresIn: this.jwtTokenConfig.signOptions?.expiresIn || '15m',
      },
    );

    return newAccessToken;
  }

  // 새로운 AT 저장
  async storeAccessToken(userId: string, accessToken: string) {
    await this.authRepository.storeAccessToken(userId, accessToken);
  }
}
