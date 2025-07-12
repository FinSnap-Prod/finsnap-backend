import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EtfInfo } from './etf-info.entity';

@Entity('etf_market_data')
export class EtfMarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  etf_info_id: number;

  @ManyToOne(() => EtfInfo)
  @JoinColumn({ name: 'etf_info_id' })
  etf_info: EtfInfo;

  @Column({ type: 'numeric', precision: 20, scale: 5 })
  price: string;

  @Column({ type: 'numeric', precision: 20, scale: 5 })
  change_price: string;

  @Column({ type: 'numeric', precision: 20, scale: 5 })
  change_rate: string;

  @Column({ type: 'bigint' })
  market_cap: string;

  @Column({ type: 'boolean' })
  trht_yn: boolean;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
