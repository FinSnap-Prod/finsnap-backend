import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('asset_history_type')
export class AssetHistoryType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  type_name: string; // buy, sell, deposit, withdraw, exchange

  @Column({ type: 'varchar', length: 20 })
  display_name: string; // 매수, 매도, 입금, 출금, 환전

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
