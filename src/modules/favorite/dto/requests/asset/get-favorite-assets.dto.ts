import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsOptional, IsIn, IsNumberString } from 'class-validator';

// Path Params DTO
export class GetFavoriteAssetsParamDto {
  @ApiProperty({
    description: '관심종목 폴더 ID',
    example: 11,
  })
  @IsNumberString()
  @IsPositive()
  favorite_id: string;
}

// Query Params DTO
export class GetFavoriteAssetsQueryDto {
  @ApiProperty({
    description: '정렬 기준',
    example: 'name',
    required: false,
    enum: ['name', 'price'],
  })
  @IsOptional()
  @IsIn(['name', 'price'])
  sortBy?: string;

  @ApiProperty({
    description: '정렬 차순',
    example: 'desc',
    required: false,
    enum: ['desc', 'asc'],
  })
  @IsOptional()
  @IsIn(['desc', 'asc'])
  order?: string;
}
