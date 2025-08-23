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
import { CurrencyCode } from '../code/currency-code.entity';
import { StockMarketData } from './stock-market-data.entity';

@Entity('stock_info')
@Unique(['ticker'])
export class StockInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => StockMarketData,
    (stockMarketData) => stockMarketData.stock_info,
  )
  stock_market_data: StockMarketData;

  @Column({ type: 'varchar', length: 50 })
  ticker: string;

  @Column({ type: 'varchar', length: 150 })
  eng_name: string;

  @Column({ type: 'varchar', length: 150 })
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
