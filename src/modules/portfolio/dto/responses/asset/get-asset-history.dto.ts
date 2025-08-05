import { ApiProperty } from '@nestjs/swagger';

export class AssetHistoryItem {
  @ApiProperty({ description: '거래내역 ID', example: 1 })
  asset_history_id: number;

  @ApiProperty({ description: '거래 유형', example: 'buy' })
  type: string;

  @ApiProperty({ description: '거래 수량', example: 100 })
  quantity: number;

  @ApiProperty({ description: '거래 가격', example: 10000 })
  price: number;

  @ApiProperty({ description: '거래 총액', example: 1000000 })
  total: number;

  @ApiProperty({ description: '거래 일시', example: '2021-01-01' })
  recorded_at: string;

  @ApiProperty({ description: '메모', example: '거래 메모' })
  memo?: string;
}

export class AssetHistoryDetail {
  @ApiProperty({ description: '통화 코드', example: 'KRW' })
  currency_code: string;

  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  portfolio_id: number;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  category_id: number;

  @ApiProperty({ description: '카테고리 이름', example: '카테고리 1' })
  category_name: string;

  @ApiProperty({ description: '기관 ID', example: 1 })
  institution_id: number;

  @ApiProperty({ description: '기관 이름', example: '키움증권' })
  institution_name: string;

  @ApiProperty({ description: '자산 ID', example: 1 })
  asset_id: number;

  @ApiProperty({ description: '자산 이름', example: '삼성전자' })
  asset_name: string;

  @ApiProperty({ description: '거래내역 목록', type: [AssetHistoryItem] })
  histories: AssetHistoryItem[];
}

export class GetAssetHistoryResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Asset history retrieved successfully.',
  })
  message: string;

  @ApiProperty({
    description: '거래내역 상세 정보',
    type: AssetHistoryDetail,
    example: {
      currency_code: 'KRW',
      portfolio_id: 1,
      category_id: 1,
      category_name: '카테고리 1',
      institution_id: 1,
      institution_name: '키움증권',
      asset_id: 1,
      asset_name: '삼성전자',
      histories: [
        {
          asset_history_id: 1,
          type: 'buy',
          quantity: 100,
          price: 10000,
          total: 1000000,
          recorded_at: '2021-01-01',
          memo: '거래 메모',
        },
      ],
    },
  })
  data: AssetHistoryDetail;
}
