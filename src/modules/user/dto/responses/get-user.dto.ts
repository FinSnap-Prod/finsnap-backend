import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: '사용자 UUID',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: '사용자 제공자',
    example: 'google',
  })
  provider: string;

  @ApiProperty({
    description: '사용자 이메일',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: 'John Doe',
  })
  nickname: string;

  @ApiProperty({
    description: '사용자 프로필 이미지',
    example: 'https://example.com/profile.jpg',
  })
  profile_image: string;

  @ApiProperty({
    description: '사용자 생성일',
    example: '2021-01-01',
  })
  created_at: string;
}

export class GetUserResponseDto {
  @ApiProperty({
    description: '응답 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'User retrieved successfully.',
  })
  message: string;

  @ApiProperty({
    description: '사용자 정보',
    type: UserDto,
  })
  data: UserDto;
}
