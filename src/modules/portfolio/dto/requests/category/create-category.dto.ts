import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Length, Min } from 'class-validator';

export class CreateCategoryRequestDto {
  @ApiProperty({ description: '카테고리 이름', example: '카테고리 1' })
  @IsString()
  @Length(1, 100)
  name: string;
}

export class CreateCategoryParamDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsInt()
  @Min(1)
  portfolio_id: number;
}
