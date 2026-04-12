import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as userService from '../services/userService';

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const authentication = useAuth();
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validación básica antes de enviar
    if (!username || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      const data = await userService.register(username, password, confirmPassword);
      authentication.login({ id: data.id, username: data.username, token: data.token });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión con el servidor');
    }
  };

  return (
    <div className='auth-container'>
      <h2>Registro de Usuarios</h2>
      <form onSubmit={handleSubmit} className='shared-form'>
        <div className='form-group'>
          <label htmlFor="username">Usuario:</label>
          <input 
            id="username"
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            className="form-input"
          />
        </div>
        <div className='form-group'>
          <label htmlFor="password">Contraseña:</label>
          <input 
            id="password"
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="form-input"
          />
        </div>
        <div className='form-group'>
          <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <input 
            id="confirmPassword"
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            className="form-input"
          />
        </div>
        {error && <p data-testid="error-message" style={{color:'red'}}>{error}</p>}
        <button type="submit" className='submit-button'>Registrarse</button>
      </form>
      <p className="login-register-text">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
};

export default Register;