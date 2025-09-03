import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAssetHistoryParamDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '포트폴리오 ID', example: '1' })
  portfolio_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '카테고리 ID', example: '1' })
  category_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '자산 ID', example: '1' })
  asset_id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '거래내역 ID', example: '1' })
  history_id: string;
}
