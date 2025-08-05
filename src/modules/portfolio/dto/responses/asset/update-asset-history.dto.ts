import { ApiProperty } from '@nestjs/swagger';

export class EditedHistory {
  asset_history_id: number;
  type: string;
  quantity: number;
  price: number;
  total: number;
  recorded_at: string;
  memo?: string;
}

export class UpdateAssetHistoryItem {
  currency_code: string;
  portfolio_id: number;
  category_id: number;
  category_name: string;
  institution_id: number;
  institution_name: string;
  asset_id: number;
  histories: EditedHistory;
}

export class UpdateAssetHistoryResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Asset history updated successfully.',
  })
  message: string;

  @ApiProperty({
    description: '수정된 거래내역 정보',
    type: UpdateAssetHistoryItem,
    example: {
      currency_code: 'KRW',
      portfolio_id: 1,
      category_id: 1,
      category_name: '카테고리 1',
      institution_id: 1,
      institution_name: '키움증권',
      asset_id: 1,
      histories: {
        asset_history_id: 1,
        type: 'buy',
        quantity: 100,
        price: 10000,
        total: 1000000,
        recorded_at: '2021-01-01',
        memo: '거래 메모',
      },
    },
  })
  data: UpdateAssetHistoryItem;
}
