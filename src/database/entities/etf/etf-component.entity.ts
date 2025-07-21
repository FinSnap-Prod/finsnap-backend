import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { EtfInfo } from './etf-info.entity';
import { StockInfo } from '../stock/stock-info.entity';

@Entity('etf_component')
@Unique(['etf_info_id', 'stock_info_id'])
export class EtfComponent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  etf_info_id: number;

  @ManyToOne(() => EtfInfo)
  @JoinColumn({ name: 'etf_info_id' })
  etf_info: EtfInfo;

  @Column({ type: 'int' })
  stock_info_id: number;

  @ManyToOne(() => StockInfo)
  @JoinColumn({ name: 'stock_info_id' })
  stock_info: StockInfo;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  weight_percent: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
