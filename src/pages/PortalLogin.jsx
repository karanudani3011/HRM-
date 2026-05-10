import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Stethoscope, Users, Building2, HeartPulse, ArrowLeft } from 'lucide-react';
import './PortalLogin.css';

const PortalLogin = () => {
  const { type } = useParams();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getPortalDetails = () => {
    switch(type) {
      case 'doctor':
        return {
          title: 'Doctor Portal',
          subtitle: 'Sign in to manage your practice and patients.',
          icon: <Stethoscope size={32} color="white" />,
          color: 'var(--primary-red)'
        };
      case 'hr':
        return {
          title: 'HR Portal',
          subtitle: 'Sign in to access B2B leads and recruitment tools.',
          icon: <Users size={32} color="white" />,
          color: '#111827'
        };
      case 'hospital':
        return {
          title: 'Hospital Portal',
          subtitle: 'Sign in to manage your partner clinic network.',
          icon: <Building2 size={32} color="white" />,
          color: '#111827'
        };
      case 'patient':
        return {
          title: 'Patient Portal',
          subtitle: 'Sign in to book consultations and view records.',
          icon: <HeartPulse size={32} color="white" />,
          color: 'var(--primary-red)'
        };
      default:
        return {
          title: 'Portal Login',
          subtitle: 'Sign in to your account.',
          icon: <Users size={32} color="white" />,
          color: 'var(--primary-red)'
        };
    }
  };

  const details = getPortalDetails();

  return (
    <div className="portal-login-page">
      <div className="portal-login-container">
        
        <div className="portal-info-side" style={{ backgroundColor: details.color }}>
          <div className="info-content">
            <div className="info-icon-box">
              {details.icon}
            </div>
            <h1>{details.title}</h1>
            <p>{details.subtitle}</p>
          </div>
          <div className="info-overlay"></div>
        </div>

        <div className="portal-form-side">
          <div className="form-header">
            <Link to="/" className="back-link">
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to access the {details.title.toLowerCase()}.</p>
          </div>

          <form className="login-form">
            <div className="form-group">
              <label>Email Address / Username</label>
              <input type="text" placeholder="Enter your email" />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Enter your password" />
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>
            
            <button type="button" className="login-submit-btn" style={{ backgroundColor: details.color }}>
              Sign In
            </button>
          </form>
          
          <div className="form-footer">
            Don't have an account? <a href="#">Register here</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalLogin;
