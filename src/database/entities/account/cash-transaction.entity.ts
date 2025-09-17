import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Portfolio } from '../portfolio/portfolio.entity';
import { Institution } from '../code/institution.entity';
import { CurrencyCode } from '../code/currency-code.entity';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@Entity('cash_transaction')
@Index(['portfolio_id', 'institution_id', 'recorded_at'])
@Index(['portfolio_id', 'institution_id', 'type'])
@Index(['exchange_group_id'])
@ApiTags('예수금 내역')
export class CashTransaction {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: '예수금 내역 ID',
    example: 1,
  })
  id: number;

  @Column({ type: 'int' })
  @ApiProperty({
    description: '포트폴리오 ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  portfolio_id: number;

  @ManyToOne(() => Portfolio, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @Column({ type: 'int' })
  @ApiProperty({
    description: '기관 ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  institution_id: number;

  @ManyToOne(() => Institution, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ type: 'varchar', length: 20 })
  @ApiProperty({
    description: '거래 유형',
    example: '매수',
  })
  @IsString()
  type: string;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  @ApiProperty({
    description: '거래 금액',
    example: 100000,
  })
  @Min(0)
  amount: string;

  @Column({ type: 'int' })
  @ApiProperty({
    description: '통화 코드 ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
  currency_code_id: number;

  @ManyToOne(() => CurrencyCode, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'currency_code_id' })
  currency_code: CurrencyCode;

  @Column({ type: 'numeric', precision: 20, scale: 6, nullable: true })
  @ApiProperty({
    description: '환율',
    example: 1.1,
  })
  @IsNumber()
  rate: number;

  @Column({ type: 'timestamptz' })
  @ApiProperty({
    description: '거래 일시',
    example: '2021-01-01T00:00:00Z',
  })
  @IsDate()
  recorded_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({
    description: '메모',
    example: '거래 메모',
  })
  @IsString()
  @IsOptional()
  memo?: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  @ApiProperty({
    description: '거래 그룹 ID',
    example: '1',
  })
  @IsString()
  @IsOptional()
  exchange_group_id?: string;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({
    description: '자산 내역 ID',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  asset_history_id?: number;

  @Column({ type: 'int', nullable: true })
  @ApiProperty({
    description: '사용자 자산 ID',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  user_asset_id?: number;

  @CreateDateColumn({ name: 'created_at' })
  @ApiProperty({
    description: '생성 일시',
    example: '2021-01-01T00:00:00Z',
  })
  @IsDate()
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  @ApiProperty({
    description: '수정 일시',
    example: '2021-01-01T00:00:00Z',
  })
  @IsDate()
  updated_at: Date;
}
