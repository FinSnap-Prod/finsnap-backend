import { ApiProperty } from '@nestjs/swagger';

export class DeleteUserDataDto {
  @ApiProperty({
    description: '사용자 ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  user_id: string;

  @ApiProperty({
    description: '탈퇴 처리된 시간',
    example: '2024-08-17T16:30:00.000Z',
  })
  deactivated_at: string | null;

  @ApiProperty({
    description: '계정 상태',
    example: 'deactivated | already_deactivated',
  })
  status: string;
}

export class DeleteUserResponseDto {
  @ApiProperty({
    description: '응답 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Account deactivated successfully.',
  })
  message: string;

  @ApiProperty({
    description: '응답 데이터',
    type: DeleteUserDataDto,
  })
  data: DeleteUserDataDto;
}
