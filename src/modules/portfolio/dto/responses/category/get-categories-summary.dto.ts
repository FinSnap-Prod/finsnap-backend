import { ApiProperty } from '@nestjs/swagger';

export class AssetItem {
  @ApiProperty({ description: '자산 ID', example: 1 })
  asset_id: number;

  @ApiProperty({ description: '자산 이름', example: '자산 1' })
  asset_name: string;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  category_id: number;

  @ApiProperty({ description: '카테고리 이름', example: '카테고리 1' })
  category_name: string;

  @ApiProperty({ description: '현재 가격', example: 10000 })
  current_price: number;

  @ApiProperty({ description: '평균 가격', example: 10000 })
  avg_price: number;

  @ApiProperty({ description: '수량', example: 100 })
  quantity: number;

  @ApiProperty({ description: '매수 금액', example: 1000000 })
  purchase_amount: number;

  @ApiProperty({ description: '평가 금액', example: 1000000 })
  eval_amount: number;

  @ApiProperty({ description: '수익/손실', example: 100000 })
  profit_amount: number;

  @ApiProperty({ description: '수익률', example: 0.1 })
  profit_rate: number;
}

export class CategoryItem {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  category_id: number;

  @ApiProperty({ description: '카테고리 이름', example: '카테고리 1' })
  category_name: string;
}

export class PortfolioAssetData {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  portfolio_id: number;

  @ApiProperty({ description: '포트폴리오 이름', example: '포트폴리오 1' })
  portfolio_name: string;

  @ApiProperty({ description: '생성일', example: '2021-01-01' })
  created_at: string;

  @ApiProperty({ description: '수정일', example: '2021-01-01' })
  updated_at: string;

  @ApiProperty({ description: '정렬 기준', example: 'eval_amount' })
  sorted_by: string;

  @ApiProperty({ description: '카테고리 목록', type: [CategoryItem] })
  categories: CategoryItem[];

  @ApiProperty({ description: '자산 목록', type: [AssetItem] })
  assets: AssetItem[];
}

export class GetCategoriesSummaryResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Categories summary retrieved successfully.',
  })
  message: string;

  @ApiProperty({
    description: '카테고리 요약정보',
    type: PortfolioAssetData,
  })
  data: PortfolioAssetData;
}
