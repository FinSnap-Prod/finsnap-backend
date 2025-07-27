import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('crypto_market')
export class CryptoMarket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  market_name: string; // 'Bithumb' | 'Binance'

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
