import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('currency_code')
export class CurrencyCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  currency_code: string; // USD, KRW, JPY, EUR, GBP, etc.

  @Column({ type: 'varchar', length: 10 })
  display_name: string; // 달러, 원, 엔, 유로, 파운드, etc.

  @Column({ type: 'varchar', length: 10, nullable: true })
  symbol: string; // 통화 기호 ($, ¥, € 등)

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
