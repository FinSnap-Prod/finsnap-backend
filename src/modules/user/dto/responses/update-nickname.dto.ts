import { ApiProperty } from '@nestjs/swagger';

export class UpdateNicknameDataDto {
  @ApiProperty({
    description: '업데이트된 닉네임',
    example: '새로운닉네임',
  })
  nickname: string;
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
