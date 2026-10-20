import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { libraryApi } from '../../services/api';
import styles from './Quotations.module.css';

const normalize = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
const formatDate = (value) => new Date(value).toLocaleDateString('pt-BR');

function QuotationDialog({ action, books, onClose, onSaved, onDeleted }) {
  const deleting = action.type === 'delete';
  const [text, setText] = useState(action.quote?.text || '');
  const [userBookId, setUserBookId] = useState(action.quote?.userBookId || '');
  const [page, setPage] = useState(action.quote?.page ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const dialog = useRef(null);
  const selectedBook = books.find((item) => item.id === userBookId);

  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector('[data-initial-focus]')?.focus();
    return () => { document.body.style.overflow = previousOverflow; if (previous?.isConnected) previous.focus(); };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!deleting && !text.trim()) { setError('Escreva o texto da citação.'); return; }
    setSaving(true); setError('');
    try {
      if (deleting) { await libraryApi.deleteQuotation(action.quote.id); onDeleted(action.quote.id); }
      else {
        const payload = { userBookId, text: text.trim(), page: page === '' ? null : Number(page) };
        const result = action.quote ? await libraryApi.updateQuotation(action.quote.id, payload) : await libraryApi.createQuotation(payload);
        onSaved(result, Boolean(action.quote));
      }
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };
  const keys = (event) => {
    if (event.key === 'Escape' && !saving) onClose();
    if (event.key !== 'Tab') return;
    const controls = [...dialog.current.querySelectorAll('button:not(:disabled), select:not(:disabled), input:not(:disabled), textarea:not(:disabled)')];
    const first = controls[0]; const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };

  return createPortal(<div className={styles.backdrop}>
    <section ref={dialog} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="quotation-dialog-title" onKeyDown={keys}>
      <button className={styles.close} type="button" disabled={saving} onClick={onClose} aria-label="Fechar">×</button>
      <p className={styles.eyebrow}>{deleting ? 'Sua coleção de palavras' : 'Palavras que merecem ficar'}</p>
      <h2 id="quotation-dialog-title">{deleting ? 'Excluir citação?' : action.quote ? 'Editar citação' : 'Guardar uma citação'}</h2>
      <form onSubmit={submit}>
        {deleting ? <><p className={styles.dialogHelp}>Esta citação será excluída. O livro e os seus registros de leitura serão preservados.</p><blockquote className={styles.deletePreview}>{action.quote.text}</blockquote><p className={styles.dialogHelp}>{action.quote.userBook.book.title}</p></> : <>
          <label>Livro da sua biblioteca<select data-initial-focus required value={userBookId} disabled={saving} onChange={(event) => { setUserBookId(event.target.value); setPage(''); }}><option value="" disabled>Escolha o livro desta citação</option>{books.map((item) => <option key={item.id} value={item.id}>{item.book.title}{item.book.authors?.length ? ` — ${item.book.authors.join(', ')}` : ''}</option>)}</select></label>
          <label>Citação<textarea value={text} disabled={saving} required maxLength="5000" rows="6" onChange={(event) => setText(event.target.value)} placeholder="Escreva aquele trecho que ficou com você..." /></label>
          <span className={styles.characterCount}>{text.length.toLocaleString('pt-BR')} / 5.000 caracteres</span>
          <label>Página <span className={styles.optional}>(opcional)</span><span className={styles.pageRow}><input type="number" min="1" max={selectedBook?.book.pageCount || 2147483647} step="1" value={page} disabled={saving} onChange={(event) => setPage(event.target.value)} placeholder="Ex.: 42" aria-describedby="quotation-page-total" /><span id="quotation-page-total">{selectedBook?.book.pageCount ? `de ${selectedBook.book.pageCount} páginas` : 'Total de páginas não informado'}</span></span></label>
        </>}
        {error && <p className={styles.formError} role="alert">{error}</p>}
        <div className={styles.dialogActions}><button type="button" className={styles.secondaryButton} disabled={saving} data-initial-focus={deleting || undefined} onClick={onClose}>Cancelar</button><button type="submit" className={deleting ? styles.dangerButton : styles.primaryButton} disabled={saving}>{saving ? 'Aguarde...' : deleting ? 'Excluir citação' : action.quote ? 'Salvar alterações' : 'Guardar citação'}</button></div>
      </form>
    </section>
  </div>, document.body);
}

export default function Quotations() {
  const [quotes, setQuotes] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState('');
  const [bookFilter, setBookFilter] = useState('');
  const [action, setAction] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([libraryApi.quotations(), libraryApi.library()]).then(([entries, items]) => {
      if (!active) return;
      setQuotes(entries);
      setBooks([...new Map(items.map((item) => [item.id, item])).values()].sort((a, b) => a.book.title.localeCompare(b.book.title, 'pt-BR')));
    }).catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);

  const query = normalize(search.trim());
  const visible = quotes.filter((quote) => (!bookFilter || quote.userBookId === bookFilter) &&
    (!query || normalize([quote.text, quote.userBook.book.title, ...quote.userBook.book.authors].join(' ')).includes(query)));
  const hasFilters = Boolean(query || bookFilter);
  const open = (type, quote) => { setNotice(''); setAction({ type, quote }); };
  const saved = (quote, editing) => {
    setQuotes((current) => editing ? current.map((entry) => entry.id === quote.id ? quote : entry) : [quote, ...current]);
    setAction(null); setNotice(editing ? 'Citação atualizada.' : 'Citação guardada na sua coleção.');
  };

  return <><Navbar /><main className={styles.page}><div className={styles.container}>
    <header className={styles.hero}>
      <div className={styles.heroContent}><p className={styles.eyebrow}>✦ Sua coleção de palavras</p><h1>Há palavras que<br />ficam <em>com a gente.</em></h1><p>Guarde os trechos que fizeram você parar, pensar e sentir.<br />Um pedacinho de cada história, sempre por perto.</p><button className={styles.primaryButton} disabled={loading || Boolean(error) || !books.length} onClick={() => open('create')}><span aria-hidden="true">＋</span> Nova citação</button></div>
      <div className={styles.heroArt} aria-hidden="true"><span className={styles.artOrbit} /><span className={styles.artSpark}>✦</span><div className={styles.paper}><span>“</span><i>Algumas palavras<br />encontram um lugar<br />para ficar.</i><small>ENTRE AS SUAS PÁGINAS</small></div><span className={styles.artCaption}>Pequenos trechos. Grandes lembranças.</span></div>
    </header>
    <div className={styles.summary}><span><strong>{loading || error ? '—' : quotes.length.toLocaleString('pt-BR')}</strong> {quotes.length === 1 ? 'citação guardada' : 'citações guardadas'}</span><i /><span><strong>{loading || error ? '—' : new Set(quotes.map((quote) => quote.userBookId)).size.toLocaleString('pt-BR')}</strong> livros na sua coleção de citações</span></div>
    <div className={styles.filters}><label className={styles.searchLabel}>Encontre suas palavras<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Busque por trecho, livro ou autor..." /></label><label>Filtrar por livro<select value={bookFilter} onChange={(event) => setBookFilter(event.target.value)}><option value="">Todos os livros</option>{books.map((item) => <option value={item.id} key={item.id}>{item.book.title}</option>)}</select></label></div>
    {notice && <p className={styles.notice} role="status">✓ {notice}</p>}
    <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Um pouco de cada história</p><h2>Minhas citações</h2></div><span>{!loading && !error ? `${visible.length} ${visible.length === 1 ? 'citação' : 'citações'}${hasFilters ? ' nesta busca' : ''}` : ''}</span></div>
    {error ? <div className={styles.error} role="alert"><p>{error}</p><button className={styles.secondaryButton} onClick={() => { setError(''); setLoading(true); setReload((current) => current + 1); }}>Tentar novamente</button></div> : loading ? <div className={styles.loading} role="status">Preparando sua coleção de palavras...</div> : visible.length ? <section className={styles.grid} aria-label="Citações guardadas">{visible.map((quote) => <article className={styles.card} key={quote.id}>
      <div className={styles.cardTop}><span className={styles.quoteMark} aria-hidden="true">“</span><span>{quote.page ? `Página ${quote.page}` : 'Trecho guardado'}</span></div>
      <blockquote className={styles.quoteText}>{quote.text}</blockquote>
      <div className={styles.bookIdentity}><div className={styles.cover} aria-hidden="true">{quote.userBook.book.thumbnailUrl ? <img src={quote.userBook.book.thumbnailUrl} alt="" loading="lazy" /> : '✦'}</div><div><h3>{quote.userBook.book.title}</h3><p>{quote.userBook.book.authors.join(', ') || 'Autor não informado'}</p></div></div>
      <div className={styles.cardFooter}><span>Guardada em <time dateTime={quote.createdAt}>{formatDate(quote.createdAt)}</time></span><div><button type="button" onClick={() => open('edit', quote)} aria-label={`Editar citação de ${quote.userBook.book.title}`}>Editar</button><button type="button" className={styles.deleteAction} onClick={() => open('delete', quote)} aria-label={`Excluir citação de ${quote.userBook.book.title}`}>Excluir</button></div></div>
    </article>)}</section> : <section className={styles.empty}><span aria-hidden="true">✧</span><h3>{hasFilters ? 'Nenhuma citação nesta busca' : 'Sua primeira lembrança começa aqui.'}</h3><p>{hasFilters ? 'Experimente outro trecho, autor ou livro para encontrar suas citações.' : books.length ? 'Escolha um livro da sua biblioteca e guarde as palavras que você quer levar com você.' : 'Adicione um livro à sua biblioteca para começar sua coleção de citações.'}</p>{hasFilters ? <button className={styles.secondaryButton} onClick={() => { setSearch(''); setBookFilter(''); }}>Limpar filtros</button> : books.length ? <button className={styles.primaryButton} onClick={() => open('create')}>Guardar minha primeira citação</button> : <Link className={styles.primaryButton} to="/catalog">Explorar o catálogo ↗</Link>}</section>}
  </div></main>{action && <QuotationDialog action={action} books={books} onClose={() => setAction(null)} onSaved={saved} onDeleted={(id) => { setQuotes((current) => current.filter((quote) => quote.id !== id)); setAction(null); setNotice('Citação excluída.'); }} />}</>;
}
