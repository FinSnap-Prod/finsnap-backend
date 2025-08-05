import { ApiProperty } from '@nestjs/swagger';

export class CreatedCategoryItem {
  @ApiProperty({ description: '카테고리 ID', example: 1 })
  category_id: number;

  @ApiProperty({ description: '포트폴리오 ID', example: 1 })
  portfolio_id: number;

  @ApiProperty({ description: '카테고리 이름', example: '카테고리 1' })
  category_name: string;

  @ApiProperty({ description: '생성일', example: '2021-01-01' })
  created_at: string;

  @ApiProperty({ description: '수정일', example: '2021-01-01' })
  updated_at: string;
}

export class CreateCategoryResponseDto {
  @ApiProperty({ description: '응답 성공 여부', example: true })
  success: boolean;

  @ApiProperty({
    description: '응답 메시지',
    example: 'Category created successfully.',
  })
  message: string;

  @ApiProperty({
    description: '생성된 카테고리 정보',
    type: CreatedCategoryItem,
    example: {
      category_id: 1,
      portfolio_id: 1,
      category_name: '카테고리 1',
      created_at: '2021-01-01',
      updated_at: '2021-01-01',
    },
  })
  data: CreatedCategoryItem;
}
