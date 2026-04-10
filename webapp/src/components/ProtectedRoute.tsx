import {  Outlet } from 'react-router-dom';

export const ProtectedRoute = () => {

  // Si hay usuario y si no tambien (seria invitado), permitimos el acceso a las rutas hijas
  return <Outlet />;
};