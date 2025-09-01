import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// CurrencyCode enum 추가
export enum CurrencyCode {
  KRW = 'KRW',
  USD = 'USD',
  EUR = 'EUR',
  JPY = 'JPY',
  CNY = 'CNY',
  BTC = 'BTC',
  ETH = 'ETH',
  USDT = 'USDT',
  XRP = 'XRP',
  USDC = 'USDC',
}

// TradeType enum 추가
export enum TradeType {
  BUY = 'buy',
  SELL = 'sell',
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  EXCHANGE = 'exchange',
  DIVIDEND = 'dividend',
  INTEREST = 'interest',
  FEE = 'fee',
  TAX = 'tax',
  OTHER = 'other',
}

export class CreateAssetHistoryRequestDto {
  @ApiProperty({ description: '기관 ID', example: 1 })
  @IsInt()
  @Min(1)
  institution_id: number;

  @ApiProperty({ description: '통화 코드 ID', example: 1 })
  @IsInt()
  @Min(1)
  currency_code_id: number;

  @ApiProperty({ description: '자산 거래 유형 ID', example: 1 })
  @IsInt()
  @Min(1)
  asset_history_type_id: number;

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
  @IsString()
  portfolio_id: string;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  @IsString()
  category_id: string;

  @ApiProperty({ description: '자산 ID', example: 1 })
  @IsString()
  asset_id: string;
}
