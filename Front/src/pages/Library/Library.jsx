import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { libraryApi } from '../../services/api';
import styles from './Library.module.css';

const statuses = { want_to_read: 'Quero ler', reading: 'Lendo', read: 'Lido', abandoned: 'Abandonei' };

function Stars({ value, onChange, title }) {
  return <div className={styles.stars} role="group" aria-label={`Avaliação de ${title}`}>{[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} className={star <= value ? styles.filled : ''} onClick={() => onChange(star === value ? 0 : star)} aria-label={`${star} estrela${star > 1 ? 's' : ''}`}>★</button>)}</div>;
}

function BookTile({ item, shelf, shelves, open, onToggle, onProgress, onDetails, onStatus, onOrganize }) {
  const progress = item.progress ?? 0; const rating = item.rating ?? 0;
  return <article className={styles.bookTile} onClick={onToggle}><div className={styles.tileCover}>{item.book.thumbnailUrl ? <img src={item.book.thumbnailUrl} alt={`Capa de ${item.book.title}`} /> : item.book.title}</div><h3 title={item.book.title}>{item.book.title}</h3><p className={styles.bookMeta}><span>{progress}%</span><span aria-label={rating ? `${rating} de 5 estrelas` : 'Sem avaliação'}>{rating ? `${rating} ★` : 'Sem avaliação'}</span></p>{open && <div className={styles.bookMenu} onClick={(event) => event.stopPropagation()}><button type="button" className={styles.updateProgressButton} onClick={() => onProgress(item)}>Atualizar progresso</button><label className={styles.tileStatus}>Status<select value={item.status} onChange={(event) => onStatus(item.id, event.target.value)}>{Object.entries(statuses).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><Stars value={rating} title={item.book.title} onChange={(ratingValue) => onDetails(item.id, { rating: ratingValue })} /><details className={styles.organization}><summary>Organização</summary><div><p>Outra estante</p>{shelves.filter((target) => target.id !== shelf.id).map((target) => <div className={styles.organizationOption} key={target.id}><span>{target.name}</span><button type="button" onClick={() => onOrganize('move', item.id, shelf.id, target.id)}>Mover</button><button type="button" onClick={() => onOrganize('copy', item.id, shelf.id, target.id)}>Duplicar</button></div>)}<button type="button" className={styles.removeButton} onClick={() => onOrganize('remove', item.id, shelf.id)}>Remover desta estante</button></div></details></div>}</article>;
}

function Library() {
  const [params] = useSearchParams();
  const [items, setItems] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [error, setError] = useState('');
  const [creatingShelf, setCreatingShelf] = useState(false);
  const [newShelf, setNewShelf] = useState('');
  const [newShelfDescription, setNewShelfDescription] = useState('');
  const [activeBook, setActiveBook] = useState('');
  const [progressRecord, setProgressRecord] = useState(null);
  const [readingMode, setReadingMode] = useState('percentage');
  const [readingValue, setReadingValue] = useState('');
  const [readDate, setReadDate] = useState(new Date().toISOString().slice(0, 10));
  const [readingNote, setReadingNote] = useState('');
  const [completionRating, setCompletionRating] = useState(0);
  const status = params.get('status') || '';
  const shelfId = params.get('shelfId') || '';
  const load = () => libraryApi.library({ ...(status && { status }), ...(shelfId && { shelfId }) }).then(setItems).catch((requestError) => setError(requestError.message));

  useEffect(() => {
    load(); libraryApi.shelves().then(setShelves).catch(() => { });
  },
    [status, shelfId]);

  const updateDetails = async (id, details) => {
    try {
      const updated = await libraryApi.updateBookDetails(id, details);
      setItems((current) => current.map((item) => item.id === id ? updated : item));
    } catch (requestError) { setError(requestError.message); }
  };

  const changeStatus = async (id, nextStatus) => {
    try {
      const updated = await libraryApi.updateStatus(id, nextStatus);
      setItems((current) => current.map((item) => item.id === id ? updated : item));
    }
    catch (requestError) {
      setError(requestError.message);

    }
  };

  const visibleShelves = shelves.filter((shelf) => !shelfId || shelf.id === shelfId);
  const createShelf = async (event) => {
    event.preventDefault();
    if (!newShelf.trim()) return;
    try {
      const shelf = await libraryApi.createShelf({ name: newShelf, description: newShelfDescription });
      setShelves((current) => [...current, shelf].sort((a, b) => a.name.localeCompare(b.name)));
      setNewShelf(''); setNewShelfDescription(''); setCreatingShelf(false);
    } catch (requestError) { setError(requestError.message); }
  };
  const organizeBook = async (action, id, sourceShelfId, targetShelfId) => {
    try {
      if (action === 'copy') await libraryApi.addToShelf(id, targetShelfId);
      if (action === 'move') { await libraryApi.addToShelf(id, targetShelfId); await libraryApi.removeFromShelf(id, sourceShelfId); }
      if (action === 'remove') await libraryApi.removeFromShelf(id, sourceShelfId);
      setActiveBook(''); load();
    } catch (requestError) { setError(requestError.message); }
  };
  const openProgress = (item) => { setProgressRecord(item); setReadingMode(item.readingMode || 'percentage'); setReadingValue(item.readingMode === 'percentage' ? String(item.progress ?? 0) : String(item.readingValue ?? '')); setReadDate(item.lastReadAt || new Date().toISOString().slice(0, 10)); setReadingNote(item.readingNote || ''); setCompletionRating(item.rating || 0); };
  const calculatedProgress = () => { if (!progressRecord) return 0; const value = Number(readingValue) || 0; const total = readingMode === 'percentage' ? 100 : progressRecord.book.pageCount || 100; return Math.min(100, Math.round((value / total) * 100)); };
  const saveProgress = async (event) => { event.preventDefault(); const progress = calculatedProgress(); if (progress === 100 && !completionRating) { setError('Ao concluir o livro, escolha de 1 a 5 estrelas.'); return; } try { const updated = await libraryApi.updateBookDetails(progressRecord.id, { readingMode, readingValue: Number(readingValue), readDate, readingNote, rating: completionRating || undefined }); setItems((current) => current.map((item) => item.id === updated.id ? updated : item)); setProgressRecord(null); setActiveBook(''); } catch (requestError) { setError(requestError.message); } };

  return <>
    <Navbar />
    <main className={styles.page}>

      <header className={styles.pageHeader}>
        <div><p className={styles.eyebrow}>Minhas estantes</p><h1>Sua biblioteca</h1><p>Crie estantes para qualquer tema. Status, progresso e avaliação pertencem ao livro, mesmo quando ele aparece em mais de uma estante.</p></div>
        <button className={styles.createButton} onClick={() => setCreatingShelf(true)}>Criar estante</button>
      </header>
      {creatingShelf && <div className={styles.modalBackdrop} role="presentation"><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="new-shelf-title"><button type="button" className={styles.closeModal} onClick={() => setCreatingShelf(false)} aria-label="Fechar">×</button><p className={styles.eyebrow}>Nova estante</p><h2 id="new-shelf-title">Crie uma coleção</h2><form className={styles.createShelfForm} onSubmit={createShelf}><label>Nome<input value={newShelf} onChange={(event) => setNewShelf(event.target.value)} maxLength="80" autoFocus required placeholder="Ex.: Livros 2026" /></label><label>Descrição <span>(opcional)</span><textarea value={newShelfDescription} onChange={(event) => setNewShelfDescription(event.target.value)} maxLength="280" placeholder="O que você quer guardar nesta estante?" /></label><button>Criar estante</button></form></section></div>}

      <div className={styles.filters}>
        <a className={!status && !shelfId ? styles.active : ''}
          href="/shelves/books">Todas</a>
        {Object.entries(statuses).map(([key, label]) =>
          <a key={key} className={status === key ? styles.active : ''}
            href={`/shelves/books?status=${key}`}>{label}</a>)}
      </div>

      {error && <p className={styles.error}>{error}</p>}<section className={styles.shelfGrid}>{visibleShelves.map((shelf) => {
        const shelfBooks = items.filter((item) => item.shelfLinks.some((link) => link.shelfId === shelf.id));
        return <article className={styles.shelf} key={shelf.id}><header><div><h2>{shelf.name}</h2>{shelf.description && <p>{shelf.description}</p>}
          <span>{shelfBooks.length} {shelfBooks.length === 1 ? 'livro' : 'livros'}</span></div><a className={styles.addBookButton} href={`/catalog?shelfId=${shelf.id}`}>Adicionar livro</a>
        </header>
          <div className={styles.tiles}>{shelfBooks.map((item) => { const itemKey = `${item.id}:${shelf.id}`; return <BookTile key={item.id} item={item} shelf={shelf} shelves={shelves} open={activeBook === itemKey} onToggle={() => setActiveBook((current) => current === itemKey ? '' : itemKey)} onProgress={openProgress} onDetails={updateDetails} onStatus={changeStatus} onOrganize={organizeBook} />; })}{shelfBooks.length === 0 &&
            <p className={styles.emptyShelf}>Ainda não há livros nesta estante.</p>}
          </div>
        </article>;
      })}

      </section>{!error && visibleShelves.length === 0 &&
        <div className={styles.empty}>Nenhuma estante nesta seleção. Use o
          <a href="/catalog">Catálogo</a> para criar uma e adicionar livros.
        </div>}

    </main>{progressRecord && <div className={styles.modalBackdrop}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="progress-title"><button type="button" className={styles.closeModal} onClick={() => setProgressRecord(null)} aria-label="Fechar">×</button><p className={styles.eyebrow}>Registro de leitura</p><h2 id="progress-title">{progressRecord.book.title}</h2><form className={styles.progressForm} onSubmit={saveProgress}><label>Modo de leitura?<select value={readingMode} onChange={(event) => setReadingMode(event.target.value)}><option value="pages">Página</option><option value="percentage">Porcentagem</option><option value="minutes">Minutagem</option></select></label><label>{readingMode === 'pages' ? 'Em qual página você está?' : readingMode === 'minutes' ? 'Quantos minutos você leu?' : 'Qual é o progresso?' }<input type="number" min="0" max={readingMode === 'percentage' ? 100 : undefined} value={readingValue} onChange={(event) => setReadingValue(event.target.value)} required /></label><div className={styles.progressPreview}><progress value={calculatedProgress()} max="100" /><span>{progressRecord.book.pageCount ? `${progressRecord.book.pageCount} páginas` : 'Páginas não informadas'}</span></div>{readingMode === 'minutes' && <small className={styles.modalHelp}>A minutagem usa a quantidade de páginas como referência para calcular o percentual.</small>}<label>Que dia você leu?<input type="date" value={readDate} onChange={(event) => setReadDate(event.target.value)} required /></label><label>O que você está pensando?<textarea value={readingNote} onChange={(event) => setReadingNote(event.target.value)} maxLength="2000" placeholder="Uma ideia, impressão ou frase impactante..." /></label>{calculatedProgress() === 100 && <fieldset className={styles.ratingField}><legend>Você concluiu o livro! Dê uma avaliação.</legend><Stars value={completionRating} title={progressRecord.book.title} onChange={setCompletionRating} /></fieldset>}<button>Salvar progresso</button></form></section></div>}</>;
}
export default Library;
