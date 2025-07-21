import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { StockInfo } from './stock-info.entity';

@Entity('stock_market_data')
@Unique(['stock_info_id'])
export class StockMarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  stock_info_id: number;

  @ManyToOne(() => StockInfo)
  @JoinColumn({ name: 'stock_info_id' })
  stock_info: StockInfo;

  @Column({ type: 'numeric', precision: 20, scale: 5 })
  price: string;

  @Column({ type: 'numeric', precision: 20, scale: 5 })
  change_price: string;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  change_rate: string;

  @Column({ type: 'bigint' })
  market_cap: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  per: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  pbr: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  roa: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  roe: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  eps: string;

  @Column({ type: 'numeric', precision: 8, scale: 2 })
  bps: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
