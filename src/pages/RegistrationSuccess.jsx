import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { CheckCircle2, Phone, Mail, Menu, X, FileCheck2, ClipboardCheck, PhoneCall } from 'lucide-react';
import '../components/TopBar.css';
import '../components/Header.css';
import '../components/Footer.css';
import './RegistrationSuccess.css';

/* ── Standard-style TopBar for success page ── */
const SuccessTopBar = () => {
  return (
    <div className="top-bar">
      <div className="container top-bar-content">
        <div className="contact-info">
          <a href="tel:9879450072" className="contact-item">
            <Phone size={14} className="contact-icon" />
            <span>9879450072</span>
          </a>
          <span className="divider">|</span>
          <a href="mailto:director@hrmconsultancydoctorschoices.com" className="contact-item">
            <Mail size={14} className="contact-icon" />
            <span>director@hrmconsultancydoctorschoices.com</span>
          </a>
        </div>
      </div>
    </div>
  );
};

/* ── Standard-style Header for success page ── */
const SuccessHeader = () => {
  const { user, setHasRegistered } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    try {
      if (user?.email) {
        localStorage.removeItem(`hasRegisteredService_${user.email.toLowerCase()}`);
      }
      await signOut(auth);
      setHasRegistered(false);
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
          <ul>
            <li><Link to="/find-doctor" onClick={closeMenu}>Find Doctor</Link></li>
            <li><Link to="/hr-extractor" onClick={closeMenu}>HR Tools</Link></li>
            <li><Link to="/blog" onClick={closeMenu}>Blog</Link></li>
            <li><Link to="/samples" onClick={closeMenu}>Samples</Link></li>
          </ul>
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

/* ── Standard-style Footer for success page ── */
const SuccessFooter = () => {
  const { user, setHasRegistered } = useAuth();

  const handleLogout = async () => {
    try {
      if (user?.email) {
        localStorage.removeItem(`hasRegisteredService_${user.email.toLowerCase()}`);
      }
      await signOut(auth);
      setHasRegistered(false);
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
          </div>
          <div className="link-group">
            <h3>Legal</h3>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
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

/* ── Main Success Page ── */
const RegistrationSuccess = () => {
  const location = useLocation();
  const formType = location.state?.formType || 'Your Registration';
  const { user, setHasRegistered } = useAuth();

  // Instantly mark the user as registered reactively in AuthContext on mount
  useEffect(() => {
    setHasRegistered(true);
    if (user?.email) {
      localStorage.setItem(`hasRegisteredService_${user.email.toLowerCase()}`, 'true');
    }
  }, [setHasRegistered, user]);

  return (
    <div className="reg-success-wrapper">
      <SuccessTopBar />
      <SuccessHeader />

      <div className="reg-success-page">
        {/* Animated background blobs */}
        <div className="success-blob blob-1"></div>
        <div className="success-blob blob-2"></div>

        <div className="success-container">
          {/* Success Icon */}
          <div className="success-icon-ring">
            <CheckCircle2 size={56} className="success-check-icon" />
          </div>

          {/* Heading */}
          <h1 className="success-title">Registration Successful! 🎉</h1>
          <p className="success-subtitle">
            <strong>{formType}</strong> has been submitted successfully.
            <br />
            Our team will review your details and contact you within <strong>24–48 hours</strong>.
          </p>

          {/* Info cards */}
          <div className="success-info-cards">
            <div className="success-info-card">
              <span className="info-card-icon">📋</span>
              <div>
                <h4>Credential Review</h4>
                <p>We are verifying your uploaded licenses, council registrations, and qualifications.</p>
              </div>
            </div>
            <div className="success-info-card">
              <span className="info-card-icon">📧</span>
              <div>
                <h4>Network Placement</h4>
                <p>Your profile is being positioned inside our premium healthcare network databases.</p>
              </div>
            </div>
            <div className="success-info-card">
              <span className="info-card-icon">📞</span>
              <div>
                <h4>Representative Call</h4>
                <p>A specialist will call you shortly to discuss onboarding steps and tool activation.</p>
              </div>
            </div>
          </div>

          <p className="success-contact-note">
            Questions? Call us at{' '}
            <a href="tel:9879450072" className="success-phone-link">9879450072</a>
            {' '}or email{' '}
            <a href="mailto:director@hrmconsultancydoctorschoices.com" className="success-phone-link">
              director@hrmconsultancydoctorschoices.com
            </a>
          </p>
        </div>
      </div>

      <SuccessFooter />
    </div>
  );
};

export default RegistrationSuccess;
