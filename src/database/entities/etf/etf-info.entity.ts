import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { CurrencyCode } from '../\bcode/currency-code.entity';

@Entity('etf_info')
@Unique(['ticker'])
export class EtfInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  ticker: string;

  @Column({ type: 'varchar', length: 250 })
  eng_name: string;

  @Column({ type: 'varchar', length: 250 })
  kor_name: string;

  @Column({ type: 'varchar', length: 100 })
  market: string;

  @Column({ type: 'int' })
  currency_code_id: number;

  @ManyToOne(() => CurrencyCode)
  @JoinColumn({ name: 'currency_code_id' })
  currency_code: CurrencyCode;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
