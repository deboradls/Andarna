import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import styles from './Navbar.module.css';
import logo from '../../assets/logo/logo_andarna.png';

function Navbar() {
    const [openMenu, setOpenMenu] = useState(null);

    const navigate = useNavigate();
    const { user } = useAuth();
    const avatarInitial = (user?.name || user?.email || '?').charAt(0).toUpperCase();

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const closeMenu = () => {
        setOpenMenu(null);
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
                    onClick={closeMenu}
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
                                onClick={closeMenu}
                            >
                                <span>📚</span>
                                Livros
                            </NavLink>

                            <NavLink
                                to="/shelves/manga"
                                className={styles.dropdownItem}
                                onClick={closeMenu}
                            >
                                <span>📖</span>
                                Mangás
                            </NavLink>

                        </div>
                    )} */}

                </div>


                {/* Minha Jornada */}
                <div className={styles.dropdownContainer}>

                    <button
                        className={`${styles.navLink} ${styles.dropdownButton}`}
                        onClick={() => toggleMenu('journey')}
                    >
                        Minha Jornada

                        <span
                            className={`${styles.arrow} ${openMenu === 'journey'
                                ? styles.arrowOpen
                                : ''
                                }`}
                        >
                            ▾
                        </span>
                    </button>


                    {openMenu === 'journey' && (
                        <div className={styles.dropdown}>

                            <NavLink
                            to="/shelves/books?status=read"
                                className={styles.dropdownItem}
                                onClick={closeMenu}
                            >
                                <span>📚</span>
                                Lidos
                            </NavLink>

                            <NavLink
                            to="/shelves/books?status=reading"
                                className={styles.dropdownItem}
                                onClick={closeMenu}
                            >
                                <span>📖</span>
                                Lendo
                            </NavLink>

                            <NavLink
                            to="/shelves/books?status=want_to_read"
                                className={styles.dropdownItem}
                                onClick={closeMenu}
                            >
                                <span>🔖</span>
                                Quero ler
                            </NavLink>

                            <NavLink
                            to="/shelves/books?status=abandoned"
                                className={styles.dropdownItem}
                                onClick={closeMenu}
                            >
                                <span>🚫</span>
                                Abandonados
                            </NavLink>

                            <NavLink
                                to="/journey/favorites"
                                className={styles.dropdownItem}
                                onClick={closeMenu}
                            >
                                <span>❤️</span>
                                Favoritos
                            </NavLink>

                        </div>
                    )}

                </div>


                {/* Atualizações */}
                <NavLink
                    to="/updates"
                    className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                    onClick={closeMenu}
                >
                    Atualizações
                </NavLink>


                {/* Catálogo */}
                <NavLink
                    to="/catalog"
                    className={({ isActive }) =>
                        `${styles.navLink} ${isActive ? styles.active : ''}`
                    }
                    onClick={closeMenu}
                >
                    Catálogo
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

            </div>

        </nav>
    );
}

export default Navbar;
