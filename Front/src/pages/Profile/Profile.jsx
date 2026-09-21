import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Profile.module.css';

const readingStats = [
  { label: 'Livros lidos', value: '24', icon: '◈' },
  { label: 'Em leitura', value: '3', icon: '◉' },
  { label: 'Quero ler', value: '18', icon: '⌑' },
  { label: 'Páginas lidas', value: '7.248', icon: '↟' },
];

const recentBooks = [
  { title: 'Quarta Asa', author: 'Rebecca Yarros', status: 'Lendo', progress: 62, cover: 'QUARTA ASA' },
  { title: 'A Vida Invisível de Addie LaRue', author: 'V. E. Schwab', status: 'Concluído', progress: 100, cover: 'ADDIE LARUE' },
  { title: 'O Priorado da Laranjeira', author: 'Samantha Shannon', status: 'Quero ler', progress: 0, cover: 'O PRIORADO' },
];

function Profile() {
  const { user } = useAuth();
  const email = user?.email ?? 'leitor@andarna.com';
  const displayName = user?.name || email.split('@')[0];
  const firstLetter = displayName.charAt(0).toUpperCase();
  const memberSince = user?.createdAt
    ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(user.createdAt))
    : 'setembro de 2026';

  return (
    <>
      <Navbar />

      <main className={styles.profilePage}>
        <section className={styles.profileHeader} aria-labelledby="profile-name">
          <div className={styles.headerGlow} />
          <div className={styles.profileContent}>
            <div className={styles.avatar} aria-hidden="true">{firstLetter}</div>

            <div className={styles.identity}>
              <p className={styles.eyebrow}>Meu perfil</p>
              <h1 id="profile-name">{displayName}</h1>
              <p className={styles.email}>{email}</p>
              <p className={styles.memberSince}>Parte da jornada desde {memberSince}</p>
            </div>

            <button className={styles.editButton} type="button" disabled title="Edição de perfil em breve">
              Editar perfil
            </button>
          </div>
        </section>

        <div className={styles.content}>
          <section aria-labelledby="stats-title">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.eyebrow}>Visão geral</p>
                <h2 id="stats-title">Sua jornada em números</h2>
              </div>
              <span className={styles.year}>2026</span>
            </div>

            <div className={styles.statsGrid}>
              {readingStats.map((stat) => (
                <article className={styles.statCard} key={stat.label}>
                  <span className={styles.statIcon}>{stat.icon}</span>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          </section>

          <div className={styles.detailsGrid}>
            <section className={styles.panel} aria-labelledby="currently-reading-title">
              <div className={styles.panelHeading}>
                <div>
                  <p className={styles.eyebrow}>Agora</p>
                  <h2 id="currently-reading-title">Leituras recentes</h2>
                </div>
                <span className={styles.count}>3 títulos</span>
              </div>

              <div className={styles.bookList}>
                {recentBooks.map((book, index) => (
                  <article className={styles.book} key={book.title}>
                    <div className={`${styles.cover} ${styles[`cover${index + 1}`]}`} aria-hidden="true">
                      {book.cover}
                    </div>
                    <div className={styles.bookInfo}>
                      <h3>{book.title}</h3>
                      <p>{book.author}</p>
                      <div className={styles.bookMeta}>
                        <span className={styles.status}>{book.status}</span>
                        {book.progress > 0 && <span>{book.progress}%</span>}
                      </div>
                      {book.progress > 0 && (
                        <div className={styles.progressTrack} aria-label={`${book.progress}% de progresso`}>
                          <span style={{ width: `${book.progress}%` }} />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className={styles.sideColumn}>
              <section className={styles.panel} aria-labelledby="reading-goal-title">
                <p className={styles.eyebrow}>Meta anual</p>
                <h2 id="reading-goal-title">36 livros em 2026</h2>
                <div className={styles.goalValue}><strong>24</strong><span>de 36 concluídos</span></div>
                <div className={styles.goalTrack}><span /></div>
                <p className={styles.goalNote}>Você está a 12 livros da sua meta.</p>
              </section>

              <section className={`${styles.panel} ${styles.quotePanel}`} aria-label="Frase favorita">
                <span className={styles.quoteMark}>“</span>
                <p>Uma leitora vive mil vidas antes de morrer.</p>
                <span>George R. R. Martin</span>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

export default Profile;
