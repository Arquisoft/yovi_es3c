import { Link } from 'react-router-dom';
import logo from '../assets/YoviLogo300.png';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export function Header() {

  const authentication = useAuth();
  
  return (
    <header className="header">
      <div className="header-container">
        <img src={logo} alt="YoviLogo" />
        
        <nav className="header-nav">
          <Link to="/dashboard" className="nav-link">Jugar</Link>

          {!authentication.getUser() && 
            (
              <div className='nav-account'>
                <Link to="/login" className="nav-link">Iniciar Sesión</Link>
                <Link to="/register" className="nav-link">Registrarme</Link>
              </div>
            )
          }

          {authentication.getUser() && 
            (
              <div className='nav-account'>
                <p className='nav-link'>{authentication.getUser()?.username}</p>
                <Link to="/login" className="nav-link logout" onClick={authentication.logout}>Cerrar sesión</Link>
              </div>
            )
          }
          
        </nav>
      </div>
    </header>
  );
}
