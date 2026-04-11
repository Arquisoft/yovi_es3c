import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/YoviLogo300.png';
import { useAuth } from '../context/AuthContext';
import './Header.css';
import { useState } from 'react'; 
import HelpDialog from '../pages/HelpDialog'; 

export function Header() {

  const { user, logout } = useAuth();

  const location = useLocation(); 
  const isDashboard = location.pathname === '/dashboard'; 
  const [helpOpen, setHelpOpen] = useState(false); 

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <img src={logo} alt="YoviLogo" />
          
          {user && 
            (
              <div className='nav-account'>
                <p className='nav-link'>{user.username}</p>
              </div>
            )
          }
        </div>
        
        <nav className="header-nav">
          <Link to="/dashboard" className="nav-link">Jugar</Link>
          <Link to="/ranking" className="nav-link">Ranking</Link>
           {isDashboard && (
            <button className="help-nav-btn" onClick={() => setHelpOpen(true)}>Cómo jugar</button>
          )}
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
                <Link to="/login" className="nav-link logout" onClick={(e) => { e.preventDefault(); logout(); }}>Cerrar sesión</Link>
              </div>
            )
          }

          
        </nav>
         <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </header>
  );
}
