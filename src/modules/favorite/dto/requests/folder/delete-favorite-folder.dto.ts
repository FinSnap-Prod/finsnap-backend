import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsPositive } from 'class-validator';

export class DeleteFavoriteFolderParamDto {
  @ApiProperty({
    description: '관심종목 폴더 ID',
    example: 1,
  })
  @IsNumberString()
  @IsPositive()
  favorite_id: string;
}
