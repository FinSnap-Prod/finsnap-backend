import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Response } from 'express';
import { OauthService } from './oauth.service';
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

@ApiTags('oauth')
@Controller('auth')
export class OauthController {
  constructor(private readonly oauthService: OauthService) {}

  @Post(':provider')
  @ApiOperation({ summary: 'Google 토큰 검증 및 로그인' })
  @ApiLoginRequest()
  @ApiLoginRequestParam()
  @ApiLoginResponse()
  @ApiUnauthorizedResponse()
  async login(
    @Body() body: LoginRequestDto,
    @Param() param: LoginRequestParamDto,
  ): Promise<LoginResponseDto> {
    const mockData: LoginResponseDto = {
      success: true,
      message: 'Login successful',
      data: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6...',
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
