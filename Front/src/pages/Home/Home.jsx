import Navbar from "../../components/Navbar/Navbar";
import styles from "./Home.module.css";

const mockHistoricos = [
  {
    id: 1,
    user: "Debora",
    initials: "D",
    book: "Chama de Ferro",
    author: "Rebecca Yarros",
    cover: "https://covers.openlibrary.org/b/isbn/9781649374172-L.jpg",
    progress: 72,
    description:
      "A história está ficando cada vez mais intensa. Estou completamente presa nessa leitura.",
    likes: 12,
    comments: 3,
    time: "há 2h",
  },
  {
    id: 2,
    user: "Luna",
    initials: "L",
    book: "Quarta Asa",
    author: "Rebecca Yarros",
    cover: "https://covers.openlibrary.org/b/isbn/9781649374042-L.jpg",
    progress: 86,
    description:
      "Finalmente cheguei naquela parte que todo mundo dizia para eu não comentar. Que livro!",
    likes: 24,
    comments: 7,
    time: "há 5h",
  },
  {
    id: 3,
    user: "Eleanor",
    initials: "E",
    book: "O Hobbit",
    author: "J. R. R. Tolkien",
    cover: "https://covers.openlibrary.org/b/isbn/9780261102217-L.jpg",
    progress: 34,
    description:
      "Uma aventura muito mais divertida do que eu esperava. Bilbo está começando a entrar de verdade nessa jornada.",
    likes: 8,
    comments: 2,
    time: "ontem",
  },
  {
    id: 4,
    user: "Theo",
    initials: "T",
    book: "O Nome do Vento",
    author: "Patrick Rothfuss",
    cover: "https://covers.openlibrary.org/b/isbn/9780756404741-L.jpg",
    progress: 58,
    description:
      "A construção desse mundo é simplesmente incrível. Quero descobrir cada vez mais sobre a história de Kvothe.",
    likes: 15,
    comments: 4,
    time: "ontem",
  },
];

function Home() {
  return (
    <>
      <Navbar />

      <main className={styles.home}>
        {/* ELEMENTOS DECORATIVOS */}
        <div className={styles.ambientGlow} />
        <div className={styles.starField}>
          <span>✦</span>
          <span>·</span>
          <span>✧</span>
          <span>·</span>
          <span>✦</span>
        </div>

        <div className={styles.container}>
          {/* HERO */}
          <header className={styles.hero}>
            <div className={styles.heroText}>
              <span className={styles.eyebrow}>
                ✦ DIÁRIO DE LEITURA
              </span>

              <h1>
                Entre páginas,
                <span> novas jornadas.</span>
              </h1>

              <p>
                Compartilhe o que está lendo, acompanhe seu progresso
                e descubra as histórias que estão fazendo parte da
                jornada de outros leitores.
              </p>
            </div>

            <div className={styles.heroSymbol}>
              <div className={styles.symbolCircle}>
                <span>✦</span>
              </div>

              <div className={styles.symbolOrbit} />
            </div>
          </header>

          {/* NOVA PUBLICAÇÃO */}
          <section className={styles.createPost}>
            <div className={styles.createHeader}>
              <div className={styles.avatar}>D</div>

              <div>
                <span className={styles.createLabel}>
                  SUA PRÓXIMA PÁGINA
                </span>

                <h2>O que você está lendo?</h2>
              </div>
            </div>

            <div className={styles.inputArea}>
              <span>
                Compartilhe um momento da sua leitura...
              </span>
            </div>

            <div className={styles.createFooter}>
              <button className={styles.readingButton}>
                <span>＋</span>
                Atualizar leitura
              </button>

              <button className={styles.publishButton}>
                Publicar
                <span>→</span>
              </button>
            </div>
          </section>

          {/* DIVISOR */}
          <div className={styles.sectionDivider}>
            <span />
            <div>
              <span>✦</span>
              <strong>JORNADAS RECENTES</strong>
            </div>
            <span />
          </div>

          {/* FEED */}
          <section className={styles.feed}>
            <div className={styles.feedTop}>
              <div>
                <span className={styles.feedEyebrow}>
                  O QUE ESTÁ SENDO LIDO
                </span>

                <h2>Entre páginas</h2>
              </div>

              <button className={styles.filterButton}>
                Mais recentes
                <span>⌄</span>
              </button>
            </div>

            <div className={styles.posts}>
              {mockHistoricos.map((historico) => (
                <article
                  className={styles.post}
                  key={historico.id}
                >
                  {/* CABEÇALHO DO POST */}
                  <div className={styles.postHeader}>
                    <div className={styles.userInfo}>
                      <div className={styles.postAvatar}>
                        {historico.initials}
                      </div>

                      <div>
                        <strong>{historico.user}</strong>

                        <p>
                          está em uma nova jornada
                          <span> · </span>
                          {historico.time}
                        </p>
                      </div>
                    </div>

                    <button className={styles.moreButton}>
                      •••
                    </button>
                  </div>

                  {/* CONTEÚDO DO LIVRO */}
                  <div className={styles.bookContent}>
                    <div className={styles.coverArea}>
                      <div className={styles.coverGlow} />

                      <div className={styles.coverWrapper}>
                        <img
                          src={historico.cover}
                          alt={`Capa de ${historico.book}`}
                          className={styles.cover}
                        />
                      </div>
                    </div>

                    <div className={styles.bookInfo}>
                      <span className={styles.bookStatus}>
                        LENDO AGORA
                      </span>

                      <h3>{historico.book}</h3>

                      <p className={styles.author}>
                        {historico.author}
                      </p>

                      <div className={styles.progressArea}>
                        <div className={styles.progressHeader}>
                          <span>Jornada percorrida</span>

                          <strong>
                            {historico.progress}%
                          </strong>
                        </div>

                        <div className={styles.progressBar}>
                          <div
                            className={styles.progress}
                            style={{
                              width: `${historico.progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PENSAMENTO */}
                  <div className={styles.thought}>
                    <span className={styles.quoteMark}>“</span>

                    <p>{historico.description}</p>
                  </div>

                  {/* INTERAÇÕES */}
                  <div className={styles.postFooter}>
                    <div className={styles.interactions}>
                      <button>
                        <span>♡</span>
                        {historico.likes}
                      </button>

                      <button>
                        <span>◌</span>
                        {historico.comments}
                      </button>
                    </div>

                    <button className={styles.shareButton}>
                      Compartilhar
                      <span>↗</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* RODAPÉ DECORATIVO */}
          <div className={styles.endDecoration}>
            <span>✧</span>
            <span />
            <span>✦</span>
            <span />
            <span>✧</span>
          </div>
        </div>
      </main>
    </>
  );
}

export default Home;
