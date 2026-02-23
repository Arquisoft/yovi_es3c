import { useState } from 'react';
import RegisterForm from "./RegisterForm";
import type { AppScreen } from '../../AppScreen';

interface AuthScreenProps {
  setCurrentScreen: (screen: AppScreen) => void;
  setUser: (user: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({setCurrentScreen, setUser}) => {

  const [authMethod, setAuthMethod] = useState<'register' | 'login'>('login');

  const onSuccess = (user: string) => {
      setUser(user);
      setCurrentScreen("MENU");
  }

  const toggleAuth = () => {
    setAuthMethod(authMethod === 'register' ? 'login' : 'register');
  }

  return (
      <div className="authentication">
          {authMethod === 'login' && (
            <>
              <h3>Iniciar sesión</h3>
                <p>En desarrollo</p>
              <div>
                <p>¿No tienes cuenta?</p>
                <button onClick={toggleAuth} className="link-button">
                  Crea una aquí
                </button>
              </div>
            </>
          )}

          {authMethod === 'register' && (
            <>
              <h3>Registro</h3>
              <RegisterForm onSuccess={onSuccess}></RegisterForm>
              <div>
                <p>¿Ya tienes una cuenta?</p>
                <button onClick={toggleAuth} className="link-button">
                  Inicia sesión aquí
                </button>
              </div>
            </>
          )}

      </div>
  );
}

export default AuthScreen;