import { Link } from 'react-router-dom';
import logo from '../assets/YoviLogo300.png';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export function Header() {

  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <img src={logo} alt="YoviLogo" />
        
        <nav className="header-nav">

          <Link to="/dashboard" className="nav-link">
            {user && "Jugar" || "Jugar como invitado"}
          </Link>

          {user && 
            <Link to="/ranking" className="nav-link">Ranking</Link>
          }

          {!user && 
            (
              <div className='nav-account'>
                <Link to="/login" className="nav-link">Iniciar Sesión</Link>
                <Link to="/register" className="nav-link">Registrarme</Link>
              </div>
            )
          }

          {user && 
            (
              <div className='nav-account'>
                <p className='nav-link'>{user.username}</p>
                <Link to="/login" className="nav-link logout" onClick={(e) => { e.preventDefault(); logout(); }}>Cerrar sesión</Link>
              </div>
            )
          }
          
        </nav>
      </div>
    </header>
  );
}
