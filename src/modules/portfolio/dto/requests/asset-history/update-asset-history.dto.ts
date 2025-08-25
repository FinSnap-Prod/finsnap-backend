import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { CurrencyCode, TradeType } from '../asset/create-asset-history.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAssetHistoryParamsDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsInt()
  portfolio_id: number;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsInt()
  category_id: number;

  @ApiProperty({ description: '자산 ID', example: 1 })
  @IsInt()
  asset_id: number;

  @ApiProperty({ description: '거래내역 ID', example: 1 })
  @IsInt()
  history_id: number;
}

export class UpdateHistoryItem {
  @ApiProperty({ description: '거래 유형', example: 'buy' })
  @IsEnum(TradeType)
  type: TradeType;

  @ApiProperty({ description: '거래 수량', example: 100 })
  @IsInt()
  quantity: number;

  @ApiProperty({ description: '거래 가격', example: 10000 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: '거래 일시', example: '2021-01-01' })
  @IsDateString()
  recorded_at: string;

  @ApiProperty({ description: '메모', example: '거래 메모' })
  @IsOptional()
  @IsString()
  memo?: string;
}

export class UpdateAssetHistoryRequestDto {
  @ApiProperty({ description: '기관 ID', example: 1 })
  @IsInt()
  institution_id: number;

  @ApiProperty({ description: '통화 코드', example: 'KRW' })
  @IsEnum(CurrencyCode)
  curreny_code: CurrencyCode;

  @ApiProperty({
    description: '거래내역',
    example: {
      type: 'buy',
      quantity: 100,
      price: 10000,
      recorded_at: '2021-01-01',
      memo: '거래 메모',
    },
  })
  @IsObject()
  histories: UpdateHistoryItem;
}
