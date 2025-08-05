import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// 개별 관심종목 아이템 DTO
export class UpdateFavoriteAssetItemDto {
  @ApiProperty({
    description: '관심종목 ID',
    example: 3,
  })
  @IsNumber()
  @IsPositive()
  id: number;

  @ApiProperty({
    description: '정렬 순서',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  sort_order: number;
}

// Body DTO (요청 본문)
export class UpdateFavoriteAssetBodyDto {
  @ApiProperty({
    description: '관심종목 목록',
    type: [UpdateFavoriteAssetItemDto],
    example: [
      { id: 3, sort_order: 1 },
      { id: 1, sort_order: 2 },
      { id: 2, sort_order: 3 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFavoriteAssetItemDto)
  favoriteAssets: UpdateFavoriteAssetItemDto[];
}

// Params DTO (경로 파라미터) - 필요시 사용
export class UpdateFavoriteAssetParamsDto {
  @ApiProperty({
    description: '관심종목 폴더 ID',
    example: 11,
  })
  @IsNumber()
  @IsPositive()
  favorite_id: number;
}
