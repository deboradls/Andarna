import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { libraryApi } from '../../services/api';
import styles from './Catalog.module.css';

const statuses = { want_to_read: 'Quero ler', reading: 'Lendo', read: 'Lido', abandoned: 'Abandonei' };

function Catalog() {
  const [params] = useSearchParams();
  const [searchedQuery, setSearchedQuery] = useState('');
  const [query, setQuery] = useState(''); const [books, setBooks] = useState([]); const [shelves, setShelves] = useState([]);
  const [selected, setSelected] = useState(null); const [status, setStatus] = useState('want_to_read'); const [shelfIds, setShelfIds] = useState([]);
  const [newShelf, setNewShelf] = useState(''); const [loading, setLoading] = useState(false); const [message, setMessage] = useState('');
  useEffect(() => { libraryApi.shelves().then(setShelves).catch((error) => setMessage(error.message)); }, []);
  const search = async (event) => { event.preventDefault(); if (query.trim().length < 2) return setMessage('Digite pelo menos 2 caracteres para buscar.'); setLoading(true); setMessage(''); try { setBooks(await libraryApi.searchBooks(query)); setSearchedQuery(query.trim()); } catch (error) { setMessage(error.message); } finally { setLoading(false); } };
  const chooseBook = (book) => { const requestedShelfId = params.get('shelfId'); setSelected(book); setStatus('want_to_read'); setShelfIds(requestedShelfId ? [requestedShelfId] : []); setMessage(''); };
  const createShelf = async () => { if (!newShelf.trim()) return; try { const shelf = await libraryApi.createShelf(newShelf); setShelves((items) => [...items, shelf].sort((a, b) => a.name.localeCompare(b.name))); setShelfIds((ids) => [...ids, shelf.id]); setNewShelf(''); } catch (error) { setMessage(error.message); } };
  const saveBook = async (event) => { event.preventDefault(); try { await libraryApi.addBook({ googleVolumeId: selected.googleVolumeId, status, shelfIds }); setMessage(`“${selected.title}” foi salvo na sua biblioteca.`); setSelected(null); } catch (error) { setMessage(error.message); } };
  return <><Navbar /><main className={styles.page}><div className={styles.container}>
    <header className={styles.hero}>
      <div className={styles.heroContent}>
        <p className={styles.eyebrow}>✦ Um universo de histórias</p>
        <h1>A próxima página<br />começa <em>aqui.</em></h1>
        <p className={styles.intro}>Encontre aquele livro que não sai da sua cabeça.<br />Ou uma história que você ainda nem sabia que precisava.</p>
        <span className={styles.heroNote}>Descubra. Escolha. Guarde na sua estante.</span>
      </div>
      <div className={styles.heroArt} aria-hidden="true">
        <span className={styles.orbit} /><span className={styles.spark}>✦</span>
        <div className={`${styles.artBook} ${styles.artBookBack}`}><span>ENTRE<br />MUNDOS</span><i>✧</i></div>
        <div className={`${styles.artBook} ${styles.artBookFront}`}><small>ANDARNA</small><span>O início de<br />uma nova<br /><em>história</em></span><i>✦</i></div>
        <span className={styles.artCaption}>Tantas histórias. A sua próxima favorita.</span>
      </div>
    </header>
    <section className={styles.discovery} aria-label="Buscar no catálogo">
      <form className={styles.search} onSubmit={search}>
        <label className={styles.searchField}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque por título, autor ou ISBN..." aria-label="Pesquisar livros" />
        </label>
        <button disabled={loading}>{loading ? 'Buscando...' : 'Encontrar livros'} <span aria-hidden="true">↗</span></button>
      </form>
      <div className={styles.searchHint}><span>Seu próximo favorito está a uma busca de distância.</span><span>Catálogo · Google Books</span></div>
    </section>
    {message && <p className={styles.message} role="status">{message}</p>}
    <section className={styles.collection} aria-labelledby="results-title" aria-busy={loading}>
      <header className={styles.resultsHeader}>
        <div><p className={styles.eyebrow}>Sua próxima descoberta</p><h2 id="results-title">{loading ? 'Procurando novas histórias' : searchedQuery ? <>Resultados para <span>“{searchedQuery}”</span></> : 'Qual história vamos encontrar?'}</h2></div>
        {!loading && searchedQuery && <span className={styles.resultCount}>{books.length} {books.length === 1 ? 'livro encontrado' : 'livros encontrados'}</span>}
      </header>
      {loading ? <><p className={styles.loadingText} role="status">Buscando livros...</p><div className={styles.results} aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <div key={index} className={styles.skeleton}><div /><span /><span /></div>)}</div></> : books.length > 0 ? <div className={styles.results}>{books.map((book, index) => <article className={styles.card} key={book.googleVolumeId}>
        <div className={`${styles.coverStage} ${styles[`tone${index % 4}`]}`}>
          <div className={styles.cover}>{book.thumbnailUrl ? <img src={book.thumbnailUrl} alt={`Capa de ${book.title}`} loading="lazy" /> : <span className={styles.fallbackCover}><small>ANDARNA</small><span>{book.title}</span><i>✦</i></span>}</div>
          {book.pageCount > 0 && <span className={styles.pageBadge}>{book.pageCount} páginas</span>}
        </div>
        <div className={styles.bookInfo}>
          <p className={styles.bookYear}>{book.publishedDate?.slice(0, 4) || 'Edição sem data'}</p>
          <h3 title={book.title}>{book.title}</h3>
          <p className={styles.author}>{book.authors.join(', ') || 'Autor não informado'}</p>
          <button className={styles.addButton} type="button" onClick={() => chooseBook(book)}><span aria-hidden="true">＋</span>Adicionar à estante</button>
        </div>
      </article>)}</div> : <div className={styles.emptyState}>
        <span className={styles.emptyIcon} aria-hidden="true">✧</span>
        <h3>{searchedQuery ? 'Ainda não encontramos essa história' : 'Sua próxima leitura está por aqui'}</h3>
        <p>{searchedQuery ? 'Experimente outro título, o nome do autor ou o ISBN do livro.' : 'Digite um título, autor ou ISBN na busca para descobrir novos livros e preencher suas estantes.'}</p>
        <span className={styles.emptyDetail}>Uma boa leitura começa com uma descoberta.</span>
      </div>}
    </section>
  </div>{selected && <div className={styles.backdrop} role="presentation"><section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="add-title"><button className={styles.close} onClick={() => setSelected(null)} aria-label="Fechar">×</button><p className={styles.eyebrow}>Adicionar à biblioteca</p><h2 id="add-title">{selected.title}</h2><form onSubmit={saveBook}>{message && <p className={styles.message} role="alert">{message}</p>}<label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>{Object.entries(statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><fieldset><legend>Estantes</legend>{shelves.length === 0 && <p className={styles.empty}>Crie sua primeira estante abaixo.</p>}{shelves.map((shelf) => <label className={styles.check} key={shelf.id}><input type="checkbox" checked={shelfIds.includes(shelf.id)} onChange={() => setShelfIds((ids) => ids.includes(shelf.id) ? ids.filter((id) => id !== shelf.id) : [...ids, shelf.id])} />{shelf.name}</label>)}</fieldset><div className={styles.newShelf}><input value={newShelf} onChange={(event) => setNewShelf(event.target.value)} placeholder="Nova estante" aria-label="Nome da nova estante" maxLength="80" /><button type="button" onClick={createShelf}>Criar</button></div><button className={styles.saveButton}>Salvar livro</button></form></section></div>}</main></>;
}
export default Catalog;
