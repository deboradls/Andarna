import { BadGatewayException, HttpException, HttpStatus, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type GoogleBook = { googleVolumeId: string; title: string; normalizedTitle: string; authors: string[]; thumbnailUrl: string | null; publishedDate: string | null; description: string | null; pageCount: number | null };

@Injectable()
export class GoogleBooksService {
  constructor(private readonly config: ConfigService) {}
  async search(query: string): Promise<GoogleBook[]> {
    const url = new URL('https://www.googleapis.com/books/v1/volumes');
    url.searchParams.set('q', query); url.searchParams.set('maxResults', '20');
    this.addApiKey(url);
    const body = await this.fetchGoogle(url);
    return (body.items ?? []).map((item: any) => this.mapBook(item)).filter(Boolean);
  }
  async findByVolumeId(volumeId: string): Promise<GoogleBook> {
    const url = new URL(`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(volumeId)}`);
    this.addApiKey(url);
    const book = this.mapBook(await this.fetchGoogle(url));
    if (!book) throw new NotFoundException('Livro não encontrado no Google Books.');
    return book;
  }
  private addApiKey(url: URL) { const key = this.config.get<string>('GOOGLE_BOOKS_API_KEY'); if (key) url.searchParams.set('key', key); }
  private async fetchGoogle(url: URL): Promise<any> {
    let response: Response;
    try {
      response = await fetch(url);
    } catch {
      throw new ServiceUnavailableException('Não foi possível conectar ao Google Books agora.');
    }

    if (response.ok) return response.json();

    const body = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    if (response.status === 429) {
      throw new HttpException('A cota do Google Books foi atingida. Configure GOOGLE_BOOKS_API_KEY com uma chave de um projeto que tenha a Google Books API habilitada.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (response.status === 401 || response.status === 403) {
      throw new BadGatewayException('A chave da Google Books API é inválida, está restrita incorretamente ou a API não está habilitada no projeto.');
    }
    throw new BadGatewayException(body?.error?.message || 'O Google Books não pôde processar a consulta agora.');
  }
  private mapBook(item: any): GoogleBook | null {
    const info = item?.volumeInfo; if (!item?.id || !info?.title) return null;
    const thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;
    return { googleVolumeId: item.id, title: info.title, normalizedTitle: info.title.trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, ' '), authors: info.authors ?? [], thumbnailUrl: thumbnail?.replace(/^http:/, 'https:') ?? null, publishedDate: info.publishedDate ?? null, description: info.description ?? null, pageCount: Number.isInteger(info.pageCount) ? info.pageCount : null };
  }
}
