import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, getToken, setToken } from '../api/client.js';

const AuthContext = createContext(null);

/**
 * Decodifica payload do JWT (sem validar assinatura - só pra ler o role).
 * A validação de verdade acontece no backend.
 */
function decodeJwt(token) {
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-login: se já existe token válido, restaura sessão
  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    const payload = decodeJwt(token);
    const expired = !payload?.exp || payload.exp * 1000 < Date.now();
    if (expired) {
      setToken(null);
      setLoading(false);
      return;
    }

    // Confirma com o backend que o token ainda é aceito
    api.get('/api/auth/me')
      .then((res) => setUser(res.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  // Listener: o cliente HTTP dispara este evento ao receber 401
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('organistas:logout', onLogout);
    return () => window.removeEventListener('organistas:logout', onLogout);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.post('/api/auth/login', { username, password });
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
