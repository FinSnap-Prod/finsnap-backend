import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AssetType } from '../code/asset-type.entity';
import { MarketRegion } from '../code/market-region.entity';

@Entity('asset')
export class Asset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  asset_type_id: number;

  @ManyToOne(() => AssetType)
  @JoinColumn({ name: 'asset_type_id' })
  asset_type: AssetType;

  @Column({ type: 'int' })
  market_region_id: number;

  @ManyToOne(() => MarketRegion)
  @JoinColumn({ name: 'market_region_id' })
  market_region: MarketRegion;

  @Column({ type: 'int' })
  asset_info_id: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
