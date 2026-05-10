import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Header.css';

const Header = () => {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo-section" style={{textDecoration: 'none'}}>
          <div className="logo-box">
            <span className="logo-hrm">HRM</span>
            <span className="logo-subtext">HRM CONSULTANCY-DOCTORS CHOICE</span>
          </div>
          <div className="logo-text">
            <h1>HRM Doctors Choice</h1>
            <p>Premium Healthcare Network</p>
          </div>
        </Link>
        <nav className="nav-menu">
          <ul>
            <li><a href="/#services">Services</a></li>
            <li><a href="/#samples">Samples</a></li>
            <li><a href="/#hr-tools">HR Tools</a></li>
            <li><a href="/#find-doctor">Find Doctor</a></li>
          </ul>
          <Link to="/contact" className="btn-contact">Contact Us</Link>
          {user && (
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
