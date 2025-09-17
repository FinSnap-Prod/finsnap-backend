import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { CashCreateType } from '../../enum/cash-create-type.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCashTransactionParamDto {
  @IsInt()
  @ApiProperty({
    description: '포트폴리오 ID',
    example: 1,
  })
  portfolio_id: number;

  @IsInt()
  @ApiProperty({
    description: '기관 ID',
    example: 1,
  })
  institution_id: number;
}

export class CreateCashTransactionBodyDto {
  @IsEnum(CashCreateType)
  @ApiProperty({
    description: '타입',
    example: CashCreateType.DEPOSIT,
  })
  type: CashCreateType;

  // 공통
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '메모',
    example: '메모',
  })
  memo?: string;

  @IsISO8601()
  @ApiProperty({
    description: '기록 일시',
    example: '2021-01-01T00:00:00Z',
  })
  recorded_at: string;

  // 일반거래용 (deposit/withdraw/fee/tax/dividend/other)
  @ValidateIf((o) => o.type !== CashCreateType.EXCHANGE)
  @IsInt()
  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  currency_code_id?: number;

  @ValidateIf((o) => o.type !== CashCreateType.EXCHANGE)
  @IsNumber()
  @Min(0.01)
  @ApiProperty({
    description: '금액',
    example: 1,
  })
  amount?: number;

  // 환전 전용 (exchange)
  @ValidateIf((o) => o.type === CashCreateType.EXCHANGE)
  @IsInt()
  @ApiProperty({
    description: '환전 전 통화 코드 ID',
    example: 1,
  })
  from_currency_id?: number;

  @ValidateIf((o) => o.type === CashCreateType.EXCHANGE)
  @IsInt()
  @ApiProperty({
    description: '환전 후 통화 코드 ID',
    example: 1,
  })
  to_currency_id?: number;

  @ValidateIf((o) => o.type === CashCreateType.EXCHANGE)
  @IsNumber()
  @Min(0.01)
  @ApiProperty({
    description: '환전 전 금액',
    example: 1,
  })
  from_amount?: number;

  @ValidateIf((o) => o.type === CashCreateType.EXCHANGE)
  @IsNumber()
  @Min(0.000001)
  @ApiProperty({
    description: '환율',
    example: 1,
  })
  rate?: number;

  @ValidateIf((o) => o.type === CashCreateType.EXCHANGE)
  @IsNumber()
  @Min(0.01)
  @ApiProperty({
    description: '환전 후 금액',
    example: 1,
  })
  to_amount?: number; // rate 미전달 시 필수
}
