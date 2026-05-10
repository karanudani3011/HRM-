import React from 'react';
import { Phone, Mail } from 'lucide-react';
import './TopBar.css';

const TopBar = () => {
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

export default TopBar;
