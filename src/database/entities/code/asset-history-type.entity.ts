import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('asset_history_type')
export class AssetHistoryType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  type_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;
}
