import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('asset_type')
export class AssetType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  type_name: string; // STOCK, ETF, CRYPTO, DEPOSIT, SAVING

  @Column({ type: 'varchar', length: 20 })
  display_name: string; // 주식, ETF, 암호화폐, 예금, 적금

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
