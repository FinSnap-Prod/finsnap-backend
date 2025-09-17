import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class DeleteCashTransactionParamDto {
  @ApiProperty({
    description: '포트폴리오 ID',
    example: 1,
  })
  @IsInt()
  portfolio_id: number;

  @ApiProperty({
    description: '기관 ID',
    example: 1,
  })
  @IsInt()
  institution_id: number;

  @ApiProperty({
    description: '현금 거래 ID',
    example: 1,
  })
  @IsInt()
  id: number;
}

export class DeleteExchangeCashTransactionParamDto {
  @ApiProperty({
    description: '포트폴리오 ID',
    example: 1,
  })
  @IsInt()
  portfolio_id: number;

  @ApiProperty({
    description: '기관 ID',
    example: 1,
  })
  @IsInt()
  institution_id: number;
}

export class DeleteExchangeCashTransactionQueryDto {
  @ApiProperty({
    description: '환전 그룹 ID',
    example: 'EX-123',
  })
  @IsString()
  exchange_group_id?: string;
}
