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
import { CryptoMarket } from './crypto-market.entity';
import { CryptoMarketData } from './crypto-market-data.entity';

@Entity('crypto_info')
@Unique(['ticker'])
export class CryptoInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(
    () => CryptoMarketData,
    (cryptoMarketData) => cryptoMarketData.crypto_info,
  )
  crypto_market_data: CryptoMarketData;

  @Column({ type: 'varchar', length: 150 })
  eng_name: string;

  @Column({ type: 'varchar', length: 50 })
  kor_name: string;

  @Column({ type: 'varchar', length: 20 })
  ticker: string;

  @Column({ type: 'int' })
  crypto_market_id: number;

  @ManyToOne(() => CryptoMarket)
  @JoinColumn({ name: 'crypto_market_id' })
  crypto_market: CryptoMarket;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
