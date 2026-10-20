import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Shelf } from './entities/shelf.entity';
import { UserBook } from './entities/user-book.entity';
import { UserBookShelf } from './entities/user-book-shelf.entity';
import { GoogleBooksService } from './google-books.service';
import { LibraryController } from './library.controller';
import { LibraryService } from './library.service';
import { ReadingUpdate } from './entities/reading-update.entity';
import { GutendexService } from './gutendex.service';
import { Quotation } from './entities/quotation.entity';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';

@Module({ imports: [TypeOrmModule.forFeature([Book, Shelf, UserBook, UserBookShelf, ReadingUpdate, Quotation])], controllers: [LibraryController, QuotationsController], providers: [LibraryService, GoogleBooksService, GutendexService, QuotationsService] })
export class LibraryModule {}
