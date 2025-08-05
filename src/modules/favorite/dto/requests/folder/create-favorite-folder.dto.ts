import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateFavoriteFolderDto {
  @ApiProperty({
    description: '관심종목 폴더 이름',
    example: '배당주 투자',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  name: string;
}
