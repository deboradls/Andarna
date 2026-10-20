import { useEffect, useState } from 'react';
import { libraryApi } from '../../services/api';
import styles from './Profile.module.css';

// Share the request during React StrictMode's development effect replay.
let pendingQuote;
const loadQuote = () => {
  if (!pendingQuote) {
    let previous = '';
    try { previous = sessionStorage.getItem('andarna:last-quote') || ''; } catch { /* Storage may be disabled. */ }
    pendingQuote = libraryApi.randomQuote(previous).then((quote) => {
      try { sessionStorage.setItem('andarna:last-quote', quote.id); } catch { /* The quote still works without storage. */ }
      return quote;
    }).finally(() => { pendingQuote = null; });
  }
  return pendingQuote;
};

export default function QuoteCard() {
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    loadQuote().then((result) => { if (active) { setQuote(result); setError(''); } })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, [attempt]);

  return <section className={`${styles.panel} ${styles.quotePanel}`} aria-labelledby="quote-title" aria-busy={!quote && !error}>
    <p className={styles.eyebrow} id="quote-title">Uma nova inspiração</p>
    {/* <h2 id="quote-title">Frases</h2> */}
    {quote ? <>
      <span className={styles.quoteMark} aria-hidden="true">“</span>
      <blockquote className={styles.quoteText}><p>{quote.text}</p></blockquote>
      <p className={styles.quoteAuthor}>{quote.author}</p>
      <a className={styles.quoteSource} href={quote.sourceUrl} target="_blank" rel="noopener noreferrer">{quote.title} · Project Gutenberg ↗</a>
      <small className={styles.quoteCredit}>Textos do Project Gutenberg · Catálogo via Gutendex. Uma frase diferente a cada atualização.</small>
    </> : error ? <>
      <p role="alert" className={styles.feedback}>{error}</p>
      <button type="button" className={styles.quoteRetry} onClick={() => { setError(''); setAttempt((current) => current + 1); }}>Tentar novamente</button>
    </> : <p role="status" className={styles.feedback}>Buscando uma frase entre as páginas...</p>}
  </section>;
}
