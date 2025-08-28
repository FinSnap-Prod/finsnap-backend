import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetPortfolioSummaryParamDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsString()
  portfolio_id: string;
}
