import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Portfolio } from './portfolio.entity';
import { UserAsset } from './user-asset.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  portfolio_id: number;

  @ManyToOne(() => Portfolio, (portfolio) => portfolio.categories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Portfolio;

  @OneToMany(() => UserAsset, (asset) => asset.category, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  assets: UserAsset[];

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'int' })
  sort_order: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
