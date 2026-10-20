export function getLibrarySummary(items, shelves) {
  const shelfIds = new Set(shelves.map((shelf) => shelf.id));
  const books = [...new Map(items
    .filter((item) => item.shelfLinks.some((link) => shelfIds.has(link.shelfId)))
    .map((item) => [item.id, item])).values()];

  return {
    shelves: shelfIds.size,
    books: books.length,
    reading: books.filter((item) => item.status === 'reading').length,
    read: books.filter((item) => item.status === 'read').length,
  };
}
