import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('currency_code')
export class CurrencyCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  currency_code: string;
}
