import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('crypto_info')
export class CryptoInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  eng_name: string;

  @Column({ type: 'varchar', length: 50 })
  kor_name: string;

  @Column({ type: 'varchar', length: 20 })
  ticker: string;

  @Column({ type: 'varchar', length: 100 })
  market: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
