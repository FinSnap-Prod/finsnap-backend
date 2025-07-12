import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StockInfo } from './stock-info.entity';

@Entity('stock_price_history')
export class StockPriceHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  stock_info_id: number;

  @ManyToOne(() => StockInfo)
  @JoinColumn({ name: 'stock_info_id' })
  stock_info: StockInfo;

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
