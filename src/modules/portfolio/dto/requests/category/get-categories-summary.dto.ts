import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export class GetCategoriesSummaryParamDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsInt()
  @Min(1)
  portfolio_id: number;
}

export class GetCategoriesSummaryQueryDto {
  @ApiProperty({ description: '정렬 기준', example: 'name' })
  @IsOptional()
  @IsEnum(['name', 'profit_amount', 'profit_rate', 'purchase_amount'])
  sortBy: string;

  @ApiProperty({ description: '정렬 순서', example: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  category_id?: number;
}
