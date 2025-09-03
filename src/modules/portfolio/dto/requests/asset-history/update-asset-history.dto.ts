import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsISO8601,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateAssetHistoryParamDto {
  @ApiProperty({
    description: '포트폴리오 ID',
    example: '7',
  })
  @IsString()
  portfolio_id: string;

  @ApiProperty({
    description: '카테고리 ID',
    example: '2',
  })
  @IsString()
  category_id: string;

  @ApiProperty({
    description: '자산 ID',
    example: '2321',
  })
  @IsString()
  asset_id: string;

  @ApiProperty({
    description: '거래내역 ID',
    example: '112',
  })
  @IsString()
  history_id: string;
}

export class UpdateAssetHistoryRequestDto {
  @ApiProperty({
    description: '거래소/증권사 ID',
    example: 2,
  })
  @IsInt()
  @Min(1)
  institution_id: number;

  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  currency_code_id: number;

  @ApiProperty({
    description: '거래 타입 ID (1: 매수, 2: 매도, 3: 입금, 4: 출금, 5: 교환)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  asset_history_type_id: number;

  @ApiProperty({
    description: '거래 가격',
    example: 23000,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: '거래 수량',
    example: 10,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: '거래 일시 (ISO 8601 형식)',
    example: '2024-01-15T14:30:00Z',
  })
  @IsISO8601()
  recorded_at: string;

  @ApiProperty({
    description: '메모',
    example: '7월 매수',
    required: false,
  })
  @IsOptional()
  @IsString()
  memo?: string;
}
