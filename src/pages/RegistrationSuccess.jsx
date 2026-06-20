import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2 } from 'lucide-react';
import './RegistrationSuccess.css';

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
    </div>
  );
};

export default RegistrationSuccess;
