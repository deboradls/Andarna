import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { libraryApi } from '../../services/api';
import styles from './Library.module.css';

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const formatDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR');
const statusLabels = { want_to_read: 'Quero ler', reading: 'Lendo', read: 'Lido', abandoned: 'Abandonei' };

export default function BookTile({ item, shelf, onUpdated, onRemoved }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('');
  const [mode, setMode] = useState('percentage');
  const [value, setValue] = useState('');
  const [readDate, setReadDate] = useState(today);
  const [description, setDescription] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const container = useRef(null);
  const trigger = useRef(null);
  const dialog = useRef(null);
  const key = `${item.id}-${shelf.id}`;
  const total = mode === 'percentage' ? 100 : item.book.pageCount;

  useEffect(() => {
    if (!open) return;
    const outside = (event) => { if (!container.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);

  useEffect(() => {
    if (!action) return;
    dialog.current?.querySelector('input, button')?.focus();
    const button = trigger.current;
    return () => button?.focus();
  }, [action]);

  useEffect(() => {
    if (action !== 'history') return;
    let active = true;
    libraryApi.readingUpdates(item.id).then((entries) => { if (active) setHistory(entries); })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [action, item.id]);

  const start = (nextAction) => {
    setOpen(false); setError(''); setAction(nextAction);
    if (nextAction === 'progress') {
      setMode(item.readingMode === 'pages' && item.book.pageCount ? 'pages' : 'percentage');
      setValue(String(item.readingMode === 'pages' && item.book.pageCount ? item.readingValue ?? 0 : item.progress ?? 0));
      setReadDate(today()); setDescription('');
    }
    if (nextAction === 'history') { setHistory([]); setLoading(true); }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError('');
    try {
      if (action === 'remove') {
        await libraryApi.removeFromShelf(item.id, shelf.id);
        setAction(''); onRemoved(item.id, shelf.id);
      } else {
        const updated = await libraryApi.createReadingUpdate(item.id, { mode, value: Number(value), readDate, description });
        setAction(''); onUpdated(updated);
      }
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };
  const dialogKeys = (event) => {
    if (event.key === 'Escape' && !saving) setAction('');
    if (event.key === 'Tab') {
      const controls = [...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')];
      const first = controls[0]; const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  };

  return <article ref={container} className={`${styles.bookTile} ${open ? styles.bookTileOpen : ''}`}>
    <button ref={trigger} type="button" className={styles.bookCoverButton} aria-label={`Opções de ${item.book.title}`} aria-expanded={open} aria-controls={`book-menu-${key}`} onClick={() => setOpen((current) => !current)}>
      <div className={styles.tileStage}><div className={styles.tileCover}>{item.book.thumbnailUrl ? <img src={item.book.thumbnailUrl} alt={`Capa de ${item.book.title}`} loading="lazy" /> : <span className={styles.coverTitle}>{item.book.title}<i aria-hidden="true">✦</i></span>}</div><span className={styles.bookOptionsHint} aria-hidden="true">⋯</span></div>
      <div className={styles.tileInfo}><span className={`${styles.readingBadge} ${item.status === 'read' ? styles.completedBadge : ''}`}>{statusLabels[item.status]}</span><h3 title={item.book.title}>{item.book.title}</h3><p>{item.book.authors?.join(', ') || 'Autor não informado'}</p><div className={styles.tileProgress}><span>Progresso</span><strong>{item.progress ?? 0}%</strong></div><div className={styles.tileProgressTrack} aria-hidden="true"><span style={{ width: `${item.progress ?? 0}%` }} /></div></div>
    </button>
    {open && <div className={styles.bookDropdown} id={`book-menu-${key}`}>
      <button type="button" onClick={() => start('progress')}>Atualizar progresso</button>
      <button type="button" onClick={() => start('history')}>Ver histórico</button>
      <button type="button" className={styles.dangerAction} onClick={() => start('remove')}>Remover da estante</button>
    </div>}
    {action && createPortal(<div className={styles.modalBackdrop}>
      <section ref={dialog} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby={`book-dialog-${key}`} onKeyDown={dialogKeys}>
        <button type="button" className={styles.closeModal} disabled={saving} onClick={() => setAction('')} aria-label="Fechar">×</button>
        <p className={styles.eyebrow}>{item.book.title}</p>
        <h2 id={`book-dialog-${key}`}>{action === 'progress' ? 'Atualizar progresso' : action === 'history' ? 'Histórico de leitura' : 'Remover da estante'}</h2>
        {action === 'history' ? <div aria-busy={loading}>
          {loading && <p className={styles.shelfDialogHelp}>Carregando histórico...</p>}
          {!loading && !error && history.length === 0 && <p className={styles.shelfDialogHelp}>Nenhuma atualização de leitura registrada.</p>}
          {error && <p className={styles.shelfDialogError} role="alert">{error}</p>}
          <ol className={styles.readingHistory}>{history.map((entry) => <li key={entry.id}>
            <time dateTime={entry.readDate}>{formatDate(entry.readDate)}</time>
            <strong>{entry.mode === 'pages' ? `${entry.value} páginas · ${entry.progress}%` : `${entry.progress}% de leitura`}</strong>
            {entry.description && <p>{entry.description}</p>}
          </li>)}</ol>
        </div> : <form className={styles.progressForm} onSubmit={submit}>
          {action === 'progress' ? <>
            <label>Atualizar por<select value={mode} disabled={saving} onChange={(event) => { setMode(event.target.value); setValue(''); }}><option value="percentage">Porcentagem</option><option value="pages" disabled={!item.book.pageCount}>Páginas</option></select></label>
            {!item.book.pageCount && <p className={styles.shelfDialogHelp}>Total de páginas não informado. Registre a leitura por porcentagem.</p>}
            <label>{mode === 'pages' ? 'Até qual página você leu?' : 'Porcentagem lida'}
              <span className={styles.progressInputRow}>
                <input type="number" min="0" max={total} step="1" required value={value} disabled={saving} aria-describedby={`page-total-${key}`} onChange={(event) => setValue(event.target.value)} />
                <span id={`page-total-${key}`} className={styles.pageTotal}>{item.book.pageCount ? `Total: ${item.book.pageCount} páginas` : 'Total não informado'}</span>
              </span>
            </label>
            <label>Data da atualização<input type="date" required value={readDate} disabled={saving} onChange={(event) => setReadDate(event.target.value)} /></label>
            <label>Descrição (opcional)<textarea value={description} maxLength="2000" disabled={saving} placeholder="Suas impressões sobre a leitura..." onChange={(event) => setDescription(event.target.value)} /></label>
          </> : <p className={styles.shelfDialogHelp}>Remover “{item.book.title}” da estante “{shelf.name}”? O histórico de leitura e as outras estantes serão preservados.</p>}
          {error && <p className={styles.shelfDialogError} role="alert">{error}</p>}
          <button type="submit" disabled={saving} className={action === 'remove' ? styles.dangerAction : undefined}>{saving ? 'Salvando...' : action === 'remove' ? 'Remover da estante' : 'Salvar atualização'}</button>
          <button type="button" disabled={saving} onClick={() => setAction('')}>Cancelar</button>
        </form>}
      </section>
    </div>, document.body)}
  </article>;
}
