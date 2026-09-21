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
        <div className={styles.container}>
          {/* CABEÇALHO */}
          <header className={styles.header}>
            <div>
              <span className={styles.eyebrow}>
                SEU CANTO DE LEITURA
              </span>

              <h1>
                O que está
                <span> entre suas páginas?</span>
              </h1>

              <p>
                Compartilhe sua jornada, descubra novas histórias e
                acompanhe outros leitores.
              </p>
            </div>

            <div className={styles.headerDecoration}>
              <span>✦</span>
              <span>✧</span>
              <span>✦</span>
            </div>
          </header>

          {/* CRIAR PUBLICAÇÃO */}
          <section className={styles.createPost}>
            <div className={styles.createTop}>
              <div className={styles.avatar}>D</div>

              <div className={styles.inputFake}>
                <span>Fale sobre o livro que está lendo...</span>
              </div>
            </div>

            <div className={styles.createBottom}>
              <button className={styles.actionButton}>
                <span>📖</span>
                Atualizar leitura
              </button>

              <button className={styles.publishButton}>
                Publicar
              </button>
            </div>
          </section>

          {/* FEED */}
          <section className={styles.feed}>
            <div className={styles.feedHeader}>
              <h2>Atualizações</h2>

              <button className={styles.filterButton}>
                Mais recentes <span>⌄</span>
              </button>
            </div>

            <div className={styles.posts}>
              {mockHistoricos.map((historico) => (
                <article
                  className={styles.post}
                  key={historico.id}
                >
                  {/* USUÁRIO */}
                  <div className={styles.postHeader}>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {historico.initials}
                      </div>

                      <div>
                        <strong>{historico.user}</strong>

                        <p>
                          está lendo <span>✦</span>{" "}
                          {historico.time}
                        </p>
                      </div>
                    </div>

                    <button className={styles.moreButton}>
                      •••
                    </button>
                  </div>

                  {/* LIVRO */}
                  <div className={styles.bookContent}>
                    <div className={styles.coverWrapper}>
                      <img
                        src={historico.cover}
                        alt={`Capa de ${historico.book}`}
                        className={styles.cover}
                      />
                    </div>

                    <div className={styles.bookInfo}>
                      <span className={styles.bookLabel}>
                        LENDO AGORA
                      </span>

                      <h3>{historico.book}</h3>

                      <p className={styles.author}>
                        {historico.author}
                      </p>

                      {/* PROGRESSO */}
                      <div className={styles.progressArea}>
                        <div className={styles.progressInfo}>
                          <span>Progresso da leitura</span>

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

                  {/* DESCRIÇÃO */}
                  <p className={styles.description}>
                    “{historico.description}”
                  </p>

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
                      ↗
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Home;
