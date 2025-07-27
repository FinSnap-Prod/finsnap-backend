import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { DepositInfo } from './deposit-info.entity';
import { InterestType } from '../code/interest-type.entity';

@Entity('deposit_market_data')
@Unique(['deposit_info_id', 'period'])
export class DepositMarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  deposit_info_id: number;

  @ManyToOne(() => DepositInfo)
  @JoinColumn({ name: 'deposit_info_id' })
  deposit_info: DepositInfo;

  @Column({ type: 'int' })
  interest_type_id: number;

  @ManyToOne(() => InterestType)
  @JoinColumn({ name: 'interest_type_id' })
  interest_type: InterestType;

  @Column({ type: 'varchar', length: 10 })
  period: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  interest_rate: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  max_prefer_rate: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
