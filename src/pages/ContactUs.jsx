import React, { useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import './ContactUs.css';

const ContactUs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact-page">
      <div className="contact-header-section">
        <div className="container">
          <h1>Get in Touch</h1>
          <p>We're here to help and answer any question you might have. We look forward to hearing from you.</p>
        </div>
      </div>

      <div className="container contact-container">
        <div className="contact-info-cards">
          <div className="contact-card">
            <div className="contact-icon-wrapper">
              <Phone size={24} />
            </div>
            <h3>Phone Number</h3>
            <p>Call us directly for immediate assistance.</p>
            <a href="tel:9879450072" className="contact-link">9879450072</a>
          </div>

          <div className="contact-card">
            <div className="contact-icon-wrapper">
              <Mail size={24} />
            </div>
            <h3>Email Address</h3>
            <p>Send us an email and we'll reply within 24 hours.</p>
            <a href="mailto:director@hrmconsultancydoctorschoices.com" className="contact-link">director@hrmconsultancydoctorschoices.com</a>
          </div>

          <div className="contact-card">
            <div className="contact-icon-wrapper">
              <MapPin size={24} />
            </div>
            <h3>Office Location</h3>
            <p>Visit our headquarters.</p>
            <address>
              HRM Consultancy<br />
              New Delhi, India 110001
            </address>
          </div>
        </div>

        <div className="contact-form-section">
          <div className="form-content-wrap">
            <h2>Send us a Message</h2>
            <p className="form-subtitle">Fill out the form below and our team will get back to you as soon as possible.</p>
            
            <form className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" placeholder="Enter your first name" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" placeholder="Enter your last name" />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="Enter your email address" />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <select>
                  <option value="">Select a topic</option>
                  <option value="doctor">Doctor Registration</option>
                  <option value="hr">HR Tools Inquiry</option>
                  <option value="hospital">Hospital Partner Program</option>
                  <option value="patient">Patient Support</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea rows="5" placeholder="How can we help you?"></textarea>
              </div>

              <button type="button" className="submit-message-btn">
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
