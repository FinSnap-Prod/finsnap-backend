// 단건 삭제: /.../cash/transactions/:id
// 환전 그룹 삭제: /.../cash/transactions?exchange_group_id=EX-...

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class DeleteCashTransactionParamDto {
  @ApiProperty({
    description: '포트폴리오 ID',
    example: 1,
  })
  @IsInt()
  portfolio_id: number;

  @ApiProperty({
    description: '기관 ID',
    example: 1,
  })
  @IsInt()
  institution_id: number;

  // 단건 삭제 시에만 사용 (경로가 :id 일 때)
  @ApiProperty({
    description: '현금 거래 ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  id?: number;
}

export class DeleteCashTransactionQueryDto {
  // 환전 그룹 삭제 시에만 사용 (쿼리로 전달)
  @ApiProperty({
    description: '환전 그룹 ID',
    example: 'EX-123',
  })
  @IsOptional()
  @IsString()
  exchange_group_id?: string;
}

// 주의: 위 두 DTO는 컨트롤러에서 "id XOR exchange_group_id" 규칙을 검사해야 합니다.
// (둘 다 제공/둘 다 미제공은 400)
