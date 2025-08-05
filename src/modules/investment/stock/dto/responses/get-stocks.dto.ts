import { ApiProperty } from '@nestjs/swagger';

export class StockMetrics {
  @ApiProperty({ description: 'PER (주가수익비율)', example: 15.2 })
  per: number;

  @ApiProperty({ description: 'PBR (주가순자산비율)', example: 1.8 })
  pbr: number;

  @ApiProperty({ description: 'EPS (주당순이익)', example: 4850 })
  eps: number;

  @ApiProperty({ description: 'BPS (주당순자산)', example: 40800 })
  bps: number;

  @ApiProperty({ description: 'ROA (자산수익률)', example: 8.5 })
  roa: number;

  @ApiProperty({ description: 'ROE (자기자본수익률)', example: 12.3 })
  roe: number;
}

export class StockReturns {
  @ApiProperty({ description: '1개월 수익률', example: 5.2 })
  return1m: number;

  @ApiProperty({ description: '3개월 수익률', example: 12.8 })
  return3m: number;

  @ApiProperty({ description: '6개월 수익률', example: 18.5 })
  return6m: number;

  @ApiProperty({ description: '1년 수익률', example: 25.3 })
  return1y: number;

  @ApiProperty({ description: '3년 수익률', example: 45.7 })
  return3y: number;
}

export class StockItem {
  @ApiProperty({ description: '주식 ID', example: 1 })
  stock_id: number;

  @ApiProperty({ description: '주식명', example: '삼성전자' })
  name: string;

  @ApiProperty({ description: '티커', example: '005930' })
  ticker: string;

  @ApiProperty({ description: '시장', example: 'KOSPI' })
  market: string;

  @ApiProperty({ description: '통화 코드', example: 'KRW' })
  currency_code: string;

  @ApiProperty({ description: '현재가', example: 73500 })
  price: number;

  @ApiProperty({ description: '시가총액', example: 438000000000000 })
  market_cap: number;

  @ApiProperty({ description: '변동금액', example: -200 })
  change_price: number;

  @ApiProperty({ description: '변동률', example: -0.27 })
  change_rate: number;

  @ApiProperty({
    description: '업데이트 시간',
    example: '2024-01-15T09:30:00Z',
  })
  updated_at: string;

  @ApiProperty({ description: '수익률 정보', type: StockReturns })
  returns: StockReturns;

  @ApiProperty({ description: '재무 지표', type: StockMetrics })
  metrics: StockMetrics;
}

export class GetStocksData {
  @ApiProperty({ description: '주식 목록', type: [StockItem] })
  items: StockItem[];

  @ApiProperty({ description: '정렬 기준', example: 'name' })
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

export class GetStocksResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Stock search results retrieved successfully.',
  })
  message: string;

  @ApiProperty({ description: '주식 목록 데이터', type: GetStocksData })
  data: GetStocksData;
}
