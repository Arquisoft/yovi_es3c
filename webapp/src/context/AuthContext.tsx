import React, { useMemo, createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import * as userService from '../services/userService';

// 1. Definimos la interfaz para el usuario
interface User {
  id: string;
  username: string;
}

// 2. Definimos qué valores expondrá el contexto
interface AuthContextType {
  user: User | null;
  login: (userData: { id: string; username: string; token: string }) => void;
  logout: () => void;
  loading: boolean;
  getUser: () => User | null;
}

// 3. Creamos el contexto con un valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Validar token al montar el componente
    const validateAuth = async () => {
      try {
        const userData = await userService.validateToken();
        if (userData) {
          setUser(userData);
        } else {
          // Token inválido o expirado
          logout();
        }
      } catch (error) {
        console.error("Error validando token:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateAuth();
  }, []);

  const login = (userData: { id: string; username: string; token: string }) => {
    setUser({ id: userData.id, username: userData.username });
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const getUser = (): User | null => user;

  const contextValue = useMemo(
    () => ({ user, login, logout, loading, getUser }),
    [user, login, logout, loading, getUser]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 4. Hook personalizado con comprobación de nulidad para TS
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};