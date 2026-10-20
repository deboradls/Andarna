const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LibraryService } = require('../dist/library/library.service');
const { UserBook } = require('../dist/library/entities/user-book.entity');
const { ReadingUpdate } = require('../dist/library/entities/reading-update.entity');

function setup({ pageCount = 200, owner = true, failHistory = false } = {}) {
  const saved = [];
  const item = { id: 'book', bookId: 'volume', userId: 'owner', progress: 0, status: 'want_to_read' };
  const manager = {
    findOne: async (_type, options) => owner && options.where.userId === 'owner' ? { ...item } : null,
    findOneByOrFail: async () => ({ pageCount }),
    create: (_type, value) => value,
    save: async (type, value) => {
      if (type === ReadingUpdate && failHistory) throw new Error('history failed');
      saved.push({ type, value }); return value;
    },
    transaction: async (callback) => callback(manager),
    getRepository: () => ({ find: async (query) => query }),
  };
  const repository = { manager, findOneBy: async () => owner ? item : null };
  const service = new LibraryService({}, {}, repository, {}, {});
  service.getLibraryItem = async () => saved.find((entry) => entry.type === UserBook)?.value;
  return { service, saved };
}
const input = { mode: 'pages', value: 50, readDate: '2026-10-18', description: '  Boa leitura  ' };

test('registra páginas, data e descrição junto ao progresso atual', async () => {
  const { service, saved } = setup();
  const updated = await service.createReadingUpdate('owner', 'book', input);
  assert.equal(updated.progress, 25);
  assert.equal(updated.status, 'reading');
  assert.deepEqual(saved[0].value, { userBookId: 'book', mode: 'pages', value: 50, progress: 25, readDate: input.readDate, description: 'Boa leitura' });
});
test('conclui por porcentagem sem exigir avaliação', async () => {
  const { service } = setup();
  const updated = await service.createReadingUpdate('owner', 'book', { ...input, mode: 'percentage', value: 100 });
  assert.equal(updated.status, 'read');
});
test('não conclui prematuramente por arredondamento', async () => {
  const { service } = setup({ pageCount: 1000 });
  assert.equal((await service.createReadingUpdate('owner', 'book', { ...input, value: 999 })).progress, 99);
});
test('rejeita páginas sem total e valores acima do limite', async () => {
  for (const [options, dto] of [[{ pageCount: 0 }, input], [{}, { ...input, value: 201 }], [{}, { ...input, mode: 'percentage', value: 101 }]]) {
    const { service, saved } = setup(options);
    await assert.rejects(service.createReadingUpdate('owner', 'book', dto), (error) => error.getStatus() === 400);
    assert.equal(saved.length, 0);
  }
});
test('bloqueia leitura e gravação de histórico de outro usuário', async () => {
  const { service, saved } = setup({ owner: false });
  await assert.rejects(service.createReadingUpdate('other', 'book', input), (error) => error.getStatus() === 404);
  await assert.rejects(service.getReadingUpdates('other', 'book'), (error) => error.getStatus() === 404);
  assert.equal(saved.length, 0);
});
test('não grava progresso quando a gravação do histórico falha', async () => {
  const { service, saved } = setup({ failHistory: true });
  await assert.rejects(service.createReadingUpdate('owner', 'book', input), /history failed/);
  assert.equal(saved.length, 0);
});
test('consulta histórico com ordem de data e criação', async () => {
  const { service } = setup();
  assert.deepEqual(await service.getReadingUpdates('owner', 'book'), { where: { userBookId: 'book' }, order: { readDate: 'DESC', createdAt: 'DESC' } });
});
