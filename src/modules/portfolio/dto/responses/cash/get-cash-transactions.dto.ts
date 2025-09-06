import { ApiProperty } from '@nestjs/swagger';
import { CashTransactionType } from '../../enum/cash-transaction-type.enum';

export class PaginationMeta {
  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  current_page: number;

  @ApiProperty({
    description: '페이지 크기',
    example: 10,
  })
  limit: number;
  @ApiProperty({
    description: '총 아이템 수',
    example: 10,
  })
  total_items: number;
  @ApiProperty({
    description: '총 페이지 수',
    example: 10,
  })
  total_pages: number;
}

export class CashTransactionItem {
  @ApiProperty({
    description: '현금 거래 ID',
    example: 1,
  })
  cash_transaction_id: number;

  @ApiProperty({
    description: '타입',
    example: CashTransactionType.DEPOSIT,
  })
  type: CashTransactionType;

  @ApiProperty({
    description: '금액',
    example: 1,
  })
  amount: number; // 양수. +/- 해석은 type 기준

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

  @ApiProperty({
    description: '기록 일시',
    example: '2021-01-01T00:00:00Z',
  })
  recorded_at: string; // ISO8601

  @ApiProperty({
    description: '메모',
    example: '메모',
  })
  memo?: string | null;

  @ApiProperty({
    description: '환전 그룹 ID',
    example: '1',
  })
  exchange_group_id?: string | null;
}

export class CashTransactionsFilters {
  @ApiProperty({
    description: '타입',
    example: CashTransactionType.DEPOSIT,
  })
  type?: CashTransactionType;

  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  currency_code_id?: number;

  @ApiProperty({
    description: '시작 일시',
    example: '2021-01-01T00:00:00Z',
  })
  from?: string;

  @ApiProperty({
    description: '종료 일시',
    example: '2021-01-01T00:00:00Z',
  })
  to?: string;
}

export class CashTransactionsData {
  @ApiProperty({
    description: '포트폴리오 ID',
    example: 1,
  })
  portfolio_id: number;

  @ApiProperty({
    description: '기관 ID',
    example: 1,
  })
  institution_id: number;

  @ApiProperty({
    description: '정렬 기준',
    example: 'recorded_at',
  })
  sorted_by: string; // e.g., "recorded_at"

  @ApiProperty({
    description: '필터',
    type: CashTransactionsFilters,
  })
  filters: CashTransactionsFilters;

  @ApiProperty({
    description: '페이지네이션',
    type: PaginationMeta,
  })
  pagination: PaginationMeta;

  @ApiProperty({
    description: '아이템',
    type: CashTransactionItem,
  })
  items: CashTransactionItem[];
}

export class GetCashTransactionsResponseDto {
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
    type: CashTransactionsData,
  })
  data: CashTransactionsData;
}
