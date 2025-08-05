import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetDepositsQueryDto {
  @ApiProperty({
    description: '검색어 (은행명 또는 상품명)',
    example: '신한',
    required: false,
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({
    description: '상품 유형',
    example: 'savings',
    enum: ['savings', 'deposit'],
    required: false,
  })
  @IsOptional()
  @IsIn(['savings', 'deposit'])
  market?: string;

  @ApiProperty({
    description: '예치 금액 (원)',
    example: 10000000,
    minimum: 1000000,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1000000)
  amount?: number;

  @ApiProperty({
    description: '예치 기간 (개월)',
    example: 12,
    minimum: 1,
    maximum: 60,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(60)
  period?: number;

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
    example: 'rate',
    enum: ['name', 'rate', 'amount', 'period'],
    required: false,
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'rate', 'amount', 'period'])
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
