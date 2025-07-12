import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('interest_type')
export class InterestType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  type_name: string;
}
