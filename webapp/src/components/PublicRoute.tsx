import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente PublicRoute
 * 
 * Protege las rutas públicas (login y register) para que solo sean accesibles
 * si el usuario NO está autenticado.
 * 
 * Si el usuario está autenticado, redirige al dashboard.
 */
export const PublicRoute = () => {
  const { user } = useAuth();

  // Si hay usuario autenticado, redirigimos al dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si no hay usuario, permitimos el acceso a las rutas públicas
  return <Outlet />;
};
