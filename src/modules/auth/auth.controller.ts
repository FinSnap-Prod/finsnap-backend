import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiCommonErrorResponses,
  ApiLoginRequest,
  ApiLoginRequestParam,
  ApiLoginResponse,
  ApiLogoutResponse,
  ApiRefreshResponse,
  ApiUnauthorizedResponse,
  ApiValidateResponse,
} from 'src/common/swagger';
import {
  LoginRequestDto,
  LoginRequestParamDto,
  LoginResponseDto,
  LogoutResponseDto,
  RefreshTokenResponseDto,
  ValidateResponseDto,
} from './dto';
import { ErrorResponseDto } from 'src/common/swagger/dto/error-response.dto';

const COOKIE_OPTIONS = {
  httpOnly: false, // 개발자 도구에서 쿠키 확인 가능
  secure: false, // HTTP에서도 작동 (localhost)
  sameSite: 'lax' as const, // 개발 환경에 적합
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
  path: '/',
};

@ApiTags('oauth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post(':provider')
  @ApiOperation({ summary: 'Google 토큰 검증 및 로그인' })
  @ApiLoginRequest()
  @ApiLoginRequestParam()
  @ApiLoginResponse()
  @ApiUnauthorizedResponse()
  async login(
    @Body() { authorization_code }: LoginRequestDto,
    @Param() { provider }: LoginRequestParamDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto | ErrorResponseDto | any> {
    try {
      if (!authorization_code)
        throw new BadRequestException('authorization_code is required');

      // OAuth 토큰 요청
      const googleToken = await this.authService.verifyAuthorizationCode(
        provider,
        authorization_code,
      );

      // 유저 정보 조회 및 생성
      const userInfo = await this.authService.verifyGoogleToken(googleToken);
      const user = await this.authService.findOrCreateUser(
        userInfo.socialId,
        userInfo.email,
        userInfo.nickname,
        userInfo.profile_image,
      );

      // AT, RT 토큰 생성 및 저장
      const { access_token, refresh_token } =
        await this.authService.generateTokens(user.id);
      await this.authService.storeTokens(user.id, access_token, refresh_token);

      res.cookie('refresh_token', refresh_token, COOKIE_OPTIONS);

      return {
        success: true,
        message: 'Login successful',
        data: {
          access_token: access_token,
          user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            profile_image: user.profile_image,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 401,
          message: 'Authentication failed',
        },
      };
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  @ApiRefreshResponse()
  @ApiCommonErrorResponses()
  async refresh(): Promise<RefreshTokenResponseDto> {
    const mockData: RefreshTokenResponseDto = {
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        access_token: 'new-token',
        user: {
          id: '26b3e24b-9f53-412c-a6a0-80b92f1e36d8',
          email: 'test@test.com',
          nickname: '승수',
          profile_image: 'https://cdn.../profile.png',
        },
      },
    };

    return mockData;
  }

  @Get('validate')
  @ApiOperation({ summary: '토큰 검증' })
  @ApiValidateResponse()
  @ApiCommonErrorResponses()
  async validate(): Promise<ValidateResponseDto> {
    const mockData: ValidateResponseDto = {
      success: true,
      message: 'Token is valid.',
      data: {
        user: {
          id: '26b3e24b-9f53-412c-a6a0-80b92f1e36d8',
          email: 'test@test.com',
          nickname: '승수',
          profile_image: 'https://cdn.../profile.png',
        },
      },
    };

    return mockData;
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃' })
  @ApiLogoutResponse()
  @ApiCommonErrorResponses()
  async logout(): Promise<LogoutResponseDto> {
    const mockData: LogoutResponseDto = {
      success: true,
      message: 'Logged out successfully.',
    };

    return mockData;
  }
}
