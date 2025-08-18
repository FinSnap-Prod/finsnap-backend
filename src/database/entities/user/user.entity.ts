import { Length } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('user')
@Unique(['nickname'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 50 })
  @Length(5, 20)
  nickname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_image: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ type: 'boolean', default: false, name: 'deleted' })
  deleted: boolean;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true })
  deleted_at: Date | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'delete_reason',
    nullable: true,
  })
  delete_reason: string | null;
}
