import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Shelf } from './entities/shelf.entity';
import { UserBook } from './entities/user-book.entity';
import { UserBookShelf } from './entities/user-book-shelf.entity';
import { GoogleBooksService } from './google-books.service';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';

@Module({ imports: [TypeOrmModule.forFeature([Book, Shelf, UserBook, UserBookShelf])], controllers: [LibraryController], providers: [LibraryService, GoogleBooksService] })
export class LibraryModule {}
