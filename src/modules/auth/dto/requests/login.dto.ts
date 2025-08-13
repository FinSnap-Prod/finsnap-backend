import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum Provider {
  GOOGLE = 'google',
  KAKAO = 'kakao',
}

export class LoginRequestParamDto {
  @IsEnum(Provider)
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 로그인 플랫폼',
    example: 'google',
  })
  provider: Provider;
}

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'OAuth 인증 코드',
    example: '4/0AfJohXn...',
  })
  authorization_code: string;
}
