import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DepositType } from '../code/deposit-type.entity';

@Entity('deposit_info')
export class DepositInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  product_code: string;

  @Column({ type: 'varchar', length: 100 })
  bank_name: string;

  @Column({ type: 'varchar', length: 100 })
  bank_code: string;

  @Column({ type: 'int' })
  deposit_type_id: number;

  @ManyToOne(() => DepositType)
  @JoinColumn({ name: 'deposit_type_id' })
  deposit_type: DepositType;

  @Column({ type: 'varchar', length: 20 })
  report_month: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
