import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Favorite } from './favorite.entity';

@Entity('favorite_asset')
export class FavoriteAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  favorite_id: number;

  @ManyToOne(() => Favorite)
  @JoinColumn({ name: 'favorite_id' })
  favorite: Favorite;

  @Column({ type: 'varchar', length: 20 })
  asset_type: string;

  @Column({ type: 'int' })
  info_id: number;

  @Column({ type: 'int' })
  sort_order: number;
}
