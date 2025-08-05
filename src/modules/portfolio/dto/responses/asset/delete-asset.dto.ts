import { ApiProperty } from '@nestjs/swagger';

export class DeleteAssetData {
  @ApiProperty({ description: '자산 ID', example: 1 })
  asset_id: number;

  @ApiProperty({ description: '삭제일', example: '2021-01-01' })
  deleted_at: string;
}

export class DeleteAssetResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Asset deleted successfully.',
  })
  message: string;

  @ApiProperty({
    description: '삭제된 자산 정보',
    type: DeleteAssetData,
    example: {
      asset_id: 1,
      deleted_at: '2021-01-01',
    },
  })
  data: DeleteAssetData;
}
