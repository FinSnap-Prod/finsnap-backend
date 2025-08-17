import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  Logger,
  HttpException,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
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
import { ErrorResponseUtil } from 'src/common/utils/error-response.util';
import { User } from './decorators/user.decorator';
import { JwtAuthGuard, RefreshGuard } from './guards';

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

  @Post('refresh')
  @ApiOperation({ summary: '액세스 토큰 갱신' })
  @ApiRefreshResponse()
  @ApiCommonErrorResponses()
  @UseGuards(RefreshGuard)
  async refreshAccessToken(
    @User() user: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshTokenResponseDto | ErrorResponseDto | any> {
    try {
      // 토큰 추출, 검증 (RefreshStrategy에서 처리)

      const newAccessToken = await this.authService.refreshAccessToken(user.id);

      await this.authService.storeAccessToken(user.id, newAccessToken);

      res.cookie('refresh_token', user.refresh_token, COOKIE_OPTIONS);

      return {
        success: true,
        message: 'Access token refreshed successfully.',
        data: {
          access_token: newAccessToken,
          user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            profile_image: user.profile_image,
          },
        },
      };
    } catch (error) {
      throw new HttpException(
        ErrorResponseUtil.unauthorized('Refresh token expired'),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '로그아웃' })
  @ApiLogoutResponse()
  @ApiCommonErrorResponses()
  async logout(
    @User() user: any,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LogoutResponseDto | ErrorResponseDto> {
    this.logger.log(`🔒 사용자 ${user.nickname}(${user.email}) 로그아웃 요청`);
    try {
      await this.authService.logout(user.id);

      res.clearCookie('refresh_token', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });

      this.logger.log(
        `🔒 사용자 ${user.nickname}(${user.email}) 로그아웃 완료`,
      );

      return {
        success: true,
        message: 'Logged out successfully.',
      };
    } catch (error) {
      this.logger.error(
        `❌ 사용자 ${user.nickname}(${user.email}) 로그아웃 실패: ${error}`,
      );
      throw new HttpException(
        ErrorResponseUtil.internalServerError('Failed to logout'),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
        throw new HttpException(
          ErrorResponseUtil.badRequest('authorization_code is required'),
          HttpStatus.BAD_REQUEST,
        );

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
      throw new HttpException(
        ErrorResponseUtil.unauthorized('Authentication failed'),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
