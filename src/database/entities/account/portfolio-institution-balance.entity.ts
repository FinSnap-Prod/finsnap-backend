import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Portfolio } from '../portfolio/portfolio.entity';
import { Institution } from '../code/institution.entity';
import { CurrencyCode } from '../code/currency-code.entity';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsDate, IsInt, IsNumber, Min } from 'class-validator';

@Entity('portfolio_institution_balance')
@Unique(['portfolio_id', 'institution_id', 'currency_code_id'])
@Index(['portfolio_id', 'institution_id'])
@Index(['portfolio_id', 'currency_code_id'])
@ApiTags('포트폴리오 기관 잔액')
export class PortfolioInstitutionBalance {
  @PrimaryGeneratedColumn()
  @ApiProperty({
    description: '포트폴리오 기관 잔액 ID',
    example: 1,
  })
  @IsInt()
  @Min(1)
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

  @Column({
    type: 'numeric',
    precision: 20,
    scale: 2,
    default: '0',
  })
  @ApiProperty({
    description: '잔액',
    example: '100000',
  })
  @Min(0)
  balance: string;

  @Column({ type: 'numeric', precision: 20, scale: 6, nullable: true })
  @ApiProperty({
    description: '평균 매입 환율',
    example: 1.1,
  })
  @IsNumber()
  avg_rate: string;

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
