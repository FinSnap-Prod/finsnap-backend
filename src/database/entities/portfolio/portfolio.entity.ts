import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Category } from './category.entity';

@Entity('portfolio')
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Category, (category) => category.portfolio, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  categories: Category[];

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'numeric', precision: 20, scale: 2, default: 0 })
  total_eval_amount: number;

  @Column({ type: 'numeric', precision: 20, scale: 2, default: 0 })
  total_profit_loss: number;

  @Column({ type: 'numeric', precision: 10, scale: 5, default: 0 })
  total_rate: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'int' })
  sort_order: number;
}
