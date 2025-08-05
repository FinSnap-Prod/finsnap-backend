import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum CurrencyCode {
  KRW = 'KRW',
  USD = 'USD',
  BTC = 'BTC',
}

export enum TradeType {
  BUY = 'buy', // 매수
  SELL = 'sell', // 매도
  DEPOSIT = 'deposit', // 입금
  WITHDRAW = 'withdraw', // 출금
  EXCHANGE = 'exchange', // 환전
}

export class CreateAssetHistoryRequestDto {
  @ApiProperty({ description: '자산 ID', example: 1 })
  @IsInt()
  @Min(1)
  asset_id: number;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsInt()
  @Min(1)
  category_id: number;

  @ApiProperty({ description: '기관 ID', example: 1 })
  @IsInt()
  @Min(1)
  institution_id: number;

  @ApiProperty({ description: '통화 코드', example: 'KRW' })
  @IsEnum(CurrencyCode)
  currency_code: CurrencyCode;

  @ApiProperty({ description: '거래 유형', example: 'buy' })
  @IsEnum(TradeType)
  type: TradeType;

  @ApiProperty({ description: '거래 가격', example: 10000 })
  @IsNumber()
  price: number;

  @ApiProperty({ description: '거래 수량', example: 100 })
  @IsInt()
  quantity: number;

  @ApiProperty({ description: '메모', example: '거래 메모' })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({ description: '거래 일시', example: '2021-01-01' })
  @IsDateString()
  recorded_at: string;
}

export class CreateAssetHistoryParamDto {
  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  @IsInt()
  @Min(1)
  portfolio_id: number;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsInt()
  @Min(1)
  category_id: number;
}
