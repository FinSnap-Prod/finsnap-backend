import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

@ApiTags('user')
export class UpdateNicknameRequestDto {
  @ApiProperty({
    description: '사용자 닉네임',
    example: '승수',
  })
  @IsString({ message: '닉네임은 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '닉네임은 필수 입력값입니다.' })
  @MinLength(5, { message: '닉네임은 최소 5자 이상이어야 합니다.' })
  @MaxLength(20, { message: '닉네임은 최대 20자까지 가능합니다.' })
  @Matches(/^[가-힣a-zA-Z0-9\s]+$/, {
    message: '닉네임은 한글, 영문, 숫자, 공백만 사용 가능합니다.',
  })
  nickname: string;
}
