import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!username || !password) {
      alert("Todos los campos son obligatorios"); 
      return;
    } 
    const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
    const response = await fetch(`${API_URL}/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }); 
    const data = await response.json(); 
    //aun por hacer
    //aaaaaaaaaaaaaaaaaa
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form className="shared-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Usuario:</label>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="form-input"
          />
        </div>

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
