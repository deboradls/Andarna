import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shelves')
@Index(['userId', 'name'], { unique: true })
export class Shelf {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @Column({ length: 80 }) name: string;
  @Column({ type: 'varchar', length: 280, nullable: true }) description: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
