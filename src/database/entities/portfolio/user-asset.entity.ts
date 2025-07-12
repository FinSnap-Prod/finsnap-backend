import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Asset } from '../asset/asset.entity';
import { Institution } from '../code/institution.entity';
import { CurrencyCode } from '../code/currency-code.entity';

@Entity('user_asset')
export class UserAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  category_id: number;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'int' })
  asset_id: number;

  @ManyToOne(() => Asset)
  @JoinColumn({ name: 'asset_id' })
  asset: Asset;

  @Column({ type: 'int' })
  institution_id: number;

  @ManyToOne(() => Institution)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution;

  @Column({ type: 'int' })
  currency_code_id: number;

  @ManyToOne(() => CurrencyCode)
  @JoinColumn({ name: 'curreny_code_id' })
  currency_code: CurrencyCode;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  avg_price: string;

  @Column({ type: 'numeric', precision: 20, scale: 6 })
  quantity: string;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  eval_amount: string;

  @Column({ type: 'numeric', precision: 20, scale: 2 })
  profit_loss: string;

  @Column({ type: 'numeric', precision: 10, scale: 5 })
  profit_rate: string;

  @Column({ type: 'text', nullable: true })
  memo: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;
}
