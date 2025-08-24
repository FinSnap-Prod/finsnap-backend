import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class DeleteFavoriteAssetParamDto {
  @ApiProperty({
    description: '관심종목 폴더 ID',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  favorite_id: string;

  @ApiProperty({
    description: '관심종목 자산 ID',
    example: 2132,
  })
  @IsNumber()
  @IsPositive()
  favorite_asset_id: string;
}
