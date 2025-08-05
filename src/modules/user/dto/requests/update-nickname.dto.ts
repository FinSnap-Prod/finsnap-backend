import { ApiProperty, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
export class UpdateNicknameRequestDto {
  @ApiProperty({
    description: '사용자 닉네임',
    example: '승수',
  })
  nickname: string;
}
