import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsIn, IsString } from 'class-validator';

// Path Params DTO
export class CreateFavoriteAssetParamDto {
  @ApiProperty({
    description: '관심종목 폴더 ID',
    example: 11,
  })
  @IsString()
  @IsPositive()
  favorite_id: string;
}

// Body DTO
export class CreateFavoriteAssetBodyDto {
  @ApiProperty({
    description: '자산 타입',
    example: 'stock',
    enum: ['stock', 'crypto', 'etf', 'deposit'],
  })
  @IsString()
  @IsIn(['stock', 'crypto', 'etf', 'deposit'])
  asset_type: string;

  @ApiProperty({
    description: '자산 정보 ID',
    example: 3203,
  })
  @IsString()
  info_id: string;
}
