import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortField {
  RECORDED_AT = 'recorded_at', // 거래일시 (기본값)
  PRICE = 'price', // 거래가격
  QUANTITY = 'quantity', // 거래수량
  TOTAL = 'total_amount', // 거래총액
  TYPE = 'asset_history_type_id', // 거래타입
}

export enum TransactionType {
  BUY = 'buy', // 매수
  SELL = 'sell', // 매도
  DEPOSIT = 'deposit', // 입금
  WITHDRAW = 'withdraw', // 출금
  EXCHANGE = 'exchange', // 환전
}

export class GetAssetHistoryParamDto {
  @ApiProperty({ description: '포트폴리오 ID', example: '1' })
  @IsString()
  @IsNotEmpty()
  portfolio_id: string;

  @ApiProperty({ description: '카테고리 ID', example: '1' })
  @IsString()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ description: '자산 ID', example: '1' })
  @IsString()
  @IsNotEmpty()
  asset_id: string;
}

export class GetAssetHistoryQueryDto {
  @ApiProperty({ description: '정렬 순서', example: 'asc', required: false })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;

  @ApiProperty({
    description: '정렬 필드',
    example: 'recorded_at',
    required: false,
  })
  @IsOptional()
  @IsEnum(SortField)
  sortBy?: SortField;

  @ApiProperty({ description: '페이지 번호', example: '1', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  page?: string;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: '20',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  limit?: string;

  @ApiProperty({
    description: '거래 유형',
    example: 'buy',
    required: false,
  })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;
}
