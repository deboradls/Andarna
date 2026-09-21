import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';

function AuthCallback() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    authApi.me()
      .then(({ user }) => {
        setUser(user);
        navigate('/home', { replace: true });
      })
      .catch(() => setError('Não foi possível concluir o login com Google. Tente novamente.'));
  }, [navigate, setUser]);

  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--color-text-secondary)' }}>{error || 'Concluindo seu acesso...'}</main>;
}

export default AuthCallback;
