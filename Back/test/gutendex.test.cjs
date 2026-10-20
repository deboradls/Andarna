const { test } = require('node:test');
const assert = require('node:assert/strict');
const { GutendexService } = require('../dist/library/gutendex.service');

test('usa textos reais, atribui a fonte e exclui a frase anterior', async (context) => {
  const text = `Project Gutenberg header
*** START OF THE PROJECT GUTENBERG EBOOK ***

A leitura abre caminhos para que possamos descobrir novos mundos e reconhecer a beleza das pequenas coisas.

Cada página guarda uma história que pode transformar para sempre a maneira como olhamos a vida ao nosso redor.

*** END OF THE PROJECT GUTENBERG EBOOK ***
License footer`;
  let requests = 0;
  context.mock.method(global, 'fetch', async (url) => {
    requests++;
    if (String(url).startsWith('https://gutendex.com/')) {
      assert.equal(new URL(url).searchParams.get('languages'), 'pt');
      return { ok: true, json: async () => ({ results: [{ id: 1, title: 'Livro de teste', authors: [{ name: 'Autor de teste' }], formats: { 'text/plain; charset=utf-8': 'https://www.gutenberg.org/ebooks/1.txt.utf-8' } }] }) };
    }
    return { ok: true, arrayBuffer: async () => new TextEncoder().encode(text).buffer };
  });
  const service = new GutendexService();
  const first = await service.randomQuote();
  const second = await service.randomQuote(first.id);
  assert.notEqual(first.id, second.id);
  assert.notEqual(first.text, second.text);
  assert.ok(text.includes(first.text));
  assert.equal(first.author, 'Autor de teste');
  assert.equal(first.sourceUrl, 'https://www.gutenberg.org/ebooks/1');
  assert.equal(requests, 2, 'catálogo e texto devem ser reutilizados do cache');
});

test('retorna erro compreensível quando o Gutendex falha', async (context) => {
  context.mock.method(global, 'fetch', async () => { throw new Error('offline'); });
  await assert.rejects(new GutendexService().randomQuote(), (error) => error.getStatus() === 503);
});

test('não busca textos em hosts fora do Project Gutenberg', async (context) => {
  let requests = 0;
  context.mock.method(global, 'fetch', async () => {
    requests++;
    return { ok: true, json: async () => ({ results: [{ id: 1, formats: { 'text/plain': 'https://example.com/text' } }] }) };
  });
  await assert.rejects(new GutendexService().randomQuote());
  assert.equal(requests, 1);
});

test('usa texto do Gutenberg quando o catálogo está indisponível', async (context) => {
  context.mock.method(global, 'fetch', async (url) => {
    if (String(url).startsWith('https://gutendex.com/')) throw new Error('timeout');
    assert.equal(String(url), 'https://www.gutenberg.org/ebooks/55752.txt.utf-8');
    const text = 'Uma frase de teste suficientemente longa para verificar o tratamento da indisponibilidade do catálogo.';
    return { ok: true, arrayBuffer: async () => new TextEncoder().encode(text).buffer };
  });
  const quote = await new GutendexService().randomQuote();
  assert.equal(quote.title, 'Dom Casmurro');
  assert.equal(quote.author, 'Machado de Assis');
});
