import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column({ type: 'varchar', name: 'password_hash', length: 255, nullable: true, select: false }) passwordHash: string | null;
  @Column({ type: 'varchar', length: 120, nullable: true }) name: string | null;
  @Column({ type: 'varchar', name: 'google_id', length: 255, nullable: true, unique: true }) googleId: string | null;
  @Column({ type: 'varchar', name: 'avatar_url', length: 2048, nullable: true }) avatarUrl: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
