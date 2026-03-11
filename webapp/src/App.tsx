import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import './App.css';

//import GameyBotTest from './GameyBotTest';

// Importar los componentes
import RegisterForm from './pages/Register';
import Login from './pages/Login';

import logo from './assets/YoviLogo300.png';
import Game from './pages/Game';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <img src={logo} alt="YoviLogo300"/>
        <h2>Grupo ES3C</h2>
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

        {/* Temporalmente para poder seguir probando la conexión a GameY */}
        { /*<GameyBotTest />*/ }

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
