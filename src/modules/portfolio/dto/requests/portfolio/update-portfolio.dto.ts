import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePortfolioItemDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsInt()
  id: number;

  @ApiProperty({
    description: '포트폴리오 이름',
    example: '내 투자 포트폴리오',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @Length(1, 50)
  name: string;

  @ApiProperty({ description: '정렬 순서', example: 1 })
  @IsInt()
  sort_order: number;
}

export class UpdatePortfolioRequestDto {
  @ApiProperty({
    description: '업데이트할 포트폴리오 목록',
    type: [UpdatePortfolioItemDto],
    example: [
      {
        id: 1,
        name: '내 투자 포트폴리오',
        sort_order: 1,
      },
      {
        id: 2,
        name: '테스트 포트폴리오',
        sort_order: 2,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePortfolioItemDto)
  portfolios: UpdatePortfolioItemDto[];
}
