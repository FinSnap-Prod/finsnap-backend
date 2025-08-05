import { ApiProperty } from '@nestjs/swagger';

export class DeleteFavoriteAssetResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Asset removed from favorite folder successfully.',
  })
  message: string;
}
