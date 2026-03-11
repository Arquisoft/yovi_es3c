import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import './App.css';

//import GameyBotTest from './GameyBotTest';

// Importar los componentes
import RegisterForm from './pages/Register';
import Login from './pages/Login';
import Menu from './pages/Menu';
import GameBoard from './pages/gui/GameBoard';
import logo from './assets/YoviLogo500.png';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <img src={logo} alt="YoviLogo500"/>
        <h2>Grupo ES3C</h2>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/gameboard" element={<GameBoard />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/menu" element={<Menu />} />
          </Route>

          { /* Temporalmente sin ProtectedRoute ya que el login no está implementado */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>

        {/* Temporalmente para poder seguir probando la conexión a GameY */}
        { /*<GameyBotTest />*/ }

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
