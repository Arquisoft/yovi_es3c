import './App.css'
import { useState } from 'react';
import type { AppScreen } from './AppScreen';
import AuthScreen from './screens/authentication/AuthScreen';
import reactLogo from './assets/react.svg'

function App() {

  // Estado de la aplicación (Ventana) -> Autenticación, Menú o Juego.
  const [currentScreen, setCurrentScreen] = useState<AppScreen>("AUTHENTICATION"); // Pantalla inicial
  // Usuario actual de la app.
  const [user, setUser] = useState<string | null>(null);

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h2>Welcome to the Software Arquitecture 2025-2026 course</h2>

      {currentScreen == "AUTHENTICATION" && (
        <AuthScreen 
          setCurrentScreen={setCurrentScreen}
          setUser={setUser}
        ></AuthScreen>
      )}
      
      {currentScreen == "MENU" && (
        <>
          <h3>Menu de prueba</h3>
          <p>{`Bienvenido ${user}`}</p>
          <p>En desarrollo</p>
        </>
      )}

    </div>
  );
}

export default App;
