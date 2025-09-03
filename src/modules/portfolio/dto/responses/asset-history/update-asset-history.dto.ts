import { ApiProperty } from '@nestjs/swagger';

export class UpdateAssetInfo {
  @ApiProperty({
    description: '자산 ID',
    example: 102,
  })
  asset_id: number;

  @ApiProperty({
    description: '자산 이름',
    example: '삼성전자',
  })
  asset_name: string;

  @ApiProperty({
    description: '자산 타입',
    example: 'stock',
  })
  asset_type: string;
}

export class UpdatePortfolioInfo {
  @ApiProperty({
    description: '포트폴리오 ID',
    example: 1,
  })
  portfolio_id: number;

  @ApiProperty({
    description: '포트폴리오 이름',
    example: '내 포트폴리오',
  })
  portfolio_name: string;
}

export class UpdateCategoryInfo {
  @ApiProperty({
    description: '카테고리 ID',
    example: 3,
  })
  category_id: number;

  @ApiProperty({
    description: '카테고리 이름',
    example: '국내주식',
  })
  category_name: string;
}

export class UpdateInstitutionInfo {
  @ApiProperty({
    description: '거래소/증권사 ID',
    example: 1,
  })
  institution_id: number;

  @ApiProperty({
    description: '거래소/증권사 이름',
    example: '키움증권',
  })
  institution_name: string;
}

export class UpdateCurrencyInfo {
  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  currency_code_id: number;

  @ApiProperty({
    description: '통화 코드',
    example: 'KRW',
  })
  currency_code: string;
}

export class UpdatedHistory {
  @ApiProperty({
    description: '거래내역 ID',
    example: 558,
  })
  asset_history_id: number;

  @ApiProperty({
    description: '거래 타입 ID',
    example: 2,
  })
  asset_history_type_id: number;

  @ApiProperty({
    description: '거래 타입 이름',
    example: 'sell',
  })
  type_name: string;

  @ApiProperty({
    description: '거래 수량',
    example: 20,
  })
  quantity: number;

  @ApiProperty({
    description: '거래 가격',
    example: 12500,
  })
  price: number;

  @ApiProperty({
    description: '총 거래 금액',
    example: 250000,
  })
  total_amount: number;

  @ApiProperty({
    description: '거래 일시 (ISO 8601 형식)',
    example: '2025-01-04T00:00:00Z',
  })
  recorded_at: string;

  @ApiProperty({
    description: '메모',
    example: null,
    nullable: true,
  })
  memo: string | null;

  @ApiProperty({
    description: '수정 일시 (ISO 8601 형식)',
    example: '2025-09-03T12:00:00Z',
  })
  updated_at: string;
}

export class UpdatedAssetHistoryDetail {
  @ApiProperty({
    description: '자산 정보',
    type: UpdateAssetInfo,
  })
  asset_info: UpdateAssetInfo;

  @ApiProperty({
    description: '포트폴리오 정보',
    type: UpdatePortfolioInfo,
  })
  portfolio_info: UpdatePortfolioInfo;

  @ApiProperty({
    description: '카테고리 정보',
    type: UpdateCategoryInfo,
  })
  category_info: UpdateCategoryInfo;

  @ApiProperty({
    description: '거래소/증권사 정보',
    type: UpdateInstitutionInfo,
  })
  institution_info: UpdateInstitutionInfo;

  @ApiProperty({
    description: '통화 정보',
    type: UpdateCurrencyInfo,
  })
  currency_info: UpdateCurrencyInfo;

  @ApiProperty({
    description: '수정된 거래내역 정보',
    type: UpdatedHistory,
  })
  updated_history: UpdatedHistory;
}

export class UpdateAssetHistoryResponseDto {
  @ApiProperty({
    description: '요청 성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: '거래내역이 성공적으로 수정되었습니다',
  })
  message: string;

  @ApiProperty({
    description: '수정된 거래내역 상세 정보',
    type: UpdatedAssetHistoryDetail,
  })
  data: UpdatedAssetHistoryDetail;
}
