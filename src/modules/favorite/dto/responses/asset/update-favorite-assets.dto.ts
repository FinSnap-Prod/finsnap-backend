import { ApiProperty } from '@nestjs/swagger';
import { UpdateFavoriteAssetItemDto } from '../../requests/asset/update-favorite-assets.dto';

export class UpdateFavoriteAssetResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Favorite assets order updated successfully.',
  })
  message: string;

  @ApiProperty({
    description: '관심종목 자산 목록',
    type: [UpdateFavoriteAssetItemDto],
  })
  data: UpdateFavoriteAssetItemDto[];
}
