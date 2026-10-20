import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserBook } from './user-book.entity';

@Entity('reading_updates')
export class ReadingUpdate {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_book_id', type: 'uuid' }) userBookId: string;
  @ManyToOne(() => UserBook, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_book_id' }) userBook: UserBook;
  @Column({ type: 'varchar', length: 12 }) mode: string;
  @Column({ type: 'integer' }) value: number;
  @Column({ type: 'smallint' }) progress: number;
  @Column({ name: 'read_date', type: 'date' }) readDate: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
