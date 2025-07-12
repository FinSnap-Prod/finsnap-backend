import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('etf_info')
export class EtfInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  ticker: string;

  @Column({ type: 'varchar', length: 250 })
  eng_name: string;

  @Column({ type: 'varchar', length: 250 })
  kor_name: string;

  @Column({ type: 'varchar', length: 100 })
  market: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
