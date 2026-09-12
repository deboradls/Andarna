import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styles from './Register.module.css';
import logo from '../../assets/logo/logo_andarna.png';
import { supabase } from '../../services/supabase';

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (event) => {
        event.preventDefault();

        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setLoading(false);

        if (data.session) {
            navigate('/home');
            return;
        }

        setSuccess(
            'Conta criada! Verifique seu e-mail para confirmar o cadastro.'
        );
    };

    return (
        <main className={styles.registerPage}>

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


            <section className={styles.formSection}>
                <div className={styles.formContainer}>

                    <header className={styles.header}>
                        <h2>Criar conta</h2>

                        <p>
                            Comece sua jornada entre páginas.
                        </p>
                    </header>


                    <form
                        className={styles.form}
                        onSubmit={handleRegister}
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
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
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
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                required
                            />
                        </div>


                        <div className={styles.inputGroup}>
                            <label htmlFor="confirmPassword">
                                Confirmar senha
                            </label>

                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="Digite sua senha novamente"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                required
                            />
                        </div>


                        {error && (
                            <p className={styles.error}>
                                {error}
                            </p>
                        )}


                        {success && (
                            <p className={styles.success}>
                                {success}
                            </p>
                        )}


                        <button
                            type="submit"
                            className={styles.registerButton}
                            disabled={loading}
                        >
                            {loading ? 'Criando conta...' : 'Criar conta'}
                        </button>

                    </form>


                    <p className={styles.loginText}>
                        Já possui uma conta?

                        <button
                            type="button"
                            onClick={() => navigate('/')}
                        >
                            Entrar
                        </button>
                    </p>

                </div>
            </section>

        </main>
    );
}

export default Register;