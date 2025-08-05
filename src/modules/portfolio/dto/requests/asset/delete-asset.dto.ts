import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DeleteAssetParamDto {
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
