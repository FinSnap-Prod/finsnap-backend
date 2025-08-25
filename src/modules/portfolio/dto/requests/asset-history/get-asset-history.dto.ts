import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetAssetHistoryParamDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsInt()
  @Min(1)
  portfolio_id: number;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsInt()
  @Min(1)
  category_id: number;

  @ApiProperty({ description: '자산 ID', example: 1 })
  @IsInt()
  @Min(1)
  asset_id: number;
}

export class GetAssetHistoryQueryDto {
  @ApiProperty({ description: '정렬 순서', example: 'asc' })
  @IsOptional()
  @IsEnum(SortOrder)
  order: SortOrder;
}
