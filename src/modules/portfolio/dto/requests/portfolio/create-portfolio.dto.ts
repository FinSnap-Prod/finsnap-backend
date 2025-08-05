import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreatePortfolioRequestDto {
  @ApiProperty({ description: '포트폴리오 이름', example: '포트폴리오 1' })
  @IsString()
  @Length(1, 50)
  name: string;
}
