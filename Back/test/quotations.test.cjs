const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validate } = require('class-validator');
const { QuotationsService } = require('../dist/library/quotations.service');
const { SaveQuotationDto } = require('../dist/library/dto/quotation.dto');

function setup() {
  const entries = [];
  const calls = [];
  const books = [{ id: 'one', userId: 'owner', book: { title: 'Primeiro', pageCount: 200 } }, { id: 'two', userId: 'owner', book: { title: 'Segundo', pageCount: 300 } }];
  const repository = {
    create: (value) => ({ ...value }),
    save: async (value) => {
      const index = entries.findIndex((entry) => entry.id === value.id);
      const saved = { ...value, id: value.id || 'quote' };
      if (index < 0) entries.push(saved); else entries[index] = saved;
      return saved;
    },
    findOne: async (query) => {
      calls.push(query);
      const entry = entries.find((item) => item.id === query.where.id);
      const book = entry && books.find((item) => item.id === entry.userBookId && item.userId === query.where.userBook.userId);
      return book ? { ...entry, userBook: book } : null;
    },
    find: async (query) => { calls.push(query); return []; },
    remove: async (quote) => { entries.splice(entries.findIndex((entry) => entry.id === quote.id), 1); },
  };
  const userBooks = { findOne: async ({ where }) => books.find((item) => item.id === where.id && item.userId === where.userId) || null };
  return { service: new QuotationsService(repository, userBooks), entries, calls, books };
}

test('cria citação com livro próprio, texto normalizado e página', async () => {
  const { service } = setup();
  const quote = await service.create('owner', { userBookId: 'one', text: '  Um trecho.  ', page: 42 });
  assert.equal(quote.text, 'Um trecho.');
  assert.equal(quote.page, 42);
  assert.equal(quote.userBook.book.title, 'Primeiro');
});

test('edita texto, troca livro e permite limpar a página', async () => {
  const { service } = setup();
  const quote = await service.create('owner', { userBookId: 'one', text: 'Antes', page: 42 });
  const updated = await service.update('owner', quote.id, { userBookId: 'two', text: 'Depois', page: null });
  assert.equal(updated.userBookId, 'two');
  assert.equal(updated.userBook.book.title, 'Segundo');
  assert.equal(updated.text, 'Depois');
  assert.equal(updated.page, null);
});

test('exclui apenas a citação e preserva o livro', async () => {
  const { service, entries, books } = setup();
  const quote = await service.create('owner', { userBookId: 'one', text: 'Trecho' });
  assert.deepEqual(await service.remove('owner', quote.id), { success: true });
  assert.equal(entries.length, 0);
  assert.equal(books.length, 2);
});

test('bloqueia criar, editar e excluir citações de outro usuário', async () => {
  const { service, entries } = setup();
  const quote = await service.create('owner', { userBookId: 'one', text: 'Original' });
  for (const operation of [() => service.create('other', { userBookId: 'one', text: 'Outro' }), () => service.update('other', quote.id, { userBookId: 'two', text: 'Mudança' }), () => service.remove('other', quote.id)]) {
    await assert.rejects(operation(), (error) => error.getStatus() === 404);
  }
  assert.equal(entries[0].text, 'Original');
});

test('rejeita texto vazio e página acima do total sem gravar', async () => {
  const { service, entries } = setup();
  for (const dto of [{ userBookId: 'one', text: '   ' }, { userBookId: 'one', text: 'Texto', page: 201 }]) {
    await assert.rejects(service.create('owner', dto), (error) => error.getStatus() === 400);
  }
  assert.equal(entries.length, 0);
});

test('lista apenas citações do usuário autenticado e carrega os livros', async () => {
  const { service, calls } = setup();
  await service.list('owner');
  assert.deepEqual(calls[0].where, { userBook: { userId: 'owner' } });
  assert.deepEqual(calls[0].relations, { userBook: { book: true } });
});

test('DTO valida vínculo obrigatório, limites e página opcional', async () => {
  const dto = (values) => Object.assign(new SaveQuotationDto(), values);
  const valid = { userBookId: '123e4567-e89b-42d3-a456-426614174000', text: 'Texto', page: null };
  assert.equal((await validate(dto(valid))).length, 0);
  for (const values of [{ ...valid, userBookId: 'inválido' }, { ...valid, text: 'a'.repeat(5001) }, { ...valid, page: 0 }, { ...valid, page: 1.5 }, { text: 'Sem livro' }]) {
    assert.ok((await validate(dto(values))).length > 0);
  }
});
