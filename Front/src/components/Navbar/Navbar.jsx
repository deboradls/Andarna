import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import styles from './Navbar.module.css';
import logo from '../../assets/logo/logo_andarna.png';

function Navbar() {

    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState('');
    const avatarInitial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);
        setLogoutError('');

        try {
            await logout();
            navigate('/', { replace: true });
        } catch {
            setLogoutError('Não foi possível sair. Tente novamente.');
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <nav className={styles.navbar}>

            {/* Logo */}
            <div
                className={styles.brand}
                onClick={() => navigate('/home')}
            >
                <img
                    src={logo}
                    alt="Logo Andarna"
                    className={styles.logoIcon}
                />

                <span className={styles.logoName}>
                    ANDARNA
                </span>
            </div>


            {/* Navegação */}
            <div className={styles.navigation}>

                {/* Início */}
                <NavLink
                    to="/home"
                    className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                >
                    Início
                </NavLink>


                {/* Estantes */}
                <div className={styles.dropdownContainer}>

                    <button
                        className={`${styles.navLink} ${styles.dropdownButton}`}
                        onClick={() => navigate('/shelves/books')}
                    >
                        Estantes

                        {/* <span
                            className={`${styles.arrow} ${openMenu === 'shelves'
                                ? styles.arrowOpen
                                : ''
                                }`}
                        >
                            ▾
                        </span> */}
                    </button>


                    {/* {openMenu === 'shelves' && (
                        <div className={styles.dropdown}>

                            <NavLink
                                to="/shelves/books"
                                className={styles.dropdownItem}
                            >
                                <span>📚</span>
                                Livros
                            </NavLink>

                            <NavLink
                                to="/shelves/manga"
                                className={styles.dropdownItem}
                            >
                                <span>📖</span>
                                Mangás
                            </NavLink>

                        </div>
                    )} */}

                </div>


                {/* Atualizações */}
                {/* <NavLink
                    to="/updates"
                    className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                >
                    Atualizações
                </NavLink> */}


                {/* Catálogo */}
                <NavLink
                    to="/catalog"
                    className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                >
                    Catálogo
                </NavLink>
                <NavLink to="/quotations" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                    Citações
                </NavLink>

            </div>


            {/* Área do usuário */}
            <div className={styles.userArea}>

                <button
                    className={styles.userButton}
                    onClick={() => navigate('/profile')}
                    aria-label="Abrir perfil"
                >
                    <span className={styles.userAvatar}>
                        {avatarInitial}
                    </span>
                </button>

                <button
                    type="button"
                    className={`${styles.navLink} ${styles.logoutButton}`}
                    onClick={handleLogout}
                    disabled={loggingOut}
                >
                    {loggingOut ? 'Saindo...' : 'Sair'}
                </button>

                {logoutError && (
                    <p className={styles.logoutError} role="alert">
                        {logoutError}
                    </p>
                )}

            </div>

        </nav>
    );
}

export default Navbar;
