/**
 * userService.ts
 * 
 * Servicio centralizado para operaciones de usuario:
 * - Login
 * - Registro
 * - Validación de token
 */

import { httpClient } from '../utils/httpClient';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface LoginResponse {
  message: string;
  token: string;
  id: string;
  username: string;
}

interface ValidateResponse {
  valid: boolean;
  id: string;
  username: string;
}

interface UserData {
  id: string;
  username: string;
}

/**
 * Login con usuario y contraseña
 */
export const login = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const response = await httpClient(`${API_URL}/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuth: true, // No necesitamos token para login
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al iniciar sesión');
  }

  return response.json();
};

/**
 * Registro de nuevo usuario
 */
export const register = async (
  username: string,
  password: string,
  confirmPassword: string
): Promise<LoginResponse> => {
  const response = await httpClient(`${API_URL}/createuser`, {
    method: 'POST',
    body: JSON.stringify({ username, password, confirmPassword }),
    skipAuth: true, // No necesitamos token para registrar
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear usuario');
  }

  return response.json();
};

/**
 * Validar token JWT actual
 * Se usa al abrir la app para verificar si la sesión está activa
 */
export const validateToken = async (): Promise<UserData | null> => {
  const token = localStorage.getItem('token');

  if (!token) {
    return null;
  }

  try {
    const response = await httpClient(`${API_URL}/validate`, {
      method: 'GET',
    });

    if (!response.ok) {
      // Token inválido o expirado
      console.log("Token exprado. Redirigiendo al login.")
      return null;
    }

    const data: ValidateResponse = await response.json();
    return {
      id: data.id,
      username: data.username,
    };
  } catch (err) {
    // Error en la validación, remover token
    localStorage.removeItem('token');
    return null;
  }
};
