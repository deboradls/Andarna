import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quotation } from './entities/quotation.entity';
import { UserBook } from './entities/user-book.entity';
import { SaveQuotationDto } from './dto/quotation.dto';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectRepository(Quotation) private readonly quotations: Repository<Quotation>,
    @InjectRepository(UserBook) private readonly userBooks: Repository<UserBook>,
  ) {}

  list(userId: string) {
    return this.quotations.find({
      where: { userBook: { userId } },
      relations: { userBook: { book: true } },
      order: { createdAt: 'DESC', id: 'DESC' },
    });
  }

  async create(userId: string, dto: SaveQuotationDto) {
    const values = await this.validateBook(userId, dto);
    const quote = await this.quotations.save(this.quotations.create(values));
    return this.findOwned(userId, quote.id);
  }

  async update(userId: string, id: string, dto: SaveQuotationDto) {
    const quote = await this.findOwned(userId, id);
    Object.assign(quote, await this.validateBook(userId, dto));
    // The relation must match the new book when a quote is reassigned.
    delete (quote as Partial<Quotation>).userBook;
    await this.quotations.save(quote);
    return this.findOwned(userId, id);
  }

  async remove(userId: string, id: string) {
    const quote = await this.findOwned(userId, id);
    await this.quotations.remove(quote);
    return { success: true };
  }

  private async findOwned(userId: string, id: string) {
    const quote = await this.quotations.findOne({ where: { id, userBook: { userId } }, relations: { userBook: { book: true } } });
    if (!quote) throw new NotFoundException('Citação não encontrada.');
    return quote;
  }

  private async validateBook(userId: string, dto: SaveQuotationDto) {
    const text = dto.text.trim();
    if (!text) throw new BadRequestException('Escreva o texto da citação.');
    const item = await this.userBooks.findOne({ where: { id: dto.userBookId, userId }, relations: { book: true } });
    if (!item) throw new NotFoundException('Escolha um livro da sua biblioteca.');
    const page = dto.page ?? null;
    if (page && item.book.pageCount && page > item.book.pageCount) throw new BadRequestException('A página não pode ultrapassar o total de páginas do livro.');
    return { userBookId: item.id, text, page };
  }
}
