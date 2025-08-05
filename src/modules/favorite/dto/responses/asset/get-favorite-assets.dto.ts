import { ApiProperty } from '@nestjs/swagger';

export class FavoriteAssetDto {
  @ApiProperty({ description: '자산 ID', example: 1 })
  favorite_asset_id: number;

  @ApiProperty({ description: '자산 타입', example: 'stock' })
  asset_type: string;

  @ApiProperty({ description: '자산 정보 ID', example: 321 })
  info_id: number;

  @ApiProperty({
    description: '자산 정보',
    example: {
      ticker: '005930',
      name: '삼성전자',
      market: 'KOSPI',
      price: 73500,
      change_price: -200,
      change_rate: -0.27,
    },
  })
  info: {
    ticker: string;
    name: string;
    market: string;
    price: number;
    change_price: number;
    change_rate: number;
  };
}

export class GetFavoriteAssetsResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Favorite Assets retrieved successfully.',
  })
  message: string;

  @ApiProperty({
    description: '관심종목 자산 목록',
    type: [FavoriteAssetDto],
    example: [
      {
        favorite_asset_id: 101,
        asset_type: 'stock',
        info_id: 321,
        sort_order: 1,
        info: {
          ticker: '005930',
          name: '삼성전자',
          market: 'KOSPI',
          price: 73500,
          change_price: -200,
          change_rate: -0.27,
        },
      },
      {
        favorite_asset_id: 102,
        asset_type: 'crypto',
        info_id: 555,
        sort_order: 2,
        info: {
          ticker: 'BTC',
          name: 'Bitcoin',
          market: 'Binance',
          price: 30200,
          change_price: 300,
          change_rate: 1.01,
        },
      },
    ],
  })
  data: FavoriteAssetDto[];
}
