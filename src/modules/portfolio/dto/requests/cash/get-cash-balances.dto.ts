import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BalancesSortBy } from '../../enum/balances-sortby.enum';
import { SortOrder } from '../../enum/sort-order.enum';

export class GetCashBalancesParamDto {
  @ApiProperty({
    description: '포트폴리오 ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  portfolio_id: number;
}

export class GetCashBalancesQueryDto {
  @ApiProperty({
    description: '기관 ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  institution_id?: number;

  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  currency_code_id?: number;

  @ApiProperty({
    description: '정렬 기준',
    example: BalancesSortBy.BALANCE,
  })
  @IsEnum(BalancesSortBy)
  @IsOptional()
  sortBy?: BalancesSortBy;

  @ApiProperty({
    description: '정렬 순서',
    example: SortOrder.ASC,
  })
  @IsEnum(SortOrder)
  @IsOptional()
  order?: SortOrder;
}
