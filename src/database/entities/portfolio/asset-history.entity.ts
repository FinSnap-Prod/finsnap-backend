import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UserAsset } from './user-asset.entity';
import { AssetHistoryType } from '../code/asset-history-type.entity';

@Entity('asset_history')
export class AssetHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  user_asset_id: number;

  @ManyToOne(() => UserAsset)
  @JoinColumn({ name: 'user_asset_id' })
  user_asset: UserAsset;

  @Column({ type: 'timestamp' })
  recorded_at: Date;

  @Column({ type: 'int' })
  asset_history_type_id: number;

  @ManyToOne(() => AssetHistoryType)
  @JoinColumn({ name: 'asset_history_type_id' })
  asset_history_type: AssetHistoryType;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  price: string;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  quantity: string;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  total_amount: string;

  @Column({ type: 'text', nullable: true })
  memo: string;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;
}
