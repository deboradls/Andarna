import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Login.module.css';
import logo from '../../assets/logo/logo_andarna.png';
import { supabase } from '../../services/supabase';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();

        setError('');
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError('E-mail ou senha incorretos.');
            setLoading(false);
            return;
        }

        navigate('/home');
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:5173/home',
            },
        });

        if (error) {
            console.error('Erro ao fazer login com Google:', error);
        }
    };

    return (
        <main className={styles.loginPage}>

            {/* Lado esquerdo — identidade da marca */}
            <section className={styles.brandSection}>
                <div className={styles.brandContent}>
                    <img
                        src={logo}
                        alt="Logo Andarna"
                        className={styles.logoIcon}
                    />

                    <h1 className={styles.logo}>
                        ANDARNA
                    </h1>

                    <p className={styles.slogan}>
                        Sua jornada entre páginas
                    </p>
                </div>
            </section>


            {/* Lado direito — formulário */}
            <section className={styles.formSection}>
                <div className={styles.formContainer}>

                    <header className={styles.header}>
                        <h2>Bem-vindo</h2>

                        <p>
                            Entre na sua conta e continue sua jornada.
                        </p>
                    </header>


                    <form
                        className={styles.form}
                        onSubmit={handleLogin}
                    >

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">
                                E-mail
                            </label>

                            <input
                                type="email"
                                id="email"
                                placeholder="Digite seu e-mail"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                            />
                        </div>


                        <div className={styles.inputGroup}>
                            <label htmlFor="password">
                                Senha
                            </label>

                            <input
                                type="password"
                                id="password"
                                placeholder="Digite sua senha"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>


                        <div className={styles.formOptions}>

                            <label className={styles.remember}>
                                <input type="checkbox" />
                                <span>Lembrar de mim</span>
                            </label>

                            <a href="#">
                                Esqueci minha senha
                            </a>

                        </div>

                        {error && (
                            <p className={styles.error}>
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className={styles.loginButton}
                            disabled={loading}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>

                        <div className={styles.divider}>
                            <span>ou</span>
                        </div>

                        <button
                            type="button"
                            className={styles.googleButton}
                            onClick={handleGoogleLogin}
                        >
                            <svg
                                className={styles.googleIcon}
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    fill="#4285F4"
                                    d="M21.35 12.27c0-.72-.06-1.42-.18-2.09H12v3.96h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z"
                                />

                                <path
                                    fill="#34A853"
                                    d="M12 21.82c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.75 9.75 0 0 0 12 21.82Z"
                                />

                                <path
                                    fill="#FBBC05"
                                    d="M6.54 13.9A5.86 5.86 0 0 1 6.23 12c0-.66.11-1.3.31-1.9V7.58H3.3A9.82 9.82 0 0 0 2.18 12c0 1.59.38 3.09 1.12 4.42l3.24-2.52Z"
                                />

                                <path
                                    fill="#EA4335"
                                    d="M12 6.07c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.13 14.63 2.18 12 2.18a9.75 9.75 0 0 0-8.7 5.4l3.24 2.52C7.31 7.79 9.46 6.07 12 6.07Z"
                                />
                            </svg>

                            <span>Continuar com Google</span>
                        </button>

                    </form>


                    <p className={styles.registerText}>
                        Ainda não possui uma conta?

                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                        >
                            Criar conta
                        </button>
                    </p>

                </div>
            </section>

        </main>
    );
}

export default Login;