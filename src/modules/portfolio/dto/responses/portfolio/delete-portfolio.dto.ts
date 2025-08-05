import { ApiProperty } from '@nestjs/swagger';

export class DeletePortfolioResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Portfolio deleted successfully.',
  })
  message: string;
}
