import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { CashTransactionType } from '../../enum/cash-transaction-type.enum';
import { CashSortBy } from '../../enum/cash-sortby.enum';
import { SortOrder } from '../../enum/sort-order.enum';

export class GetCashTransactionsParamDto {
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: '포트폴리오 ID',
    example: 1,
  })
  portfolio_id: number;

  @IsInt()
  @Min(1)
  @ApiProperty({
    description: '기관 ID',
    example: 1,
  })
  institution_id: number;
}

export class GetCashTransactionsQueryDto {
  @IsOptional()
  @IsEnum(CashTransactionType)
  @ApiProperty({
    description: '타입',
    example: CashTransactionType.DEPOSIT,
  })
  type?: CashTransactionType;

  @IsOptional()
  @IsInt()
  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  currency_code_id?: number;

  @IsOptional()
  @IsISO8601()
  @ApiProperty({
    description: '시작 일시',
    example: '2021-01-01T00:00:00Z',
  })
  from?: string;

  @IsOptional()
  @IsISO8601()
  @ApiProperty({
    description: '종료 일시',
    example: '2021-01-01T00:00:00Z',
  })
  to?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiProperty({
    description: '페이지',
    example: 1,
  })
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({
    description: '페이지 크기',
    example: 10,
  })
  limit?: number;

  @IsOptional()
  @IsEnum(CashSortBy)
  @ApiProperty({
    description: '정렬 기준',
    example: CashSortBy.RECORDED_AT,
  })
  sortBy?: CashSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiProperty({
    description: '정렬 순서',
    example: SortOrder.ASC,
  })
  order?: SortOrder;
}
