import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { libraryApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Profile.module.css';
import QuoteCard from './QuoteCard';

const statuses = { read: 'Lido', reading: 'Lendo', want_to_read: 'Quero ler', abandoned: 'Abandonei' };

function Profile() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    libraryApi.library().then((books) => {
      if (active) { setItems([...new Map(books.map((item) => [item.id, item])).values()]); setError(''); }
    }).catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.id]);
  const completed = items.filter((item) => item.status === 'read');
  const readingStats = [
    { label: 'Livros lidos', value: completed.length, icon: '◈', status: 'read', detail: 'Histórias que ficam com você' },
    { label: 'Em leitura', value: items.filter((item) => item.status === 'reading').length, icon: '◉', status: 'reading', detail: 'Seus capítulos de agora' },
    { label: 'Quero ler', value: items.filter((item) => item.status === 'want_to_read').length, icon: '⌑', status: 'want_to_read', detail: 'Novas histórias à sua espera' },
    { label: 'Páginas lidas', value: completed.reduce((total, item) => total + (item.book.pageCount || 0), 0), icon: '↟', status: 'read', detail: 'Somadas dos livros concluídos' },
  ];
  const recentBooks = [...items].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3);
  const email = user?.email ?? '';
  const displayName = user?.name || email.split('@')[0] || 'Meu perfil';
  const firstLetter = displayName.charAt(0).toUpperCase();
  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(user.createdAt))
    : '';

  return (
    <>
      <Navbar />

      <main className={styles.profilePage}>
        <section className={styles.profileHeader} aria-labelledby="profile-name">
          <div className={styles.headerGlow} />
          <div className={styles.profileContent}>
            <div className={styles.identityGroup}>
              <div className={styles.avatarFrame}><div className={styles.avatar} aria-hidden="true">{firstLetter}</div><span aria-hidden="true">✦</span></div>
              <div className={styles.identity}>
              <p className={styles.eyebrow}>✦ Meu espaço de leitura</p>
              <h1 id="profile-name">{displayName}</h1>
              <p className={styles.email}>{email}</p>
              {memberSince && <p className={styles.memberSince}>Leitor desde {memberSince}</p>}
              </div>
            </div>
            <div className={styles.headerNote}><span aria-hidden="true">✧</span><p>Um pouco de você<br />em <em>cada história.</em></p><Link to="/shelves/books">Visitar minhas estantes <span aria-hidden="true">↗</span></Link></div>
          </div>
        </section>

        <div className={styles.content}>
          <section aria-labelledby="stats-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>Cada página conta</p>
                <h2 id="stats-title">Sua jornada em números</h2>
              </div>
              <span className={styles.year}>Todo o período</span>
            </div>

            {error && <p className={styles.feedback} role="alert">{error}</p>}
            {loading && <p className={styles.feedback} role="status">Carregando suas leituras...</p>}
            <div className={styles.statsGrid} aria-busy={loading}>
              {readingStats.map((stat) => (
                <Link to={`/shelves/books?status=${stat.status}`} className={styles.statCard} key={stat.label}>
                  <span className={styles.statTop}><span className={styles.statIcon} aria-hidden="true">{stat.icon}</span><span className={styles.statArrow} aria-hidden="true">↗</span></span>
                  <strong>{loading || error ? '—' : stat.value.toLocaleString('pt-BR')}</strong>
                  <span className={styles.statLabel}>{stat.label}</span>
                  <span className={styles.statDetail}>{stat.detail}</span>
                </Link>
              ))}
            </div>
            {!loading && !error && completed.some((item) => !item.book.pageCount) && <p className={styles.feedback}>Livros sem total de páginas informado não entram na soma de páginas lidas.</p>}
          </section>

          <div className={styles.detailsGrid}>
            <section className={styles.panel} aria-labelledby="currently-reading-title">
              <div className={styles.panelHeading}>
                <div>
                  <p className={styles.eyebrow}>Entre as suas páginas</p>
                  <h2 id="currently-reading-title">Leituras recentes</h2>
                </div>
                <span className={styles.count}>{loading || error ? '—' : `${recentBooks.length} ${recentBooks.length === 1 ? 'título' : 'títulos'}`}</span>
              </div>

              <div className={styles.bookList}>
                {!loading && !error && recentBooks.length === 0 && <div className={styles.emptyReading}><span aria-hidden="true">✧</span><h3>O primeiro capítulo espera por você.</h3><p>Encontre uma história no catálogo e comece a preencher este espaço.</p><Link to="/catalog">Descobrir livros ↗</Link></div>}
                {recentBooks.map((item, index) => (
                  <article className={styles.book} key={item.id}>
                    <div className={`${styles.cover} ${styles[`cover${index + 1}`]}`} aria-hidden="true">
                      {item.book.thumbnailUrl ? <img src={item.book.thumbnailUrl} alt="" /> : item.book.title}
                    </div>
                    <div className={styles.bookInfo}>
                      <h3>{item.book.title}</h3>
                      <p>{item.book.authors?.join(', ') || 'Autor não informado'}</p>
                      <div className={styles.bookMeta}>
                        <span className={`${styles.status} ${item.status === 'read' ? styles.completedStatus : ''}`}>{statuses[item.status]}</span>
                        <span>{item.progress ?? 0}%</span>
                      </div>
                      {item.progress > 0 && (
                        <div className={styles.progressTrack} aria-label={`${item.progress}% de progresso`}>
                          <span style={{ width: `${item.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <Link className={styles.bookLink} to={item.shelfLinks?.[0]?.shelfId ? `/shelves/books?shelfId=${item.shelfLinks[0].shelfId}` : '/shelves/books'} aria-label={`Ver estante de ${item.book.title}`}>↗</Link>
                  </article>
                ))}
              </div>
              {recentBooks.length > 0 && <Link className={styles.panelLink} to="/shelves/books">Ver minha biblioteca completa <span aria-hidden="true">↗</span></Link>}
            </section>
            <aside className={styles.sideColumn}><QuoteCard /><section className={`${styles.panel} ${styles.discoverPanel}`}><span aria-hidden="true">✦</span><p className={styles.eyebrow}>O próximo capítulo</p><h2>Ainda há mundos<br />para descobrir.</h2><p>Sua próxima leitura favorita pode estar a uma busca de distância.</p><Link to="/catalog">Explorar o catálogo <span aria-hidden="true">↗</span></Link></section></aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default Profile;
