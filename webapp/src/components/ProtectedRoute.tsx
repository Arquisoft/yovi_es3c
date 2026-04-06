import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, isGuest } = useAuth();

  // Si no hay usuario, redirigimos al login
  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, permitimos el acceso a las rutas hijas
  return <Outlet />;
};