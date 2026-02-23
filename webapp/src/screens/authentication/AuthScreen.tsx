import {useState} from 'react';
import RegisterForm from "./RegisterForm";

// Definimos qué props acepta el componente
interface AuthScreenProps {
  setCurrentScreen: (screen: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({setCurrentScreen}) => {

    // Login o Registro
    const [authMethod, setAuthMethod] = useState<string>('register'); // Ahora por defecto será registro, en un futuro login

    return (
        <div className="authentication">

            {authMethod == 'register' && (
              <RegisterForm></RegisterForm>
            )}
            
        </div>
    );
}

export default AuthScreen;