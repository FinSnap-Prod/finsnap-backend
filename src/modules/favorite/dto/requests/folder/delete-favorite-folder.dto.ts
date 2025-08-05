import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class DeleteFavoriteFolderParamDto {
  @ApiProperty({
    description: '관심종목 폴더 ID',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  favorite_id: number;
}
