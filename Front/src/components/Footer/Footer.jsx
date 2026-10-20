import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo/logo_andarna.png';
import styles from './Footer.module.css';

function Footer() {
  const { user } = useAuth();

  return <footer className={styles.footer}>
    <div className={styles.content}>
      <div className={styles.about}>
        <Link to={user ? '/home' : '/'} className={styles.brand} aria-label="Andarna — início">
          <img src={logo} alt="" width="38" height="38" />
          <span>ANDARNA</span>
        </Link>
        <p>Um lugar para suas histórias. Organize sua biblioteca, acompanhe suas leituras e guarde suas impressões a cada página.</p>
      </div>
      <nav className={styles.navigation} aria-label="Navegação do rodapé">
        <h2>{user ? 'Explore' : 'Comece sua leitura'}</h2>
        {user ? <>
          <Link to="/home">Início</Link>
          <Link to="/shelves/books">Minhas estantes</Link>
          <Link to="/catalog">Catálogo de livros</Link>
          <Link to="/quotations">Minhas citações</Link>
          <Link to="/profile">Meu perfil</Link>
        </> : <>
          <Link to="/">Entrar</Link>
          <Link to="/register">Criar uma conta</Link>
        </>}
      </nav>
      <div className={styles.note}>
        <h2>Cada página conta</h2>
        <p>Do primeiro capítulo à última página, sua próxima história começa aqui.</p>
        <span>Informações de livros via Google Books.</span>
      </div>
    </div>
    <div className={styles.bottom}>
      <small>© {new Date().getFullYear()} Andarna. Todos os direitos reservados.</small>
      <span>Feito para quem ama ler.</span>
    </div>
  </footer>;
}

export default Footer;
