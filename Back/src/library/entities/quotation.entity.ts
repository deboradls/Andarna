import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserBook } from './user-book.entity';

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'user_book_id', type: 'uuid' }) userBookId: string;
  @ManyToOne(() => UserBook, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_book_id' }) userBook: UserBook;
  @Column({ type: 'text' }) text: string;
  @Column({ type: 'integer', nullable: true }) page: number | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
