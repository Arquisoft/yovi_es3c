import { Link, useNavigation } from 'react-router-dom';
import logo from '../assets/YoviLogo300.png';
import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <img src={logo} alt="YoviLogo" />
        
        <nav className="header-nav">
          <Link to="/dashboard" className="nav-link">Jugar</Link>
          <div className='nav-account'>
            <Link to="/login" className="nav-link">Iniciar Sesión</Link>
            <Link to="/register" className="nav-link">Registrarme</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
