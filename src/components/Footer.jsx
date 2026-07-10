import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import './Footer.css';

const PhoneIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.19 2 2 0 012.08.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-.42a2 2 0 012.11.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const Footer = () => {
  const { user, hasRegistered, setHasRegistered } = useAuth();

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
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">

            {/* ── Brand + Contact Column ── */}
            <div className="footer-brand">
              <img src="/logo.jpeg" alt="HRM Consultancy Logo" className="footer-brand-logo" />
              <p className="footer-brand-name">HRM Doctors <span>Choice</span></p>
              <p className="footer-tagline">
                Connecting healthcare professionals, hospitals, and patients across India with trusted medical expertise.
              </p>
              <div className="footer-contact-info">
                <div className="footer-contact-row">
                  <PhoneIcon />
                  <a href="tel:+919879450072">+91 98794 50072</a>
                </div>
                <div className="footer-contact-row">
                  <MailIcon />
                  <a href="mailto:director@hrmconsultancydoctorschoices.com">
                    director@hrmconsultancydoctorschoices.com
                  </a>
                </div>
                <div className="footer-contact-row">
                  <MapPinIcon />
                  <span>India — Nationwide Network</span>
                </div>
              </div>
            </div>

            {/* ── Quick Links Column ── */}
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/find-doctor">Find Doctor</Link></li>
                <li><Link to="/hr-extractor">HR Tools</Link></li>
                <li><Link to="/blog">Blog</Link></li>
                <li><Link to="/samples">Samples</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/developers">Developers</Link></li>
              </ul>
            </div>

            {/* ── Support Column ── */}
            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/terms">Terms & Conditions</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                {user && (
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                )}
              </ul>
            </div>

            {/* ── Services Column ── */}
            <div className="footer-col">
              <h4>Our Services</h4>
              <ul>
                <li><Link to="/portal/doctor/register">Doctor Registration</Link></li>
                <li><Link to="/portal/hospital/register">Hospital Registration</Link></li>
                <li><Link to="/portal/hr/register">HR Registration</Link></li>
                <li><Link to="/portal/partner/register">Partner Registration</Link></li>
                <li><Link to="/portal/login">Portal Login</Link></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── Bottom Copyright Bar ── */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p className="footer-copyright">
              &copy; {new Date().getFullYear()} <strong>HRM Doctors Choice</strong>. All rights reserved.
            </p>
            <div className="footer-legal-links">
              <Link to="/privacy">Privacy Policy</Link>
              <div className="footer-legal-divider" />
              <Link to="/terms">Terms & Conditions</Link>
              <div className="footer-legal-divider" />
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
