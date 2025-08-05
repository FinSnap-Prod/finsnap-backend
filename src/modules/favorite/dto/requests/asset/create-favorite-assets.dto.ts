import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsIn,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Path Params DTO
export class CreateFavoriteAssetParamDto {
  @ApiProperty({
    description: '관심종목 폴더 ID',
    example: 11,
  })
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  favorite_id: number;
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
  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => parseInt(value))
  info_id: number;
}
