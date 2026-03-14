import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
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
        setIsSuccess(true); 
      } else {
        setError(data.error || 'Error al registrarse');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  if (isSuccess) {
    return (
      <div className="auth-container">
        <h2 className="success-title">¡Usuario creado con éxito!</h2>
        <p>Bienvenido, {username}. Ya puedes acceder a tu cuenta.</p>
        <Link to="/login" className="submit-button">
          Ir al inicio de sesión
        </Link>
      </div>
    );
  }

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