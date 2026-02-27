import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import './App.css';

import GameyBotTest from './GameyBotTest';

// Importar los componentes
import RegisterForm from './pages/Register';
import Login from './pages/Login';
import Menu from './pages/Menu';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <h2>Yovi grupo es3c</h2>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterForm />} />
         
          <Route element={<ProtectedRoute/>}>
            <Route path="/menu" element={<Menu />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>

        {/* Temporalmente para poder seguir probando la conexión a GameY */}
        <GameyBotTest />

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
