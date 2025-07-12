import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('institution')
export class Institution {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
