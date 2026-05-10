import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { auth } from '../firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import './AuthPage.css';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('Login');
  const [identifier, setIdentifier] = useState(''); // Email or Mobile
  const [credential, setCredential] = useState(''); // Password or OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/');
      console.log("Google Sign In clicked");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      // LinkedIn provider requires custom setup in Firebase
      // const provider = new OAuthProvider('oidc.linkedin');
      // await signInWithPopup(auth, provider);
      console.log("LinkedIn Sign In clicked");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In a real app, you'd check if 'identifier' is an email or phone number
      // and use the appropriate Firebase Auth method.
      // For this example, we assume Email/Password if it's not OTP flow.
      if (activeTab === 'Login') {
        await signInWithEmailAndPassword(auth, identifier, credential);
        console.log("Login submitted", { identifier, credential });
      } else {
        await createUserWithEmailAndPassword(auth, identifier, credential);
        console.log("Sign up submitted", { identifier, credential });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = () => {
    console.log("Sending OTP to:", identifier);
    // Add Firebase Phone Auth logic here
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">

        {/* Header Section 
        <div className="auth-header">
          <div className="auth-logo-box">
            <Stethoscope size={28} color="white" />
          </div>
          <div className="auth-title-box">
            <h1>HRM Consultancy</h1>
            <p>Doctors Choice</p>
          </div>
          <div className="auth-menu-icon">
            <div className="menu-line"></div>
            <div className="menu-line"></div>
            <div className="menu-line"></div>
          </div>
        </div>*/}

        {/* Welcome Text */}
        <div className="auth-welcome">
          <h2>Sign Up / Log In</h2>
          <p>Join HRM Consultancy Doctors Choice platform</p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`tab-btn ${activeTab === 'Login' ? 'active' : ''}`}
            onClick={() => setActiveTab('Login')}
          >
            Login
          </button>
          <button
            className={`tab-btn ${activeTab === 'Sign Up' ? 'active' : ''}`}
            onClick={() => setActiveTab('Sign Up')}
          >
            Sign Up
          </button>
        </div>

        {/* Social Logins */}
        <div className="social-login-container">
          <button className="social-btn google-btn" onClick={handleGoogleSignIn} disabled={loading}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="social-icon" />
            Continue with Google
          </button>
          <button className="social-btn linkedin-btn" onClick={handleLinkedInSignIn} disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0A66C2" className="social-icon">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Continue with LinkedIn
          </button>
        </div>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Auth Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label>Email or Mobile Number</label>
            <input
              type="text"
              placeholder="Enter email or mobile"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password / OTP</label>
            <div className="input-with-button">
              <input
                type="password"
                placeholder="Enter OTP or Password"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                required
              />
              <button
                type="button"
                className="send-otp-btn"
                onClick={handleSendOTP}
              >
                Send OTP
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Processing...' : activeTab}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthPage;
