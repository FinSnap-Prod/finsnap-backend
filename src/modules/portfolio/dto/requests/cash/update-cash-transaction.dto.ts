import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { NormalCashType } from '../../enum/normal-cash-type.enum';

export class UpdateCashTransactionParamDto {
  @IsInt()
  portfolio_id: number;

  @IsInt()
  institution_id: number;

  @IsInt()
  id: number;
}

export class UpdateCashTransactionBodyDto {
  @IsEnum(NormalCashType)
  @ApiProperty({
    description: '타입',
    example: NormalCashType.DEPOSIT,
  })
  type: NormalCashType;

  @IsInt()
  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  currency_code_id: number;

  @IsNumber()
  @Min(0.01)
  @ApiProperty({
    description: '금액',
    example: 1,
  })
  amount: number;

  @IsISO8601()
  @ApiProperty({
    description: '기록 일시',
    example: '2021-01-01T00:00:00Z',
  })
  recorded_at: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '메모',
    example: '메모',
  })
  memo?: string;
}

export class UpdateExchangeCashTransactionParamDto {
  @IsInt()
  portfolio_id: number;

  @IsInt()
  institution_id: number;
}

export class UpdateExchangeCashTransactionQueryDto {
  @IsOptional()
  @IsString()
  exchange_group_id: string;
}

export class UpdateExchangeCashTransactionBodyDto {
  @IsInt()
  from_currency_id: number;

  @IsInt()
  to_currency_id: number;

  @IsNumber()
  @Min(0.01)
  from_amount: number;

  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  rate: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  to_amount: number;

  @IsOptional()
  @IsString()
  memo?: string;

  @IsISO8601()
  recorded_at: string;
}
