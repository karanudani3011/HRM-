import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Header.css';

const Header = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hasRegistered = localStorage.getItem('hasRegisteredService') === 'true';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('hasRegisteredService');
      closeMenu();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to="/" className="logo-section" style={{ textDecoration: 'none' }}>
          <img src="/logo.jpeg" alt="HRM Consultancy Logo" className="brand-logo" />
          <div className="logo-text">
            <h1>HRM Doctors Choice</h1>
            <p>Premium Healthcare Network</p>
          </div>
        </Link>
        <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle Menu">
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`nav-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu}></div>

        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          {hasRegistered ? (
            <ul>
              <li><Link to="/find-doctor" onClick={closeMenu}>Find Doctor</Link></li>
              <li><Link to="/hr-extractor" onClick={closeMenu}>HR Tools</Link></li>
              <li><Link to="/blog" onClick={closeMenu}>Blog</Link></li>
              <li><Link to="/samples" onClick={closeMenu}>Samples</Link></li>
            </ul>
          ) : (
            <ul>
              <li><Link to="/blog" onClick={closeMenu}>Blog</Link></li>
              <li><Link to="/services" onClick={closeMenu}>Services</Link></li>
              <li><Link to="/samples" onClick={closeMenu}>Samples</Link></li>
              <li><Link to="/hr-extractor" onClick={closeMenu}>HR Tools</Link></li>
              <li><Link to="/find-doctor" onClick={closeMenu}>Find Doctor</Link></li>
              <li><Link to="/developers" onClick={closeMenu}>Developers</Link></li>
            </ul>
          )}
          <div className="nav-actions">
            <Link to="/contact" className="btn-contact" onClick={closeMenu}>Contact Us</Link>
            {user && (
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
