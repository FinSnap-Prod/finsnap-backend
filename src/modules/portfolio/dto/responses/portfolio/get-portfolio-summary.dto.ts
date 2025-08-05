import { ApiProperty } from '@nestjs/swagger';

export class CategorySummaryItem {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  category_id: number;

  @ApiProperty({ description: '카테고리 이름', example: '카테고리 1' })
  category_name: string;

  @ApiProperty({ description: '카테고리별 평가 자산 총액', example: 1000000 })
  eval_amount: number;

  @ApiProperty({ description: '카테고리별 가중치', example: 0.1 })
  weighting: number;
}

export class AssetSummaryItem {
  @ApiProperty({ description: '자산 ID', example: 1 })
  asset_id: number;

  @ApiProperty({ description: '자산 이름', example: '자산 1' })
  asset_name: string;

  @ApiProperty({ description: '자산별 평가 자산 총액', example: 1000000 })
  eval_amount: number;

  @ApiProperty({ description: '자산별 가중치', example: 0.1 })
  weighting: number;
}

export class PortfolioSummaryDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  portfolio_id: number;

  @ApiProperty({ description: '포트폴리오 이름', example: '포트폴리오 1' })
  portfolio_name: string;

  @ApiProperty({ description: '포트폴리오별 평가 자산 총액', example: 1000000 })
  total_eval_amount: number;

  @ApiProperty({ description: '포트폴리오별 총 수익/손실', example: 100000 })
  total_profit_loss: number;

  @ApiProperty({ description: '포트폴리오별 총 수익률', example: 0.1 })
  total_rate: number;

  @ApiProperty({ description: '포트폴리오 생성일', example: '2021-01-01' })
  created_at: string;

  @ApiProperty({ description: '포트폴리오 수정일', example: '2021-01-01' })
  updated_at: string;

  @ApiProperty({ description: '자산 목록', type: [AssetSummaryItem] })
  assets: AssetSummaryItem[];

  @ApiProperty({ description: '카테고리 목록', type: [CategorySummaryItem] })
  categories: CategorySummaryItem[];
}

export class GetPortfolioSummaryResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Portfolio summary retrieved successfully.',
  })
  message: string;

  @ApiProperty({
    description: '포트폴리오 요약정보',
    type: PortfolioSummaryDto,
    example: {
      portfolio_id: 1,
      portfolio_name: '포트폴리오 1',
      total_eval_amount: 1000000,
      total_profit_loss: 100000,
      total_rate: 0.1,
      created_at: '2021-01-01',
      updated_at: '2021-01-01',
      assets: [
        {
          asset_id: 23,
          asset_name: '삼성전자',
          eval_amount: 2029100,
          weighting: 0.202,
        },
        {
          asset_id: 25,
          asset_name: 'QQQ',
          eval_amount: 2930210,
          weighting: 0.22,
        },
        {
          asset_id: 24,
          asset_name: '원화',
          eval_amount: 2029100,
          weighting: 0.202,
        },
        {
          asset_id: 26,
          asset_name: '외화',
          eval_amount: 3201923,
          weighting: 0.392,
        },
      ],
      categories: [
        {
          category_id: 1,
          category_name: '국내주식',
          eval_amount: 2029100,
          weighting: 0.202,
        },
        {
          category_id: 2,
          category_name: '해외주식',
          eval_amount: 2930210,
          weighting: 0.22,
        },
        {
          category_id: 3,
          category_name: '예수금',
          eval_amount: 5231023,
          weighting: 0.594,
        },
      ],
    },
  })
  data: PortfolioSummaryDto;
}
