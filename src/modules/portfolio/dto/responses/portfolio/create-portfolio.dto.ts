import { ApiProperty } from '@nestjs/swagger';

export class CreatePortfolioResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Portfolios retrieved successfully.',
  })
  message: string;

  @ApiProperty({
    description: '포트폴리오 생성 결과',
    example: {
      portfolio_id: 1,
      name: '포트폴리오 1',
      total_eval_amount: 1000000,
      total_profit_loss: 100000,
      total_profit_rate: 0.1,
      sort_order: 1,
    },
  })
  data: {
    portfolio_id: number;
    name: string;
    total_eval_amount: number;
    total_profit_loss: number;
    total_profit_rate: number;
    sort_order: number;
  };
}
