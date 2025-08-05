import { ApiProperty } from '@nestjs/swagger';

export class CreatedFavoriteFolder {
  @ApiProperty({ description: '관심종목 폴더 ID', example: 1 })
  favorite_id: number;

  @ApiProperty({ description: '관심종목 폴더 이름', example: '배당주 투자' })
  name: string;

  @ApiProperty({ description: '정렬 순서', example: 1 })
  sort_order: number;
}

export class CreateFavoriteFolderResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Favorite Folder created successfully.',
  })
  message: string;

  @ApiProperty({
    description: '생성된 폴더 정보',
    type: CreatedFavoriteFolder,
    example: {
      favorite_id: 1,
      name: '배당주 투자',
      sort_order: 1,
    },
  })
  data: CreatedFavoriteFolder;
}
