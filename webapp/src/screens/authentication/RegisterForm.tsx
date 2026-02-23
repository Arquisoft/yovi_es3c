import React, { useState } from 'react';

interface RegisterFormProps {
  onSuccess: (user: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({onSuccess}) => {

  const MIN_PASSWORD_LENGTH = 6;

  // Datos del usuario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mensajes de exito / error
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // 1. Validaciones de presencia
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    // 2. Validación de coincidencia
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // 3. Validación de longitud (Opcional pero recomendado)
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }

    // Ahora que los datos son válidos, indicamos que esta cargando.
    setLoading(true);

    // Envío de datos al servicio de usuarios
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
      const res = await fetch(`${API_URL}/createuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username, 
          password,
          // Por seguridad extra, mandamos también el confirm para que el back lo verifique
          confirmPassword
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Limpiamos los campos
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setResponseMessage(data.message);
        // Registro ejecutado correctamente
        onSuccess(data.username)  // Devolvemos el username
      } else {
        setError(data.error || 'Server error');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">

      <div className="form-group">
        <label htmlFor="username">Nombre de usuario</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Repetir contraseña</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="form-input"
          required
        />
      </div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Cargando...' : 'Crear cuenta'}
      </button>

      {responseMessage && (
        <div className="success-message" style={{ marginTop: 12, color: 'green' }}>
          {responseMessage}
        </div>
      )}

      {error && (
        <div className="error-message" style={{ marginTop: 12, color: 'red' }}>
          {error}
        </div>
      )}
    </form>
  );
};

export default RegisterForm;
