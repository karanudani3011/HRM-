import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
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
              <li><a href="/#about">About Us</a></li>
              <li><a href="/#services">Services</a></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="link-group">
            <h3>Legal</h3>
            <ul>
              <li><a href="/#privacy">Privacy Policy</a></li>
              <li><a href="/#terms">Terms of Service</a></li>
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
