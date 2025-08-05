import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class DeletePortfolioParamDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsInt()
  @Min(1)
  portfolio_id: number;
}
