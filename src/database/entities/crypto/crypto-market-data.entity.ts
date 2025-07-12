import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CryptoInfo } from './crypto-info.entity';

@Entity('crypto_market_data')
export class CryptoMarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  crypto_info_id: number;

  @ManyToOne(() => CryptoInfo)
  @JoinColumn({ name: 'crypto_info_id' })
  crypto_info: CryptoInfo;

  @Column({ type: 'numeric', precision: 30, scale: 12 })
  price: string;

  @Column({ type: 'numeric', precision: 18, scale: 12 })
  change_price: string;

  @Column({ type: 'numeric', precision: 10, scale: 8 })
  change_rate: string;

  @Column({ type: 'numeric', precision: 30, scale: 8 })
  acc_trade_volume: string;

  @Column({ type: 'numeric', precision: 30, scale: 8 })
  acc_trade_price: string;

  @Column({ type: 'bigint' })
  market_cap: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
