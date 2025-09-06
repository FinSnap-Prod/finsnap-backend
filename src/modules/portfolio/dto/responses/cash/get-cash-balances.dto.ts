import { ApiProperty } from '@nestjs/swagger';

export class CashBalanceFilters {
  @ApiProperty({
    description: '기관 ID',
    example: 1,
  })
  institution_id?: number;

  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  currency_code_id?: number;
}

export class CashBalanceItem {
  @ApiProperty({
    description: '기관 ID',
    example: 1,
  })
  institution_id: number;

  @ApiProperty({
    description: '기관 이름',
    example: '기관 이름',
  })
  institution_name: string;

  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  currency_code_id: number;

  @ApiProperty({
    description: '통화 코드',
    example: '통화 코드',
  })
  currency_code: string;

  @ApiProperty({
    description: '잔액',
    example: 1,
  })
  balance: number;

  @ApiProperty({
    description: '수정 일시',
    example: '2021-01-01T00:00:00Z',
  })
  updated_at: string; // ISO8601
}
export class CashBalancesData {
  @ApiProperty({
    description: '포트폴리오 ID',
    example: 1,
  })
  portfolio_id: number;

  @ApiProperty({
    description: '포트폴리오 이름',
    example: '포트폴리오 이름',
  })
  portfolio_name: string;

  @ApiProperty({
    description: '정렬 기준',
    example: '정렬 기준',
  })
  sorted_by: string;

  @ApiProperty({
    description: '필터',
    type: CashBalanceFilters,
  })
  filters: CashBalanceFilters;

  @ApiProperty({
    description: '잔액',
    type: CashBalanceItem,
  })
  balances: CashBalanceItem[];
}
export class GetCashBalancesResponseDto {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '메시지',
    example: '성공',
  })
  message: string;

  @ApiProperty({
    description: '데이터',
    type: CashBalancesData,
  })
  data: CashBalancesData;
}
