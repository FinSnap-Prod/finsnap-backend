import { ApiProperty } from '@nestjs/swagger';

export class PortfolioDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  portfolio_id: number;

  @ApiProperty({ description: '포트폴리오 이름', example: '포트폴리오 1' })
  name: string;

  @ApiProperty({ description: '평가 자산 총액', example: 1000000 })
  total_eval_amount: number;

  @ApiProperty({ description: '총 수익/손실', example: 100000 })
  total_profit_loss: number;

  @ApiProperty({ description: '총 수익률', example: 0.1 })
  total_profit_rate: number;

  @ApiProperty({ description: '정렬 순서', example: 1 })
  sort_order: number;
}

export class GetAllPortfolioResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Portfolios retrieved successfully.',
  })
  message: string;

  @ApiProperty({ description: '포트폴리오 목록', type: [PortfolioDto] })
  data: PortfolioDto[];
}
