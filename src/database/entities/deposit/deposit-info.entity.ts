import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToOne,
} from 'typeorm';
import { DepositType } from './deposit-type.entity';
import { DepositMarketData } from './deposit-market-data.entity';

@Entity('deposit_info')
@Unique(['product_code'])
export class DepositInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => DepositMarketData,
    (depositMarketData) => depositMarketData.deposit_info,
  )
  deposit_market_data: DepositMarketData;

  @Column({ type: 'varchar', length: 100 })
  kor_name: string;

  @Column({ type: 'varchar', length: 150 })
  product_code: string;

  @Column({ type: 'varchar', length: 100 })
  bank_name: string;

  @Column({ type: 'varchar', length: 100 })
  bank_code: string;

  @Column({ type: 'int' })
  deposit_type_id: number;

  @ManyToOne(() => DepositType)
  @JoinColumn({ name: 'deposit_type_id' })
  deposit_type: DepositType;

  @Column({ type: 'varchar', length: 20 })
  report_month: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
