import { ApiProperty } from '@nestjs/swagger';

export class ValidateUserDto {
  @ApiProperty({
    description: '사용자 ID',
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
    description: '프로필 이미지 URL',
    example: 'https://cdn.../profile.png',
  })
  profile_image: string;
}

export class ValidateDataDto {
  @ApiProperty({
    description: '사용자 정보',
    type: ValidateUserDto,
  })
  user: ValidateUserDto;
}

export class ValidateResponseDto {
  @ApiProperty({
    description: '응답 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Token is valid.',
  })
  message: string;

  @ApiProperty({
    description: '응답 데이터',
    type: ValidateDataDto,
  })
  data: ValidateDataDto;
}
