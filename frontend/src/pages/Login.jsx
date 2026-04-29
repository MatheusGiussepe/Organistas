import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(username.trim(), password);
      // Admin → tela detalhada; visualizador → simplificada
      navigate(u.role === 'admin' ? '/admin' : '/lista', { replace: true });
    } catch (err) {
      setError(err.message || 'Falha ao entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="staff" aria-hidden>
            <span className="note">♪</span>
            <span className="note">♫</span>
            <span className="note">♬</span>
          </div>
          <h1>Lista de Organistas</h1>
          <p className="subtitle">Faça login para acessar o conteúdo</p>
        </div>

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <span>Usuário</span>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && <div className="alert-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          <p className="hint">Sua sessão fica salva por 7 dias neste dispositivo.</p>
        </form>
      </div>
    </div>
  );
}
