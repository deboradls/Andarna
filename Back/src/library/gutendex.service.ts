import { Injectable, ServiceUnavailableException } from '@nestjs/common';

type GutenbergBook = {
  id: number;
  title: string;
  authors: { name: string }[];
  formats: Record<string, string>;
};
type Quote = { id: string; text: string; author: string; title: string; sourceUrl: string };

@Injectable()
export class GutendexService {
  private catalog: GutenbergBook[] = [];
  private catalogExpires = 0;
  private excerpts = new Map<number, Quote[]>();

  async randomQuote(previous?: string): Promise<Quote> {
    try {
      if (Date.now() > this.catalogExpires) {
        try {
        const response = await fetch('https://gutendex.com/books/?languages=pt&copyright=false&mime_type=text%2Fplain', { signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error('Gutendex unavailable');
        const data = await response.json() as { results: GutenbergBook[] };
        this.catalog = data.results.filter((book) => Object.keys(book.formats).some((type) => type.startsWith('text/plain')));
        this.catalogExpires = Date.now() + 60 * 60 * 1000;
        } catch {
          // Keep real excerpts available when the metadata API times out.
          if (!this.catalog.length) this.catalog = [{
            id: 55752, title: 'Dom Casmurro', authors: [{ name: 'Machado de Assis' }],
            formats: { 'text/plain; charset=utf-8': 'https://www.gutenberg.org/ebooks/55752.txt.utf-8' },
          }];
          this.catalogExpires = Date.now() + 5 * 60 * 1000;
        }
      }
      const candidates = [...this.catalog];
      for (let attempt = 0; candidates.length && attempt < 4; attempt++) {
        const [book] = candidates.splice(Math.floor(Math.random() * candidates.length), 1);
        try {
          let quotes = this.excerpts.get(book.id);
          if (!quotes) {
            const source = Object.entries(book.formats).find(([type]) => type.startsWith('text/plain; charset=utf-8'))
              || Object.entries(book.formats).find(([type]) => type.startsWith('text/plain'));
            if (!source) continue;
            const url = new URL(source[1]);
            if (url.hostname !== 'gutenberg.org' && !url.hostname.endsWith('.gutenberg.org')) continue;
            url.protocol = 'https:';
            const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
            if (!response.ok) continue;
            const bytes = await response.arrayBuffer();
            const charset = source[0].match(/charset=([^;\s]+)/i)?.[1] || 'utf-8';
            const text = new TextDecoder(charset).decode(bytes);
            quotes = this.extractQuotes(text, book);
            if (this.excerpts.size >= 20) this.excerpts.delete(this.excerpts.keys().next().value!);
            this.excerpts.set(book.id, quotes);
          }
          const available = quotes.filter((quote) => quote.id !== previous);
          if (available.length) return available[Math.floor(Math.random() * available.length)];
        } catch { /* Try another book if its text is unavailable. */ }
      }
    } catch { /* Present a useful error when the external service is unavailable. */ }
    throw new ServiceUnavailableException('Não foi possível carregar uma frase agora. Tente novamente em instantes.');
  }

  private extractQuotes(text: string, book: GutenbergBook): Quote[] {
    const start = text.search(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG/i);
    const body = start >= 0 ? text.slice(text.indexOf('\n', start) + 1) : text;
    const end = body.search(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG/i);
    const content = end >= 0 ? body.slice(0, end) : body;
    const segmenter = new Intl.Segmenter('pt', { granularity: 'sentence' });
    const seen = new Set<string>();
    const quotes: Quote[] = [];
    for (const paragraph of content.split(/\r?\n\s*\r?\n/)) {
      const normalized = paragraph.replace(/\s+/g, ' ').trim();
      if (normalized.length < 60 || /gutenberg|https?:|www\.|copyright|ebook|transcrib|licen[cs]|produced by/i.test(normalized)) continue;
      for (const { segment } of segmenter.segment(normalized)) {
        const sentence = segment.trim();
        if (sentence.length < 60 || sentence.length > 240 || !/^[\p{Lu}“«]/u.test(sentence) || !/[.!?][”»]?$/u.test(sentence) || /[_*\[\]@\d]/.test(sentence) || seen.has(sentence)) continue;
        if ((sentence.match(/\p{L}/gu)?.length || 0) / sentence.length < 0.65) continue;
        seen.add(sentence);
        quotes.push({ id: `${book.id}:${quotes.length}`, text: sentence, author: book.authors.map((author) => author.name).join('; ') || 'Autor não informado', title: book.title, sourceUrl: `https://www.gutenberg.org/ebooks/${book.id}` });
      }
    }
    return quotes;
  }
}
