import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Book } from '../library/entities/book.entity';
import { Shelf } from '../library/entities/shelf.entity';
import { UserBook } from '../library/entities/user-book.entity';
import { UserBookShelf } from '../library/entities/user-book-shelf.entity';
import { ReadingUpdate } from '../library/entities/reading-update.entity';
import { Quotation } from '../library/entities/quotation.entity';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Book, Shelf, UserBook, UserBookShelf, ReadingUpdate, Quotation],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
