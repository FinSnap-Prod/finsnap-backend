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
  // 일반 타입만 허용(deposit/withdraw/fee/tax/dividend/other)
  @IsOptional()
  @IsEnum(NormalCashType)
  @ApiProperty({
    description: '타입',
    example: NormalCashType.DEPOSIT,
  })
  type?: NormalCashType;

  @IsOptional()
  @IsInt()
  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  currency_code_id?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @ApiProperty({
    description: '금액',
    example: 1,
  })
  amount?: number;

  @IsOptional()
  @IsISO8601()
  @ApiProperty({
    description: '기록 일시',
    example: '2021-01-01T00:00:00Z',
  })
  recorded_at?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: '메모',
    example: '메모',
  })
  memo?: string;
}
