import { ApiProperty } from '@nestjs/swagger';

export class RefreshUserInfo {
  @ApiProperty({
    description: '사용자 UUID',
    example: '26b3e24b-9f53-412c-a6a0-80b92f1e36d8',
  })
  id: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'test@test.com',
  })
  email: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '승수',
  })
  nickname: string;

  @ApiProperty({
    description: '사용자 프로필 이미지',
    example: 'https://cdn.../profile.png',
  })
  profile_image: string;
}

export class RefreshTokenData {
  @ApiProperty({
    description: '새로운 토큰',
    example: 'new-token',
  })
  access_token: string;

  @ApiProperty({
    description: '사용자 정보',
    type: RefreshUserInfo,
  })
  user: RefreshUserInfo;
}

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: '응답 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Token refreshed successfully.',
  })
  message: string;

  @ApiProperty({
    description: '응답 데이터',
    type: RefreshTokenData,
  })
  data: RefreshTokenData;
}
