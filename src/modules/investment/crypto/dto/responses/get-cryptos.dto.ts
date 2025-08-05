import { ApiProperty } from '@nestjs/swagger';

export class CryptoMarket {
  @ApiProperty({ description: '거래소', example: 'Binance' })
  market: string;

  @ApiProperty({ description: '통화 코드', example: 'USDT' })
  currency_code: string;

  @ApiProperty({ description: '현재가', example: 30200 })
  price: number;

  @ApiProperty({ description: '변동금액', example: 300 })
  change_price: number;

  @ApiProperty({ description: '변동률', example: 1.01 })
  change_rate: number;

  @ApiProperty({ description: '누적 거래량', example: 1250000 })
  acc_trade_volume: number;

  @ApiProperty({ description: '누적 거래대금', example: 37750000000 })
  acc_trade_price: number;

  @ApiProperty({ description: '시가총액', example: 590000000000 })
  market_cap: number;

  @ApiProperty({
    description: '업데이트 시간',
    example: '2024-01-15T09:30:00Z',
  })
  updated_at: string;
}

export class CryptoItem {
  @ApiProperty({ description: '암호화폐 ID', example: 1 })
  crypto_id: number;

  @ApiProperty({ description: '영문명', example: 'Bitcoin' })
  eng_name: string;

  @ApiProperty({ description: '한글명', example: '비트코인' })
  kor_name: string;

  @ApiProperty({ description: '티커', example: 'BTC' })
  ticker: string;

  @ApiProperty({ description: '거래소별 시장 정보', type: [CryptoMarket] })
  markets: CryptoMarket[];
}

export class GetCryptosData {
  @ApiProperty({ description: '암호화폐 목록', type: [CryptoItem] })
  items: CryptoItem[];

  @ApiProperty({ description: '정렬 기준', example: 'price' })
  sortBy: string;

  @ApiProperty({ description: '정렬 순서', example: 'desc' })
  order: string;

  @ApiProperty({ description: '전체 개수', example: 150 })
  total_count: number;

  @ApiProperty({ description: '현재 페이지', example: 1 })
  page: number;

  @ApiProperty({ description: '페이지당 개수', example: 20 })
  limit: number;
}

export class GetCryptosResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Cryptos retrieved successfully.',
  })
  message: string;

  @ApiProperty({ description: '암호화폐 목록 데이터', type: GetCryptosData })
  data: GetCryptosData;
}
