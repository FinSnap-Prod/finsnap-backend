import { ApiProperty } from '@nestjs/swagger';

export class CreateAssetItem {
  @ApiProperty({ description: '자산 ID', example: 1 })
  asset_id: number;

  @ApiProperty({ description: '카테고리 ID', example: 1 })
  category_id: number;

  @ApiProperty({ description: '기관 ID', example: 1 })
  institution_id: number;

  @ApiProperty({ description: '통화 코드', example: 'KRW' })
  currency_code: string;

  @ApiProperty({ description: '거래 유형', example: 'buy' })
  type: string;

  @ApiProperty({ description: '거래 가격', example: 10000 })
  price: number;

  @ApiProperty({ description: '거래 수량', example: 100 })
  quantity: number;

  @ApiProperty({ description: '메모', example: '거래 메모' })
  memo?: string;

  @ApiProperty({ description: '생성일', example: '2021-01-01' })
  created_at: string;
}

export class CreateAssetHistoryResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Asset history created successfully.',
  })
  message: string;

  @ApiProperty({
    description: '생성된 거래내역 정보',
    type: CreateAssetItem,
    example: {
      asset_id: 1,
      category_id: 1,
      institution_id: 1,
      currency_code: 'KRW',
      type: 'buy',
      price: 10000,
      quantity: 100,
      memo: '거래 메모',
      created_at: '2021-01-01',
    },
  })
  data: CreateAssetItem;
}
