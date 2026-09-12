import styles from './Home.module.css';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/Navbar/Navbar';

function Home() {
  const { user, logout } = useAuth();

  return (
    <>

      <Navbar />

      <main className={styles.home}>
        <h1>Bem-vindo ao Andarna ✨</h1>

        <p>
          Sua jornada entre páginas começa aqui.
        </p>

        <p>
          Usuário: {user?.email}
        </p>

        <button onClick={logout}>
          Sair
        </button>
      </main>

    </>
  );
}

export default Home;