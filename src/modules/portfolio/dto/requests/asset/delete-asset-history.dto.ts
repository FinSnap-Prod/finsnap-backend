import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class DeleteAssetHistoryParamsDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsInt()
  portfolio_id: number;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsInt()
  category_id: number;

  @ApiProperty({ description: '자산 ID', example: 1 })
  @IsInt()
  asset_id: number;

  @ApiProperty({ description: '거래내역 ID', example: 1 })
  @IsInt()
  history_id: number;
}
