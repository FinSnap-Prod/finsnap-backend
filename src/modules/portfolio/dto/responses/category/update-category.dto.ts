import { ApiProperty } from '@nestjs/swagger';

export class UpdateCategoryItem {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  category_id: number;

  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  portfolio_id: number;

  @ApiProperty({ description: '카테고리 이름', example: '카테고리 1' })
  name: string;

  @ApiProperty({ description: '생성일', example: '2021-01-01' })
  created_at: string;

  @ApiProperty({ description: '수정일', example: '2021-01-01' })
  updated_at: string;
}

export class UpdateCategoryResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Category asset updated successfully.',
  })
  message: string;

  @ApiProperty({
    description: '수정된 카테고리 정보',
    type: UpdateCategoryItem,
    example: {
      category_id: 1,
      portfolio_id: 1,
      name: '카테고리 1',
      updated_at: '2021-01-01',
    },
  })
  data: UpdateCategoryItem;
}
