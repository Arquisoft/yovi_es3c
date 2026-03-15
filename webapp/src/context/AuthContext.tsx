import React, { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

// 1. Definimos la interfaz para el usuario
interface User {
  id: string;
  username: string;
}

// 2. Definimos qué valores expondrá el contexto
interface AuthContextType {
  user: User | null;
  login: (userData: { id: string; username: string }) => void;
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
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parseando el usuario del localStorage", error);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: { id: string; username: string }) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const getUser = (): User | null => user;

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getUser }}>
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