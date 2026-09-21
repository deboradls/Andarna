import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Shelf } from './shelf.entity';
import { UserBook } from './user-book.entity';

@Entity('user_book_shelves')
export class UserBookShelf {
  @PrimaryColumn({ name: 'user_book_id', type: 'uuid' }) userBookId: string;
  @PrimaryColumn({ name: 'shelf_id', type: 'uuid' }) shelfId: string;
  @ManyToOne(() => UserBook, (userBook) => userBook.shelfLinks, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'user_book_id' }) userBook: UserBook;
  @ManyToOne(() => Shelf, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'shelf_id' }) shelf: Shelf;
}
