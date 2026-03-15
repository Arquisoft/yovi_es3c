import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      const response = await fetch('http://localhost:3000/createuser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
      authentication.login({ id: data.id, username: data.username });
        navigate('/dashboard');
      } else {
        setError(data.error || 'Error al registrarse');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
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
        {error && <p style={{color:'red'}}>{error}</p>}
        <button type="submit" className='submit-button'>Registrarse</button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
};

export default Register;