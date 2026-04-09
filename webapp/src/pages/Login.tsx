import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const authentication = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      const data = await userService.login(username, password);
      authentication.login({ id: data.id, username: data.username, token: data.token });
      navigate('/dashboard');
    } catch (err) {
      console.error("Error en login:", err);
      setError(err instanceof Error ? err.message : "Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>

      <form className="shared-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </div>

        {error && <p className='login-error'>{error}</p>}

        <button type="submit" className="submit-button">
          Iniciar Sesión
        </button>
      </form>
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
};

export default Login;
