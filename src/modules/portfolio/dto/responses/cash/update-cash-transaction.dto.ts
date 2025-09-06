import { ApiProperty } from '@nestjs/swagger';
import { CashTransactionType } from '../../enum/cash-transaction-type.enum';

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
  type: CashTransactionType; // deposit|withdraw|fee|tax|dividend|other|exchange_out|exchange_in
  @ApiProperty({
    description: '금액',
    example: 1,
  })
  amount: number; // 항상 양수
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
  exchange_group_id?: string | null; // 일반 수정에서는 항상 null
}

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

export class UpdateCashTransactionResponseDto {
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
      transaction: CashTransactionItem,
      balance_after: CashBalanceItem,
    },
  })
  data: {
    portfolio_id: number;
    institution_id: number;
    transaction: CashTransactionItem;
    balance_after: CashBalanceItem;
  };
}
