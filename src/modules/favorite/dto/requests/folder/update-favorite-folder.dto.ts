import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  Length,
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// 개별 관심종목 아이템 DTO
export class FavoriteItemDto {
  @ApiProperty({
    description: '관심종목 ID',
    example: 3,
  })
  @IsNumber()
  @IsPositive()
  id: number;

  @ApiProperty({
    description: '관심종목 이름',
    example: '배당주',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: '정렬 순서',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  sort_order: number;
}

// Body DTO (요청 본문)
export class UpdateFavoriteFolderBodyDto {
  @ApiProperty({
    description: '관심종목 목록',
    type: [FavoriteItemDto],
    example: [
      { id: 3, name: '배당주', sort_order: 1 },
      { id: 1, name: '가치주', sort_order: 2 },
      { id: 2, name: '미국ETF', sort_order: 3 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FavoriteItemDto)
  favorites: FavoriteItemDto[];
}

// Params DTO (경로 파라미터) - 필요시 사용
export class UpdateFavoriteFolderParamsDto {
  @ApiProperty({
    description: '관심종목 폴더 ID',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  id: number;
}
