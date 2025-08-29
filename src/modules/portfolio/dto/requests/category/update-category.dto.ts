import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateCategoryRequestDto {
  @ApiProperty({ description: '카테고리 이름', example: '카테고리 1' })
  @IsString()
  @Length(1, 100)
  name: string;
}

export class UpdateCategoryParamDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsString()
  portfolio_id: string;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsString()
  category_id: string;
}
