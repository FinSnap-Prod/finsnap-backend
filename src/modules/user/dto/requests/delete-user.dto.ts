import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class DeleteUserRequestDto {
  @ApiProperty({
    description: '탈퇴 사유',
    example: '자주 이용하지 않아요.',
  })
  @IsString({ message: '탈퇴 사유는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '탈퇴 사유는 필수 입력값입니다.' })
  @MaxLength(100, { message: '탈퇴 사유는 최대 100자까지 가능합니다.' })
  delete_reason: string;
}
