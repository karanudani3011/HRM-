import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addDoc(collection(db, 'serviceForms'), {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`, // For admin display
        formType: 'Contact Inquiry',
        createdAt: serverTimestamp()
      });
      
      setSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

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
            {submitted ? (
              <div className="submission-success">
                <div className="success-icon">✓</div>
                <h2>Message Sent!</h2>
                <p>Thank you for contacting us. Our team will get back to you shortly.</p>
                <button onClick={() => setSubmitted(false)} className="submit-message-btn">Send Another Message</button>
              </div>
            ) : (
              <>
                <h2>Send us a Message</h2>
                <p className="form-subtitle">Fill out the form below and our team will get back to you as soon as possible.</p>
                
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input 
                        type="text" 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="Enter your first name" 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input 
                        type="text" 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name" 
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address" 
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Subject</label>
                    <select 
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
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
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="5" 
                      placeholder="How can we help you?"
                      required
                    ></textarea>
                  </div>

                  {error && <div className="error-message">{error}</div>}

                  <button type="submit" className="submit-message-btn" disabled={loading}>
                    <Send size={18} /> {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

