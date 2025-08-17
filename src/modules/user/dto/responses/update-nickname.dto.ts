import { ApiProperty } from '@nestjs/swagger';

export class UpdateNicknameDataDto {
  @ApiProperty({
    description: '유저 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: '업데이트된 닉네임',
    example: '새로운닉네임',
  })
  nickname: string;

  @ApiProperty({
    description: '업데이트된 시간',
    example: '2025-07-01T10:00:00.000Z',
  })
  updated_at: Date;
}

export class UpdateNicknameResponseDto {
  @ApiProperty({
    description: '응답 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Nickname updated successfully.',
  })
  message: string;

  @ApiProperty({
    description: '응답 데이터',
    type: UpdateNicknameDataDto,
  })
  data: UpdateNicknameDataDto;
}
