import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { Header } from './components/Header';

import './App.css';

// Importar los componentes
import Register from './pages/Register';
import Login from './pages/Login';
import Ranking from './pages/Ranking';

import Game from './pages/Game';
import { Dashboard } from './pages/Dashboard';
import { useEffect } from 'react';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent/>
      </BrowserRouter>
    </AuthProvider>
  );
}

/*
 * Como useLocation tiene que estar definido dentro de BrouserRouter es necesaria esta función.
 */
function AppContent() {
  
  // Función para que cuando se cambie de pagina se resetee el scroll.
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0,0);
  }, [location.pathname]);

  return (
    <>
      <Header />
      <main className="main-content">
        <Routes>

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/game" element={<Game />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
    </>
  );
}
