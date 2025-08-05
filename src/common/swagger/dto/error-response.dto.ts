import { ApiProperty } from '@nestjs/swagger';

export class ErrorDto {
  @ApiProperty({ description: '에러 코드', example: 401 })
  code: number;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Invalid or expired access token.',
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: false })
  success: boolean;

  @ApiProperty({ description: '에러 정보', type: ErrorDto })
  error: ErrorDto;
}
