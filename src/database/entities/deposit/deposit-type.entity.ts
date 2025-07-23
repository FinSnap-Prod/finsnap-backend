import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('deposit_type')
export class DepositType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  type_name: string; // '예금' | '적금'

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
