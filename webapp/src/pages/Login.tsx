import React from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      
        <p>Formulario de login en desarrollo...</p>

      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>

      <p>
        Accede al tablero del juego: <Link to="/gameboard">Click aquí</Link>
      </p>

    </div>
  );
};

export default Login;