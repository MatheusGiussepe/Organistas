import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Rota protegida: redireciona para /login se não houver usuário autenticado.
 * Se onlyAdmin = true, exige que o usuário seja admin (senão manda pra /lista).
 */
export default function ProtectedRoute({ children, onlyAdmin = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-center">
        <div className="loader" aria-label="Carregando" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (onlyAdmin && user.role !== 'admin') return <Navigate to="/lista" replace />;
  return children;
}
