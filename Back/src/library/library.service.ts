import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AddBookDto, CreateShelfDto, LibraryQueryDto, UpdateBookDetailsDto } from './dto/library.dto';
import { Book } from './entities/book.entity';
import { Shelf } from './entities/shelf.entity';
import { ReadingStatus, UserBook } from './entities/user-book.entity';
import { UserBookShelf } from './entities/user-book-shelf.entity';
import { GoogleBooksService } from './google-books.service';

@Injectable()
export class LibraryService {
  constructor(
    @InjectRepository(Book) private readonly books: Repository<Book>,
    @InjectRepository(Shelf) private readonly shelves: Repository<Shelf>,
    @InjectRepository(UserBook) private readonly userBooks: Repository<UserBook>,
    @InjectRepository(UserBookShelf) private readonly links: Repository<UserBookShelf>,
    private readonly googleBooks: GoogleBooksService,
  ) {}

  search(query: string) { return this.googleBooks.search(query.trim()); }
  async getShelves(userId: string) { return this.shelves.find({ where: { userId }, order: { name: 'ASC' } }); }
  async createShelf(userId: string, dto: CreateShelfDto) {
    const name = dto.name.trim(); if (!name) throw new BadRequestException('Informe o nome da estante.');
    try { return await this.shelves.save(this.shelves.create({ userId, name, description: dto.description?.trim() || null })); }
    catch { throw new ConflictException('Você já possui uma estante com este nome.'); }
  }
  async addBook(userId: string, dto: AddBookDto) {
    if (!dto.shelfIds.length) throw new BadRequestException('Escolha pelo menos uma estante.');
    const googleBook = await this.googleBooks.findByVolumeId(dto.googleVolumeId);
    let book = await this.books.findOneBy({ normalizedTitle: googleBook.normalizedTitle });
    if (!book) book = await this.books.save(this.books.create(googleBook));
    const shelves = await this.shelves.findBy({ id: In(dto.shelfIds), userId });
    if (shelves.length !== dto.shelfIds.length) throw new BadRequestException('Uma ou mais estantes não pertencem a este usuário.');
    let userBook = await this.userBooks.findOneBy({ userId, bookId: book.id });
    if (!userBook) userBook = this.userBooks.create({ userId, bookId: book.id, status: dto.status });
    else userBook.status = dto.status;
    userBook = await this.userBooks.save(userBook);
    // A relação é cumulativa: adicionar o mesmo título a outra estante não
    // remove as estantes já vinculadas. O status, por outro lado, é único.
    await this.links.save(shelves.map((shelf) => this.links.create({ userBookId: userBook.id, shelfId: shelf.id })));
    return this.getLibraryItem(userBook.id, userId);
  }
  async getLibrary(userId: string, query: LibraryQueryDto) {
    const builder = this.baseQuery(userId);
    if (query.status) builder.andWhere('userBook.status = :status', { status: query.status });
    if (query.shelfId) builder.andWhere('shelf.id = :shelfId', { shelfId: query.shelfId });
    return builder.orderBy('userBook.updatedAt', 'DESC').getMany();
  }
  async updateStatus(userId: string, id: string, status: ReadingStatus) {
    const userBook = await this.userBooks.findOneBy({ id, userId });
    if (!userBook) throw new NotFoundException('Livro não encontrado na sua biblioteca.');
    userBook.status = status; await this.userBooks.save(userBook);
    return this.getLibraryItem(id, userId);
  }
  async updateDetails(userId: string, id: string, dto: UpdateBookDetailsDto) {
    const userBook = await this.userBooks.findOne({ where: { id, userId }, relations: { book: true } });
    if (!userBook) throw new NotFoundException('Livro não encontrado na sua biblioteca.');
    if (dto.progress !== undefined) userBook.progress = dto.progress;
    if (dto.rating !== undefined) userBook.rating = dto.rating;
    if (dto.readingMode !== undefined || dto.readingValue !== undefined) {
      if (!dto.readingMode || dto.readingValue === undefined) throw new BadRequestException('Informe o modo e o progresso da leitura.');
      const pageCount = userBook.book.pageCount;
      if (dto.readingMode === 'pages' && !pageCount) throw new BadRequestException('Este livro não possui quantidade de páginas informada pelo Google Books.');
      const total = dto.readingMode === 'percentage' ? 100 : pageCount ?? 100;
      const progress = Math.min(100, Math.round((dto.readingValue / total) * 100));
      userBook.progress = progress; userBook.readingMode = dto.readingMode; userBook.readingValue = dto.readingValue;
      if (progress === 100) { userBook.status = ReadingStatus.READ; if (!dto.rating || dto.rating < 1) throw new BadRequestException('Ao concluir o livro, informe uma avaliação de 1 a 5 estrelas.'); }
    }
    if (dto.readDate !== undefined) userBook.lastReadAt = dto.readDate;
    if (dto.readingNote !== undefined) userBook.readingNote = dto.readingNote.trim() || null;
    await this.userBooks.save(userBook);
    return this.getLibraryItem(id, userId);
  }
  async addToShelf(userId: string, id: string, shelfId: string) {
    const userBook = await this.userBooks.findOneBy({ id, userId });
    if (!userBook) throw new NotFoundException('Livro não encontrado na sua biblioteca.');
    const shelf = await this.shelves.findOneBy({ id: shelfId, userId });
    if (!shelf) throw new NotFoundException('Estante não encontrada.');
    const link = await this.links.findOneBy({ userBookId: id, shelfId });
    if (!link) await this.links.save(this.links.create({ userBookId: id, shelfId }));
    return this.getLibraryItem(id, userId);
  }
  async removeFromShelf(userId: string, id: string, shelfId: string) {
    const userBook = await this.userBooks.findOneBy({ id, userId });
    if (!userBook) throw new NotFoundException('Livro não encontrado na sua biblioteca.');
    const link = await this.links.createQueryBuilder('link').innerJoin('link.shelf', 'shelf').where('link.userBookId = :id AND link.shelfId = :shelfId AND shelf.userId = :userId', { id, shelfId, userId }).getOne();
    if (!link) throw new NotFoundException('Livro não pertence a esta estante.');
    await this.links.remove(link);
    return { success: true };
  }
  private getLibraryItem(id: string, userId: string) { return this.baseQuery(userId).andWhere('userBook.id = :id', { id }).getOneOrFail(); }
  private baseQuery(userId: string) { return this.userBooks.createQueryBuilder('userBook').leftJoinAndSelect('userBook.book', 'book').leftJoinAndSelect('userBook.shelfLinks', 'link').leftJoinAndSelect('link.shelf', 'shelf').where('userBook.userId = :userId', { userId }); }
}
