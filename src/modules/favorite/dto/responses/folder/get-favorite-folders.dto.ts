import { ApiProperty } from '@nestjs/swagger';

export class FavoriteFolderSummary {
  @ApiProperty({ description: '관심종목 ID', example: 1 })
  favorite_id: number;

  @ApiProperty({ description: '관심종목 이름', example: '배당주 투자' })
  name: string;

  @ApiProperty({ description: '정렬 순서', example: 1 })
  sort_order: number;
}

export class GetFavoriteFoldersResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Favorite Folders retrieved successfully.',
  })
  message: string;

  @ApiProperty({
    description: '관심종목 목록',
    type: [FavoriteFolderSummary],
    example: [
      {
        favorite_id: 1,
        name: '배당주 투자',
        sort_order: 1,
      },
      {
        favorite_id: 2,
        name: '해외 성장주',
        sort_order: 2,
      },
    ],
  })
  data: FavoriteFolderSummary[];
}
