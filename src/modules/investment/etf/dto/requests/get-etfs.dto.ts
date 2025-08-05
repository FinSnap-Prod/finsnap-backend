import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GetEtfsQueryDto {
  @ApiProperty({
    description: '검색어 (주식명 또는 티커)',
    example: 'QQQ',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: '시장 구분',
    example: 'domestic',
    enum: ['domestic', 'overseas'],
    required: false,
  })
  @IsOptional()
  @IsIn(['domestic', 'overseas'])
  market?: string;

  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 개수',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: '정렬 기준',
    example: 'name',
    enum: ['name', 'price', 'market_cap', 'change_rate'],
    required: false,
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'price', 'market_cap', 'change_rate'])
  sortBy?: string = 'name';

  @ApiProperty({
    description: '정렬 순서',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
    default: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: string = 'asc';
}
