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
  isGuest: boolean;
  login: (userData: { id: string; username: string }) => void;
  loginAsGuest: () => void;
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
  const [isGuest, setIsGuest] = useState<boolean>(false);
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
    setIsGuest(false);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const loginAsGuest = () => {
    setUser({ id: 'guest', username: 'Invitado' });
    setIsGuest(true);
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('user');
  };

  const getUser = (): User | null => user;

  return (
    <AuthContext.Provider value={{ user, isGuest, login, loginAsGuest, logout, loading, getUser }}>
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