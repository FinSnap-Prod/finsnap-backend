import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { EtfInfo } from './etf-info.entity';

@Entity('etf_price_history')
@Unique(['etf_info_id', 'date'])
export class EtfPriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  etf_info_id: number;

  @ManyToOne(() => EtfInfo)
  @JoinColumn({ name: 'etf_info_id' })
  etf_info: EtfInfo;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'numeric', precision: 20, scale: 5 })
  open: string;

  @Column({ type: 'numeric', precision: 20, scale: 5 })
  high: string;

  @Column({ type: 'numeric', precision: 20, scale: 5 })
  low: string;

  @Column({ type: 'numeric', precision: 20, scale: 5 })
  close: string;

  @Column({ type: 'bigint' })
  volume: string;
}
