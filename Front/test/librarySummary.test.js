import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLibrarySummary } from '../src/pages/Library/librarySummary.js';

const shelves = [{ id: 'a' }, { id: 'b' }];
const book = (id, status, ids) => ({ id, status, shelfLinks: ids.map((shelfId) => ({ shelfId })) });

test('conta cada livro uma vez e ignora registros sem estante', () => {
  const reading = book('1', 'reading', ['a', 'b']);
  const items = [reading, reading, book('2', 'read', ['b']), book('3', 'read', [])];
  assert.deepEqual(getLibrarySummary(items, shelves), { shelves: 2, books: 2, reading: 1, read: 1 });
});

test('remover o último vínculo reduz os contadores, inclusive após recarregar', () => {
  const items = [book('1', 'read', ['a']), book('2', 'reading', ['b'])];
  const removed = items.map((item) => ({ ...item, shelfLinks: item.shelfLinks.filter((link) => link.shelfId !== 'a') }));
  assert.deepEqual(getLibrarySummary(removed, shelves), { shelves: 2, books: 1, reading: 1, read: 0 });
});

test('excluir uma estante preserva a contagem dos livros que estão em outras', () => {
  const items = [book('1', 'reading', ['a', 'b']), book('2', 'read', ['a'])];
  assert.deepEqual(getLibrarySummary(items, [{ id: 'b' }]), { shelves: 1, books: 1, reading: 1, read: 0 });
  assert.deepEqual(getLibrarySummary(items, []), { shelves: 0, books: 0, reading: 0, read: 0 });
});
