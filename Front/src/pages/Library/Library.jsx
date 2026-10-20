import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { libraryApi } from '../../services/api';
import styles from './Library.module.css';
import BookTile from './BookTile';
import { getLibrarySummary } from './librarySummary';

const statuses = { want_to_read: 'Quero ler', reading: 'Lendo', read: 'Lido', abandoned: 'Abandonei' };
const normalizeSearch = (value) => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');

function ShelfActions({ shelf, onSaved, onDeleted }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (!event.target.closest(`[data-shelf-menu="${shelf.id}"]`)) setOpen(false);
    };
    const escape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', escape);
    };
  }, [open, shelf.id]);

  const startAction = (nextAction) => {
    setName(shelf.name); setDescription(shelf.description || '');
    setError(''); setOpen(false); setAction(nextAction);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (action === 'edit' && !name.trim()) { setError('Informe o nome da estante.'); return; }
    setSaving(true); setError('');
    try {
      if (action === 'edit') {
        const updated = await libraryApi.updateShelf(shelf.id, { name: name.trim(), description: description.trim() });
        setAction(''); onSaved(updated);
      } else {
        await libraryApi.deleteShelf(shelf.id);
        setAction(''); onDeleted(shelf.id);
      }
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };

  return <div className={styles.shelfActions}>
    <a className={styles.addBookButton} href={`/catalog?shelfId=${shelf.id}`}>Adicionar livro</a>
    <div className={styles.shelfMenuContainer} data-shelf-menu={shelf.id}>
      <button type="button" className={styles.shelfMenuButton} aria-label={`Opções da estante ${shelf.name}`} aria-expanded={open} aria-controls={`shelf-menu-${shelf.id}`} onClick={() => setOpen((current) => !current)}>⋮</button>
      {open && <div className={styles.shelfDropdown} id={`shelf-menu-${shelf.id}`}>
        <button type="button" onClick={() => startAction('edit')}>Editar estante</button>
        <button type="button" className={styles.dangerAction} onClick={() => startAction('delete')}>Excluir estante</button>
      </div>}
    </div>
    {action && createPortal(<div className={styles.modalBackdrop}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={`shelf-action-${shelf.id}`} onKeyDown={(event) => { if (event.key === 'Escape' && !saving) setAction(''); }}>
        <button type="button" className={styles.closeModal} disabled={saving} aria-label="Fechar" onClick={() => setAction('')}>×</button>
        <h2 id={`shelf-action-${shelf.id}`}>{action === 'edit' ? 'Editar estante' : 'Excluir estante'}</h2>
        <form className={styles.createShelfForm} onSubmit={submit}>
          {action === 'edit' ? <>
            <label>Nome<input value={name} onChange={(event) => setName(event.target.value)} maxLength="80" required autoFocus disabled={saving} /></label>
            <label>Descrição <span>(opcional)</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength="280" disabled={saving} /></label>
          </> : <p className={styles.shelfDialogHelp}>Excluir a estante “{shelf.name}”? Os livros e seus registros de leitura serão preservados na biblioteca e nas outras estantes.</p>}
          {error && <p className={styles.shelfDialogError} role="alert">{error}</p>}
          <button type="submit" className={action === 'delete' ? styles.dangerAction : undefined} disabled={saving}>{saving ? 'Aguarde...' : action === 'edit' ? 'Salvar alterações' : 'Excluir estante'}</button>
          <button type="button" autoFocus={action === 'delete'} disabled={saving} onClick={() => setAction('')}>Cancelar</button>
        </form>
      </section>
    </div>, document.body)}
  </div>;
}

function Library() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [error, setError] = useState('');
  const [creatingShelf, setCreatingShelf] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newShelf, setNewShelf] = useState('');
  const [newShelfDescription, setNewShelfDescription] = useState('');
  const status = params.get('status') || '';
  const shelfId = params.get('shelfId') || '';
  useEffect(() => {
    let active = true;
    Promise.all([libraryApi.library(), libraryApi.shelves()])
      .then(([books, collections]) => { if (active) { setItems(books); setShelves(collections); } })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const query = normalizeSearch(search.trim());
  const summary = getLibrarySummary(items, shelves);
  const hasFilters = Boolean(status || query);
  const visibleShelves = shelves
    .filter((shelf) => !shelfId || shelf.id === shelfId)
    .map((shelf) => ({
      ...shelf,
      books: items.filter((item) =>
        item.shelfLinks.some((link) => link.shelfId === shelf.id) &&
        (!status || item.status === status) &&
        (!query || normalizeSearch(shelf.name).includes(query) ||
          normalizeSearch(item.book.title).includes(query) ||
          (item.book.authors || []).some((author) => normalizeSearch(author).includes(query)))
      ),
    }))
    .filter((shelf) => !hasFilters || shelf.books.length > 0 ||
      (!status && query && normalizeSearch(shelf.name).includes(query)));
  const createShelf = async (event) => {
    event.preventDefault();
    if (!newShelf.trim()) return;
    try {
      const shelf = await libraryApi.createShelf({ name: newShelf, description: newShelfDescription });
      setShelves((current) => [...current, shelf].sort((a, b) => a.name.localeCompare(b.name)));
      setNewShelf(''); setNewShelfDescription(''); setCreatingShelf(false);
    } catch (requestError) { setError(requestError.message); }
  };
  return <>
    <Navbar />
    <main className={styles.page}>

      <header className={styles.pageHeader}>
        <div><p className={styles.eyebrow}>✦ Seu universo particular</p><h1>Histórias que<br />moram <em>com você.</em></h1><p>As leituras que marcaram, as que acompanham seus dias e as próximas descobertas. Cada história no seu lugar.</p>
          <div className={styles.headerActions}><button className={styles.createButton} onClick={() => setCreatingShelf(true)}>Criar estante</button><Link className={styles.exploreLink} to="/catalog">Explorar catálogo <span aria-hidden="true">↗</span></Link></div>
        </div>
        <div className={styles.collectionArt} aria-hidden="true"><span className={styles.artOrbit} /><span className={styles.artStar}>✦</span><div className={styles.artVolumes}><i>HISTÓRIAS</i><i>MEMÓRIAS</i><i>DESCOBERTAS</i><i>ANDARNA</i></div><span className={styles.artShelf} /><p>Um lugar para cada capítulo.</p></div>
      </header>
      <div className={styles.overview} aria-label="Resumo da sua biblioteca" aria-busy={loading}>
        {[{ value: summary.shelves, label: 'Estantes criadas', icon: '⌑' }, { value: summary.books, label: 'Livros na biblioteca', icon: '◈' }, { value: summary.reading, label: 'Em leitura', icon: '◉' }, { value: summary.read, label: 'Histórias concluídas', icon: '✓' }].map((stat) => <div key={stat.label}><span className={styles.overviewIcon} aria-hidden="true">{stat.icon}</span><div><strong>{loading || error ? '—' : stat.value.toLocaleString('pt-BR')}</strong><span>{stat.label}</span></div></div>)}
      </div>
      {creatingShelf && <div className={styles.modalBackdrop} role="presentation"><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="new-shelf-title"><button type="button" className={styles.closeModal} onClick={() => setCreatingShelf(false)} aria-label="Fechar">×</button><p className={styles.eyebrow}>Nova estante</p><h2 id="new-shelf-title">Crie uma coleção</h2><form className={styles.createShelfForm} onSubmit={createShelf}><label>Nome<input value={newShelf} onChange={(event) => setNewShelf(event.target.value)} maxLength="80" autoFocus required placeholder="Ex.: Livros 2026" /></label><label>Descrição <span>(opcional)</span><textarea value={newShelfDescription} onChange={(event) => setNewShelfDescription(event.target.value)} maxLength="280" placeholder="O que você quer guardar nesta estante?" /></label><button>Criar estante</button></form></section></div>}

      <div className={styles.filters}>
        <label className={styles.statusFilter}>
          Status de leitura
          <select value={status} onChange={(event) => {
            const nextParams = new URLSearchParams(params);
            if (event.target.value) nextParams.set('status', event.target.value);
            else nextParams.delete('status');
            setParams(nextParams);

          }}>
            <option value="">Todas</option>
            {Object.entries(statuses).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <label className={styles.searchFilter}>
          Buscar nas estantes
          <input type="search" value={search} onChange={(event) => { setSearch(event.target.value);  }} placeholder="Nome da estante, livro ou autor" />
        </label>
      </div>

      <div className={styles.collectionHeading}><div><p className={styles.eyebrow}>Organizadas do seu jeito</p><h2>Minhas estantes</h2></div><span>{loading ? 'Carregando...' : `${visibleShelves.length} ${visibleShelves.length === 1 ? 'estante' : 'estantes'}${hasFilters || shelfId ? ' nesta seleção' : ' na sua coleção'}`}</span></div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {loading && <p className={styles.loadingState} role="status">Preparando suas estantes...</p>}
      <section className={styles.shelfGrid} aria-label="Suas estantes" aria-busy={loading}>{visibleShelves.map((shelf, index) => {
        const shelfBooks = shelf.books;
        return <article className={styles.shelf} key={shelf.id}><header><div className={styles.shelfIdentity}><span className={styles.shelfNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><h2>{shelf.name}</h2>{shelf.description && <p>{shelf.description}</p>}
          <span>{shelfBooks.length} {shelfBooks.length === 1 ? 'livro' : 'livros'}</span></div></div>
          <ShelfActions shelf={shelf} onSaved={(updated) => setShelves((current) => current.map((entry) => entry.id === updated.id ? updated : entry).sort((a, b) => a.name.localeCompare(b.name)))} onDeleted={(id) => {
            setShelves((current) => current.filter((entry) => entry.id !== id));
            setItems((current) => current.map((item) => ({ ...item, shelfLinks: item.shelfLinks.filter((link) => link.shelfId !== id) })));

            if (shelfId === id) { const nextParams = new URLSearchParams(params); nextParams.delete('shelfId'); setParams(nextParams); }
          }} />
        </header>
          <div className={styles.tiles}>{shelfBooks.map((item) => <BookTile key={item.id} item={item} shelf={shelf} onUpdated={(updated) => setItems((current) => current.map((entry) => entry.id === updated.id ? updated : entry))} onRemoved={(id, removedShelfId) => setItems((current) => current.map((entry) => entry.id === id ? { ...entry, shelfLinks: entry.shelfLinks.filter((link) => link.shelfId !== removedShelfId) } : entry))} />)}{shelfBooks.length === 0 &&
            <div className={styles.emptyShelf}><span aria-hidden="true">✧</span><p>Uma estante à espera de histórias.</p><Link to={`/catalog?shelfId=${shelf.id}`}>Encontre seu primeiro livro ↗</Link></div>}
          </div>
        </article>;
      })}

      </section>{!loading && !error && visibleShelves.length === 0 &&
        <div className={styles.empty}><h3>{hasFilters ? 'Nenhuma história nesta busca' : 'Sua coleção começa com uma estante'}</h3><p>{hasFilters ? 'Experimente outro nome ou status de leitura para encontrar seus livros.' : 'Crie um espaço para seus temas, autores e histórias favoritas.'}</p>{hasFilters ? <button type="button" onClick={() => { setSearch(''); const next = new URLSearchParams(params); next.delete('status'); setParams(next); }}>Limpar filtros</button> : <button type="button" onClick={() => setCreatingShelf(true)}>Criar minha primeira estante</button>}
        </div>}

    </main></>;
}
export default Library;
