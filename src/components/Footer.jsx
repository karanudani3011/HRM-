import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Footer.css';

const Footer = () => {
  const { user } = useAuth();
  const hasRegistered = localStorage.getItem('hasRegisteredService') === 'true';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('hasRegisteredService');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-logo">
          <img src="/logo.jpeg" alt="HRM Consultancy Logo" className="brand-logo footer-brand-logo" />
          <p>Connecting Healthcare Professionals across India.</p>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h3>Quick Links</h3>
            {hasRegistered ? (
              <ul>
                <li><Link to="/find-doctor">Find Doctor</Link></li>
                <li><Link to="/hr-extractor">HR Tools</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/samples">Samples</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                {user && (
                  <li>
                    <button 
                      onClick={handleLogout} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#aaaaaa', 
                        fontSize: '14px', 
                        cursor: 'pointer', 
                        padding: 0,
                        fontFamily: 'inherit',
                        transition: 'color 0.3s ease'
                      }}
                      onMouseOver={(e) => e.target.style.color = 'var(--primary-red)'}
                      onMouseOut={(e) => e.target.style.color = '#aaaaaa'}
                    >
                      Logout
                    </button>
                  </li>
                )}
              </ul>
            ) : (
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/developers">Developers</Link></li>
              </ul>
            )}
          </div>
          <div className="link-group">
            <h3>Legal</h3>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} HRM Doctors Choice. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
