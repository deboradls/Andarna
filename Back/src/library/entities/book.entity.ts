import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('books')
export class Book {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', name: 'google_volume_id', unique: true, nullable: true }) googleVolumeId: string | null;
  @Column() title: string;
  @Column({ name: 'normalized_title', unique: true }) normalizedTitle: string;
  @Column({ type: 'jsonb', default: () => "'[]'" }) authors: string[];
  @Column({ type: 'varchar', name: 'thumbnail_url', nullable: true }) thumbnailUrl: string | null;
  @Column({ type: 'varchar', name: 'published_date', nullable: true }) publishedDate: string | null;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'page_count', type: 'integer', nullable: true }) pageCount: number | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
