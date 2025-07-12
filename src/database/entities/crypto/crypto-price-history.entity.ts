import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CryptoInfo } from './crypto-info.entity';

@Entity('crypto_price_history')
export class CryptoPriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  crypto_info_id: number;

  @ManyToOne(() => CryptoInfo)
  @JoinColumn({ name: 'crypto_info_id' })
  crypto_info: CryptoInfo;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'numeric', precision: 20, scale: 10 })
  open: string;

  @Column({ type: 'numeric', precision: 20, scale: 10 })
  high: string;

  @Column({ type: 'numeric', precision: 20, scale: 10 })
  low: string;

  @Column({ type: 'numeric', precision: 20, scale: 10 })
  close: string;

  @Column({ type: 'numeric', precision: 30, scale: 8 })
  volume: string;
}
