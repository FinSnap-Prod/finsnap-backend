import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('market_region')
export class MarketRegion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  type: string;
}
