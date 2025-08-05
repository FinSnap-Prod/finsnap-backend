import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '서버가 정상 동작 중입니다.',
  })
  message: string;

  @ApiProperty({ description: '서버 상태 데이터', example: 'Hello World!' })
  data: string;
}
