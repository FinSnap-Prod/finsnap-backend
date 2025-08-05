import { ApiProperty } from '@nestjs/swagger';

export class DepositMarketData {
  @ApiProperty({ description: '상품코드', example: 'SH987654' })
  product_code: string;

  @ApiProperty({ description: '이자 유형', example: '복리' })
  interest_type: string;

  @ApiProperty({ description: '최고 금리', example: 3.5 })
  max_prefer_rate: number;

  @ApiProperty({ description: '보고월', example: '2025-07' })
  updated_at: string;
}

export class DepositItem {
  @ApiProperty({ description: '예적금 ID', example: 1 })
  deposit_id: number;

  @ApiProperty({ description: '상품명', example: '신한 프리미엄 적금' })
  name: string;

  @ApiProperty({ description: '은행명', example: '신한은행' })
  bank_name: string;

  @ApiProperty({ description: '은행코드', example: '080820321' })
  bank_code: string;

  @ApiProperty({ description: '금리', example: '3.50' })
  interest_rate: number;

  @ApiProperty({ description: '예치 기간', example: '12M' })
  period: string;

  market_data: DepositMarketData;
}

export class GetDepositsData {
  @ApiProperty({ description: '예적금 목록', type: [DepositItem] })
  items: DepositItem[];

  @ApiProperty({ description: '정렬 기준', example: 'rate' })
  sortBy: string;

  @ApiProperty({ description: '정렬 순서', example: 'desc' })
  order: string;

  @ApiProperty({ description: '전체 개수', example: 150 })
  total_count: number;

  @ApiProperty({ description: '현재 페이지', example: 1 })
  page: number;

  @ApiProperty({ description: '페이지당 개수', example: 20 })
  limit: number;
}

export class GetDepositsResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Deposits retrieved successfully.',
  })
  message: string;

  @ApiProperty({ description: '예적금 목록 데이터', type: GetDepositsData })
  data: GetDepositsData;
}
