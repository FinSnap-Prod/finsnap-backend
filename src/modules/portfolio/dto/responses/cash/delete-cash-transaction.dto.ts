import { ApiProperty } from '@nestjs/swagger';

export class CashBalanceItem {
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

// 단건 삭제 응답 형태
export class DeleteSingleResult {
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
    description: '삭제된 현금 거래 ID',
    example: 1,
  })
  deleted_transaction_id: number;
  @ApiProperty({
    description: '삭제 후 잔액',
    example: CashBalanceItem,
  })
  balance_after: CashBalanceItem;
}

// 환전 그룹 삭제 응답 형태
export class DeleteExchangeGroupResult {
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
    description: '환전 그룹 ID',
    example: 'EX-123',
  })
  exchange_group_id: string;
  @ApiProperty({
    description: '삭제된 현금 거래 ID',
    example: [1, 2, 3],
  })
  deleted_transaction_ids: number[];
  @ApiProperty({
    description: '삭제 후 잔액',
    example: [CashBalanceItem],
  })
  balances_after: CashBalanceItem[];
}

export class DeleteCashTransactionResponseDto {
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
    example: {
      portfolio_id: 1,
      institution_id: 1,
      deleted_transaction_id: 1,
      balance_after: {
        currency_code_id: 1,
        currency_code: 'KRW',
        balance: 1000000,
        updated_at: '2021-01-01T00:00:00Z',
      },
    },
  })
  // 실제 런타임에서는 둘 중 하나의 형태로 반환됩니다.
  data: DeleteSingleResult | DeleteExchangeGroupResult;
}
