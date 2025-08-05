import { ApiProperty } from '@nestjs/swagger';
import { UpdateFavoriteFolderBodyDto } from '../../requests/folder/update-favorite-folder.dto';

export class UpdateFavoriteFolderResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Favorite folder updated successfully.',
  })
  message: string;

  @ApiProperty({
    description: '수정된 관심종목 폴더 정보',
    type: UpdateFavoriteFolderBodyDto,
    example: {
      favorite_id: 1,
      name: '배당주 투자',
      sort_order: 1,
    },
  })
  data: UpdateFavoriteFolderBodyDto;
}
