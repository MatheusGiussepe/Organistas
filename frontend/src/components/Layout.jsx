import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Layout com cabeçalho musical.
 */
export default function Layout({ children }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand" aria-label="Lista de Organistas">
          <TrebleClef />
          <span>Lista de Organistas</span>
        </Link>

        {user && (
          <nav className="nav">
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                Detalhada
              </NavLink>
            )}
            <NavLink to="/lista" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              Simplificada
            </NavLink>
            <button className="btn-logout" onClick={onLogout} title="Encerrar sessão">
              <span aria-hidden style={{ marginRight: 6 }}>↩</span>Sair
            </button>
          </nav>
        )}
      </header>

      <main className="app-main">
        {children}
      </main>

      <footer className="app-footer">
        <span aria-hidden>♪ ♫ ♬</span>
        <span>&nbsp;Lista de Organistas &nbsp;</span>
        <span aria-hidden>♬ ♫ ♪</span>
      </footer>
    </div>
  );
}

function TrebleClef() {
  // Pequeno ícone de clave de sol em SVG
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 2c-2 2-2 5 0 7s3 4 1 7-5 3-5 0 3-3 4-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="9.5" cy="17.5" r="2.2" fill="currentColor" />
    </svg>
  );
}
