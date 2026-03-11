import logo from '../assets/YoviLogo300.png';
import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <img src={logo} alt="YoviLogo" />
        
      </div>
    </header>
  );
}
