import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/Header';

import './App.css';

//import GameyBotTest from './GameyBotTest';

// Importar los componentes
import RegisterForm from './pages/Register';
import Login from './pages/Login';

import Game from './pages/Game';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/game" element={<Game />} />

          <Route element={<ProtectedRoute />}>
            {/* Aqui iran luego las rutas protegidas.*/}
          </Route>

          { /* Temporalmente sin ProtectedRoute ya que el login no está implementado */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>

        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
