import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteCategoryParamDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsString()
  portfolio_id: string;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsString()
  category_id: string;
}
