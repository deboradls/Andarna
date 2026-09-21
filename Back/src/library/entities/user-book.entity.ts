import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Book } from './book.entity';
import { UserBookShelf } from './user-book-shelf.entity';

export enum ReadingStatus { READ = 'read', READING = 'reading', WANT_TO_READ = 'want_to_read', ABANDONED = 'abandoned' }

@Entity('user_books')
export class UserBook {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_id', type: 'uuid' }) userId: string;
  @Column({ name: 'book_id', type: 'uuid' }) bookId: string;
  @Column({ type: 'enum', enum: ReadingStatus, enumName: 'reading_status' }) status: ReadingStatus;
  @Column({ type: 'smallint', default: 0 }) progress: number;
  @Column({ type: 'smallint', default: 0 }) rating: number;
  @Column({ name: 'reading_mode', type: 'varchar', length: 12, nullable: true }) readingMode: string | null;
  @Column({ name: 'reading_value', type: 'integer', nullable: true }) readingValue: number | null;
  @Column({ name: 'last_read_at', type: 'date', nullable: true }) lastReadAt: string | null;
  @Column({ name: 'reading_note', type: 'text', nullable: true }) readingNote: string | null;
  @ManyToOne(() => User) @JoinColumn({ name: 'user_id' }) user: User;
  @ManyToOne(() => Book) @JoinColumn({ name: 'book_id' }) book: Book;
  @OneToMany(() => UserBookShelf, (link) => link.userBook) shelfLinks: UserBookShelf[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
