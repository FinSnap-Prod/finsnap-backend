import { ApiProperty } from '@nestjs/swagger';

export class CreatedFavoriteAssetDto {
  @ApiProperty({ description: '관심종목 자산 ID', example: 102 })
  favorite_asset_id: number;

  @ApiProperty({ description: '자산 타입', example: 'crypto' })
  asset_type: string;

  @ApiProperty({ description: '자산 정보 ID', example: 555 })
  info_id: number;

  @ApiProperty({ description: '정렬 순서', example: 2 })
  sort_order: number;

  @ApiProperty({
    description: '자산 정보',
    example: {
      ticker: 'BTC',
      kor_name: '비트코인',
      eng_name: 'Bitcoin',
      market: 'Binance',
      price: 30200,
      change_price: 300,
      change_rate: 1.01,
    },
  })
  info: {
    ticker: string;
    kor_name: string;
    eng_name: string;
    market: string;
    price: number;
    change_price: number;
    change_rate: number;
  };
}

export class CreateFavoriteAssetResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Asset added to favorite folder successfully.',
  })
  message: string;

  @ApiProperty({
    description: '생성된 관심종목 자산 정보',
    type: CreatedFavoriteAssetDto,
  })
  data: CreatedFavoriteAssetDto;
}
