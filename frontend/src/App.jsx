import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import AdminList from './pages/AdminList.jsx';
import SimpleList from './pages/SimpleList.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="full-center" style={{ minHeight: '100vh' }}>
        <div className="loader" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute onlyAdmin>
            <AdminList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/lista"
        element={
          <ProtectedRoute>
            <SimpleList />
          </ProtectedRoute>
        }
      />

      {/* Default: admin vai pra /admin, viewer pra /lista */}
      <Route
        path="/"
        element={
          user
            ? <Navigate to={user.role === 'admin' ? '/admin' : '/lista'} replace />
            : <Navigate to="/login" replace />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
